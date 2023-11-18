import * as vscode from 'vscode';
import { JRpcController } from './JRpcController';

export class QmlWebViewController {
    private jRpcController: JRpcController;
    public mainPanel: vscode.WebviewPanel;

    constructor(panel: vscode.WebviewPanel) {
        this.mainPanel = panel;
        this.jRpcController = new JRpcController();
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
}
