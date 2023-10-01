import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';


let disposables: vscode.Disposable[] = [];

let mainPanel: vscode.WebviewPanel | null = null;

let outputChannel: vscode.OutputChannel | null = null;

export function activate(context: vscode.ExtensionContext) {

    const qmlEngineDir = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

    outputChannel = vscode.window.createOutputChannel('Qml Sandbox');

    const qmlSandboxDisposable = vscode.commands.registerCommand('QmlSandboxExtension.openQmlSandbox', () => {
        if (mainPanel) {
            mainPanel.reveal();
            return;
        }

        mainPanel = createQmlPanel([qmlEngineDir]);

        vscode.commands.executeCommand('setContext', 'isQmlSandboxOpen', true);

        mainPanel.onDidDispose(() => {
            mainPanel = null;
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

        vscode.workspace.fs.readFile(indexHtmlPath).then(fileData => {
            if (!mainPanel) return;
            mainPanel.webview.html = prepareIndexHtmlContent(fileData.toString(), qmlEngineDir);
        });
    });

    const screenshotQmlDisposable = vscode.commands.registerCommand('QmlSandboxExtension.screenshotQml', () => {
        mainPanel?.webview.postMessage({type: 'screenshot'});
    });

    const editorChange = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!editor || !mainPanel) return;
        if (editor.document.languageId !== 'qml') return;

        updateWebviewContent(editor.document);
    });

    const textChange = vscode.workspace.onDidChangeTextDocument(event => {
        const activeEditor = vscode.window.activeTextEditor;

        if (!mainPanel) return;

        if (!activeEditor || activeEditor.document !== event.document) return;
        if (event.document.languageId !== 'qml') return;

        updateWebviewContent(event.document);
    });

    context.subscriptions.push(qmlSandboxDisposable, screenshotQmlDisposable, editorChange, textChange);
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

function updateWebviewContent(document: vscode.TextDocument) {
    mainPanel?.webview.postMessage({type: 'update', text: document.getText()});
}

function prepareIndexHtmlContent(html: string, qmlEngineDir: vscode.Uri): string {
    if (!mainPanel) return "";

    const qtLoaderJs = vscode.Uri.joinPath(qmlEngineDir, 'qtloader.js');
    const qtLogoSvg  = vscode.Uri.joinPath(qmlEngineDir, 'qtlogo.svg');

    // Replace paths for startup js script and logo svg
    html = html.replace('qtloader.js', mainPanel.webview.asWebviewUri(qtLoaderJs).toString());
    html = html.replace('qtlogo.svg', mainPanel.webview.asWebviewUri(qtLogoSvg).toString());

    // Add proper path prefix for loading QtWasmTemplate.js and QtWasmTemplate.wasm
    html = html.replace('vscode_extension_uri_qml_engine_path', mainPanel.webview.asWebviewUri(qmlEngineDir).toString());
    return html;
}

function screenshotSaveDir(): vscode.Uri {
    const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (workspaceFolderUri) return workspaceFolderUri;

    const document = vscode.window.activeTextEditor?.document;
    if (document && !document.isUntitled)
        return vscode.Uri.file(path.dirname(document.uri.fsPath));

    return vscode.Uri.file(os.homedir());
}

function saveScreenshot(pngData: string) {
    const savePathUri = screenshotSaveDir();

    let options = {
        defaultUri: vscode.Uri.joinPath(savePathUri, 'screenshot.png'),
        title: 'Save screenshot',
    }
    vscode.window.showSaveDialog(options).then(fileUri => {
        if (!fileUri) return;
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
