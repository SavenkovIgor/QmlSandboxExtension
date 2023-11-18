import * as vscode from 'vscode';
import { JRpcController } from './JRpcController';

export class QmlWebViewController {
    private defaultTitle = 'Qml Sandbox';
    private jRpcController = new JRpcController();
    public mainPanel: vscode.WebviewPanel;

    constructor(panel: vscode.WebviewPanel) {
        this.mainPanel = panel;
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
