import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { QmlStatusBar } from './qmlStatusBar';

const extPrefix = 'QmlSandboxExtension';
let disposables: vscode.Disposable[] = [];
let mainPanel: vscode.WebviewPanel | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let qmlStatusBar: QmlStatusBar | null = null;

export function activate(context: vscode.ExtensionContext) {

    const qmlEngineDir = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

    qmlStatusBar = new QmlStatusBar(extPrefix, context);
    outputChannel = vscode.window.createOutputChannel('Qml Sandbox');

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

        mainPanel.webview.onDidReceiveMessage(message => {
            switch (message?.type) {
                case 'screenshot':
                    saveScreenshot(message.data);
                    break;

                case 'addLog':
                    addQmlLog(message.data);
                    break;

                default:
                    console.warn('Unknown message type', message?.type);
                    break;
            }
        }, null, context.subscriptions);

        const indexHtmlPath = vscode.Uri.joinPath(qmlEngineDir, 'index.html');
        const qtWasmTemplateJsPath = vscode.Uri.joinPath(qmlEngineDir, 'QtWasmTemplate.js');

        // NOTE: Very dirty hack to make QtWasmTemplate.js work with vscode webview
        // Rewrite QtWasmTemplate.wasm path in QtWasmTemplate.js so it can be loaded from vscode webview
        // The only reason we need to do this is because this file is obfuscated and automatically generated
        vscode.workspace.fs.readFile(qtWasmTemplateJsPath).then(fileData => {
            if (!mainPanel) {
                return;
            }

            const wasmPath = mainPanel.webview.asWebviewUri(vscode.Uri.joinPath(qmlEngineDir, 'QtWasmTemplate.wasm'));
            // To avoid double replacement, we need to replace the it with quoted string
            const replacedData = fileData.toString().replace('"QtWasmTemplate.wasm"', `"${wasmPath}"`);

            vscode.workspace.fs.writeFile(qtWasmTemplateJsPath, Buffer.from(replacedData)).then(() => {
                loadWebView(indexHtmlPath, qmlEngineDir);
            });
        });
    });

    const screenshotQmlDisposable = vscode.commands.registerCommand(`${extPrefix}.screenshotQml`, () => {
        mainPanel?.webview.postMessage({type: 'screenshot'});
    });

    const updateWebViewCmd = vscode.commands.registerCommand(`${extPrefix}.updateWebView`, () => {
        const activeEditor = vscode.window.activeTextEditor;
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
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document === event.document) {
            updateWebviewContent(event.document, false);
        }
    });

    context.subscriptions.push(qmlSandboxDisposable);
    context.subscriptions.push(screenshotQmlDisposable);
    context.subscriptions.push(updateWebViewCmd);
    context.subscriptions.push(editorChange);
    context.subscriptions.push(textChange);
}

function createQmlPanel(roots: vscode.Uri[]) {
    return vscode.window.createWebviewPanel(
        'qmlSandbox',
        'Qml Sandbox',
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            localResourceRoots: roots
        }
    );
}

function isQmlDocument(document: vscode.TextDocument) {
    return document.languageId === 'qml';
}

function updateWebviewContent(document: vscode.TextDocument, force: boolean) {
    if (!mainPanel || !isQmlDocument(document)) {
        return;
    }
    if (qmlStatusBar?.isLiveUpdate() || force) {
        mainPanel?.webview.postMessage({type: 'update', text: document.getText()});
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

    const document = vscode.window.activeTextEditor?.document;
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

function addQmlLog(logData: any) {
    const {level, file, functionName, line, msg} = logData;
    const timestamp = (new Date()).toISOString().substring(11, 23);
    const logLine = `[${timestamp}:${level}:${file}(${line}) ${functionName}] ${msg}`;
    addLog(logLine);
}

function addLog(line: string) {
    outputChannel?.appendLine(line);
    outputChannel?.show(true);
}

// This method is called when your extension is deactivated
export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}
