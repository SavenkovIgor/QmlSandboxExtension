import * as vscode from 'vscode';

let disposables: vscode.Disposable[] = [];

let mainPanel: vscode.WebviewPanel | null = null;

export function activate(context: vscode.ExtensionContext) {

    const qmlEngineDir = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

    const disposable = vscode.commands.registerCommand('QmlSandboxExtension.openQmlSandbox', () => {

        if (!mainPanel) {
            mainPanel = createQmlPanel([qmlEngineDir]);

            mainPanel.onDidDispose(() => {
                mainPanel = null;
            }, null, context.subscriptions);

            const indexHtmlPath = vscode.Uri.joinPath(qmlEngineDir, 'index.html');

            vscode.workspace.fs.readFile(indexHtmlPath).then(fileData => {
                if (!mainPanel) return;
                mainPanel.webview.html = prepareIndexHtmlContent(fileData.toString(), qmlEngineDir);
            });

        } else {
            mainPanel.reveal();
        }
    });

    const editorChange = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!editor || !mainPanel) return;

        const qmlFile = editor.document;
        if (qmlFile.languageId !== 'qml') return;

        updateWebviewContent(qmlFile.getText());
    });

    const textChange = vscode.workspace.onDidChangeTextDocument(event => {
        if (!mainPanel) return;

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document !== event.document) return;
        if (event.document.languageId !== 'qml') return;

        updateWebviewContent(event.document.getText());
    });

    context.subscriptions.push(disposable, editorChange, textChange);
}

function createQmlPanel(roots: vscode.Uri[]) {
    return vscode.window.createWebviewPanel(
        'QmlSandbox',
        'QML Sandbox',
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            localResourceRoots: roots
        }
    );
}

function updateWebviewContent(qmlFileContent: string) {
    if (!mainPanel) return;

    console.log('updateWebviewContent', qmlFileContent);
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

// This method is called when your extension is deactivated
export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}
