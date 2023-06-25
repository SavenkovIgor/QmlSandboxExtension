import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('QmlSandboxExtension.openQmlSandbox', () => {

		const qmlEngineFolder = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine');

		const panel = vscode.window.createWebviewPanel(
			'QmlSandbox',
			'QML Sandbox',
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				localResourceRoots: [qmlEngineFolder]
			}
		);

		// Disk paths
		const qtLoaderJs         = vscode.Uri.file(path.join(context.extensionPath, 'wasmQmlEngine', 'qtloader.js')); 
		const qtLogoSvg          = vscode.Uri.file(path.join(context.extensionPath, 'wasmQmlEngine', 'qtlogo.svg'));

		const indexHtmlPath = vscode.Uri.joinPath(context.extensionUri, 'wasmQmlEngine', 'index.html');
		let htmlContent = fs.readFileSync(indexHtmlPath.fsPath, 'utf8');

		// Replace paths for startup js script and logo svg
		htmlContent = htmlContent.replace('qtloader.js',         panel.webview.asWebviewUri(qtLoaderJs).toString());
		htmlContent = htmlContent.replace('qtlogo.svg',          panel.webview.asWebviewUri(qtLogoSvg).toString());
		
		// Add proper path prefix for loading QtWasmTemplate.js and QtWasmTemplate.wasm
		htmlContent = htmlContent.replace('vscode_extension_uri_qml_engine_path', panel.webview.asWebviewUri(qmlEngineFolder).toString());

		panel.webview.html = htmlContent;
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
