import * as vscode from 'vscode';

let disposables: vscode.Disposable[] = [];

let mainPanel: vscode.WebviewPanel | null = null;

export function activate(context: vscode.ExtensionContext) {

    const qmlEngineDir = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

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
            if (message?.type === 'screenshot') {
                // Save as png file
                const savePathUri = screenshotRootPath();

                if (!savePathUri) {
                    vscode.window.showErrorMessage('Cannot save screenshot');
                    return;
                }

                let options = {
                    defaultUri: vscode.Uri.joinPath(savePathUri, 'screenshot.png'),
                    title: 'Save screenshot',
                }
                vscode.window.showSaveDialog(options).then(fileUri => {
                    if (!fileUri) return;
                    vscode.workspace.fs.writeFile(fileUri, Buffer.from(message.data, 'base64')).then(() => {
                        vscode.window.showInformationMessage('Screenshot saved');
                    });
                });
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
        'QML Sandbox',
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

function screenshotRootPath(): vscode.Uri | undefined {
    let savePathUri = vscode.workspace.workspaceFolders?.[0].uri;
    if (!savePathUri) {
        const path = require('path');
        const activePath = vscode.window.activeTextEditor?.document.uri;
        // Take parent folder of active file
        savePathUri = activePath ? vscode.Uri.file(path.dirname(activePath.fsPath)) : undefined;
    }

    if (!savePathUri) {
        const os = require('os');
        savePathUri = vscode.Uri.file(os.homedir());
    }

    return savePathUri;
}

// This method is called when your extension is deactivated
export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}
