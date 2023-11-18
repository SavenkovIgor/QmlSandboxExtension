import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { QmlStatusBar } from './qmlStatusBar';
import { JRpcController } from './JRpcController';

const extPrefix = 'QmlSandboxExtension';
const defaultTitle = 'Qml Sandbox';
let disposables: vscode.Disposable[] = [];
let mainPanel: vscode.WebviewPanel | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let qmlStatusBar: QmlStatusBar | null = null;
let diagnosticCollection: vscode.DiagnosticCollection | null = null;
const jRpcController = new JRpcController();

export function activate(context: vscode.ExtensionContext) {

    const qmlEngineDir = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

    qmlStatusBar = new QmlStatusBar(extPrefix, context);
    outputChannel = vscode.window.createOutputChannel(defaultTitle);

    const qmlSandboxDisposable = vscode.commands.registerCommand(`${extPrefix}.openQmlSandbox`, () => {
        if (mainPanel) {
            mainPanel.reveal();
            return;
        }

        mainPanel = createQmlPanel([qmlEngineDir]);

        vscode.commands.executeCommand('setContext', 'isQmlSandboxOpen', true);
        qmlStatusBar?.reset();
        qmlStatusBar?.show();

        mainPanel.onDidDispose(() => {
            mainPanel = null;
            qmlStatusBar?.hide();
            vscode.commands.executeCommand('setContext', 'isQmlSandboxOpen', false);
        }, null, context.subscriptions);

        mainPanel.webview.onDidReceiveMessage(jRpc => {
            receiveJRcpFromQml(jRpc);
        }, null, context.subscriptions);

        const indexHtmlPath = vscode.Uri.joinPath(qmlEngineDir, 'index.html');
        loadWebView(indexHtmlPath, qmlEngineDir);
    });

    const screenshotQmlDisposable = vscode.commands.registerCommand(`${extPrefix}.screenshotQml`, () => {
        sendJRpcToQml('makeScreenshot', []);
    });

    const updateWebViewCmd = vscode.commands.registerCommand(`${extPrefix}.updateWebView`, () => {
        const activeEditor = currentEditor();
        if (activeEditor) {
            updateWebviewContent(activeEditor.document, true);
        }
    });

    const editorChange = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateWebviewContent(editor.document, true);
        }
    });

    const textChange = vscode.workspace.onDidChangeTextDocument(event => {
        // Ignore empty changes
        if (event.contentChanges.length === 0) {
            return;
        }
        const activeEditor = currentEditor();
        if (activeEditor && activeEditor.document === event.document) {
            updateWebviewContent(event.document, false);
        }
    });

    jRpcController.addHandler('setDiagnostics', setDiagnostics);
    jRpcController.addHandler('addLog', addLogOrDiagnostic);
    jRpcController.addHandler('saveScreenshot', saveScreenshot);

    diagnosticCollection = vscode.languages.createDiagnosticCollection(defaultTitle);

    context.subscriptions.push(qmlSandboxDisposable);
    context.subscriptions.push(screenshotQmlDisposable);
    context.subscriptions.push(updateWebViewCmd);
    context.subscriptions.push(editorChange);
    context.subscriptions.push(textChange);
}

function currentEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor;
}

function isQmlDocument(document: vscode.TextDocument) {
    return document.languageId === 'qml';
}

function currentQmlDocument(): vscode.TextDocument | undefined {
    const editor = currentEditor();
    if (editor && isQmlDocument(editor.document)) {
        return editor.document;
    }
    return undefined;
}

function currentQmlFilename(): string {
    const document = currentQmlDocument();
    return document ? path.basename(document.fileName) : '';
}

function createQmlPanel(roots: vscode.Uri[]) {
    return vscode.window.createWebviewPanel(
        'qmlSandbox',
        defaultTitle,
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            localResourceRoots: roots
        }
    );
}

function updateWebviewContent(document: vscode.TextDocument, force: boolean) {
    if (!mainPanel || !isQmlDocument(document)) {
        return;
    }
    if (qmlStatusBar?.isLiveUpdate() || force) {
        const filename = currentQmlFilename();
        // Set title of current file
        mainPanel.title = `${defaultTitle} - ${filename}`;
        // Clean up diagnostics
        diagnosticCollection?.delete(document.uri);
        sendJRpcToQml('update', {
            file: filename,
            source: document.getText(),
        });
    }
}

function loadWebView(indexHtmlPath: vscode.Uri, qmlEngineDir: vscode.Uri) {
    vscode.workspace.fs.readFile(indexHtmlPath).then(fileData => {
        if (!mainPanel) {
            return;
        }

        mainPanel.webview.html = injectWebRoot(fileData.toString(), qmlEngineDir);
    });
}

