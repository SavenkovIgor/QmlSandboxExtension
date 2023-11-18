import * as vscode from 'vscode';
import { JRpcController } from './JRpcController';

export class QmlWebViewController {
    private defaultTitle = 'Qml Sandbox';
    private jRpcController = new JRpcController();
    private qmlEngineDir: vscode.Uri;
    public mainPanel: vscode.WebviewPanel;

    constructor(qmlEngineDir: vscode.Uri) {
        this.qmlEngineDir = qmlEngineDir;
        this.mainPanel = vscode.window.createWebviewPanel(
            'qmlSandbox',
            this.defaultTitle,
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [qmlEngineDir]
            }
        );
        this.mainPanel.title = this.defaultTitle;
    }

    public receiveJRcpFromQml(jRpc: any) {
        this.jRpcController.receiveJRcpFromQml(jRpc);
    }

    public onNewSetDiagnostics(handler: Function) {
        this.jRpcController.setHandler('setDiagnostics', handler);
    }

    public onNewLog(handler: Function) {
        this.jRpcController.setHandler('addLog', handler);
    }

    public onNewSaveScreenshot(handler: Function) {
        this.jRpcController.setHandler('saveScreenshot', handler);
    }

    public loadHtml() {
        const indexHtmlPath = vscode.Uri.joinPath(this.qmlEngineDir, 'index.html');
        vscode.workspace.fs.readFile(indexHtmlPath).then(fileData => {
            let html = fileData.toString();
            // Inject webRoot into html
            const webRoot = this.mainPanel.webview.asWebviewUri(this.qmlEngineDir).toString();
            html = html.replace(/#{webRoot}/g, webRoot);
            this.mainPanel.webview.html = html;
        });
    }

    public makeScreenshot() {
        this.sendJRpc('makeScreenshot', []);
    }

    public setQml(filename: string, qmlSource: string) {
        // Set title of current file
        this.mainPanel.title = `${this.defaultTitle} - ${filename}`;
        this.sendJRpc('update', { file: filename, source: qmlSource });
    }

    // This is not exactly a 100% compatible with JRpc, because
    // it is executed in controlled environment, and we can be sure about
    // possible types of arguments, errors, etc.
    // It is compatible with JRpc in a sense that it uses the same
    // field names and structure of the message.
    // I hope compatibility will be improved in the future
    private sendJRpc(method: string, params: any) {
        const cmd = { method: method, params: params };
        this.mainPanel.webview.postMessage(cmd);
    }
}
