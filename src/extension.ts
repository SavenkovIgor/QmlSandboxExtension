import * as vscode from 'vscode';

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('QmlSandboxExtension.openQmlSandbox', () => {

        const qmlEngineFolder = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');


        const indexHtmlPath = vscode.Uri.joinPath(qmlEngineFolder, 'index.html');

        vscode.workspace.fs.readFile(indexHtmlPath).then((fileData) => {
            let htmlContent = fileData.toString();

            // Disk paths
            const qtLoaderJs = vscode.Uri.joinPath(qmlEngineFolder, 'qtloader.js');
            const qtLogoSvg  = vscode.Uri.joinPath(qmlEngineFolder, 'qtlogo.svg');

            const panel = createQmlPanel([qmlEngineFolder]);

            // Replace paths for startup js script and logo svg
            htmlContent = htmlContent.replace('qtloader.js', panel.webview.asWebviewUri(qtLoaderJs).toString());
            htmlContent = htmlContent.replace('qtlogo.svg', panel.webview.asWebviewUri(qtLogoSvg).toString());

            // Add proper path prefix for loading QtWasmTemplate.js and QtWasmTemplate.wasm
            htmlContent = htmlContent.replace('vscode_extension_uri_qml_engine_path', panel.webview.asWebviewUri(qmlEngineFolder).toString());

            panel.webview.html = htmlContent;
        });
    });

    context.subscriptions.push(disposable);
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

// This method is called when your extension is deactivated
export function deactivate() {
    disposables.forEach((disposable) => disposable.dispose());
}