function injectWebRoot(html: string, webRootUri: vscode.Uri): string {
    if (mainPanel) {
        const webRoot = mainPanel.webview.asWebviewUri(webRootUri).toString();
        return html.replace(/#{webRoot}/g, webRoot);
    }
    return "";
}

function defaultScreenshotDir(): vscode.Uri {
    const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (workspaceFolderUri) {
        return workspaceFolderUri;
    }

    const document = currentQmlDocument();
    if (document && !document.isUntitled) {
        return vscode.Uri.file(path.dirname(document.uri.fsPath));
    }

    return vscode.Uri.file(os.homedir());
}

function saveScreenshot(pngData: string) {
    let options = {
        defaultUri: vscode.Uri.joinPath(defaultScreenshotDir(), 'screenshot.png'),
        title: 'Save screenshot',
    };
    vscode.window.showSaveDialog(options).then(fileUri => {
        if (!fileUri) {
            return;
        }
        vscode.workspace.fs.writeFile(fileUri, Buffer.from(pngData, 'base64')).then(() => {
            vscode.window.showInformationMessage(`Screenshot saved to ${fileUri.fsPath}`);
        });
    });
}

function qmlErrorLevelToVSCode(level: string): vscode.DiagnosticSeverity {
    // Remove all trailing and leading whitespace
    level = level.replace(/^\s+|\s+$/g, '');
    switch (level) {
        case 'ERROR':
            return vscode.DiagnosticSeverity.Error;
        case 'WARNING':
            return vscode.DiagnosticSeverity.Warning;
        case 'INFO':
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Hint;
    }
}

function createDiagnostic(line: number, column: number, level: string, message: string): vscode.Diagnostic {
    const start = new vscode.Position(line - 1, column - 1);
    const range = new vscode.Range(start, start);
    const vscodeLevel = qmlErrorLevelToVSCode(level);
    return new vscode.Diagnostic(range, message, vscodeLevel);
}

function addDiagnosticsToPanel(uri: vscode.Uri, diags: vscode.Diagnostic[]) {
    if (!diagnosticCollection) {
        return;
    }
    const currentDiagnostics = diagnosticCollection.get(uri);
    const newDiagnostics = currentDiagnostics ? [...currentDiagnostics, ...diags] : diags;
    diagnosticCollection.set(uri, newDiagnostics);
}

function setDiagnostics(diagnosticData: any) {
    const currentFileUri = currentQmlDocument()?.uri;
    if (!diagnosticCollection || !currentFileUri) {
        return;
    }

    let diagnostics: vscode.Diagnostic[] = [];
    diagnosticData.forEach((diagnostic: any) => {
        const { level, fileName, functionName, lineNumber, columnNumber, message } = diagnostic;
        diagnostics.push(createDiagnostic(lineNumber, columnNumber, level, message));
    });
    addDiagnosticsToPanel(currentFileUri, diagnostics);
}

function addLogOrDiagnostic(logData: any) {
    const filename = currentQmlFilename();
    let { message } = logData;
    // if message starts with current filename, it is diagnostic
    if (message.startsWith(filename)) {
        addDiagnosticFromLog(logData);
    } else {
        addQmlLog(logData);
    }
}

function addDiagnosticFromLog(logData: any) {
    const uri = currentQmlDocument()?.uri;
    if (!diagnosticCollection || !uri) {
        return;
    }

    const { type, line, message } = logData;
    const diag = createDiagnostic(line, 1, type, message);
    addDiagnosticsToPanel(uri, [diag]);
}

function addQmlLog(logData: any) {
    let {type, line, file, functionName, category,  message} = logData;
    const timestamp = (new Date()).toISOString().substring(11, 23);
    file = file ? file : '';
    category = category ? category : '';
    functionName = functionName ? functionName : '';
    const logLine = `[${timestamp}:${category}:${type}:${file}(${line}) ${functionName}] ${message}`;
    addLog(logLine);
}

function addLog(line: string) {
    outputChannel?.appendLine(line);
    outputChannel?.show(true);
}

// This is not exactly a 100% compatible with JRpc, because
// it is executed in controlled environment, and we can be sure about
// possible types of arguments, errors, etc.
// It is compatible with JRpc in a sense that it uses the same
// field names and structure of the message.
// I hope compatibility will be improved in the future
function sendJRpcToQml(method: string, params: any) {
    const cmd = { method: method, params: params };
    mainPanel?.webview.postMessage(cmd);
}

function receiveJRcpFromQml(jRpc: any) {
    jRpcController.receiveJRcpFromQml(jRpc);
}

// This method is called when your extension is deactivated
export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}
