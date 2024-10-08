import * as vscode from 'vscode';
import { JRpcController } from './JRpcController';

export enum ViewMode {
    none = 'none',
    overdraw = 'overdraw',
    batches = 'batches',
    clip = 'clip',
}

export class QmlWebView {
    private defaultTitle = 'Qml Sandbox';
    private jRpcController = new JRpcController();
    private qmlEngineDir: vscode.Uri;
    private disposeHandler: Function = () => { };
    private view: vscode.WebviewPanel;
    private viewMode: ViewMode = ViewMode.none;
    // https://code.visualstudio.com/api/references/theme-color
    private vscodeColorKeys: string[] = [
        'editor.background',
        'focusBorder',
        'foreground',
        'textLink.foreground',
        'input.background',
        'button.background',
        'button.foreground',
        'button.hoverBackground',
    ];

    constructor(qmlEngineDir: vscode.Uri, subscriptions: vscode.Disposable[], mode: ViewMode = ViewMode.none) {
        this.qmlEngineDir = qmlEngineDir;
        this.view = vscode.window.createWebviewPanel(
            'qmlSandbox',
            this.defaultTitle,
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [qmlEngineDir]
            }
        );
        this.viewMode = mode;

        this.view.webview.onDidReceiveMessage(jRpc => {
            this.jRpcController.receiveJRcpFromQml(jRpc);
        }, null, subscriptions);

        this.view.onDidChangeViewState(event => {
            const isActive = event.webviewPanel.active;
            vscode.commands.executeCommand('setContext', 'QmlSandbox.isActive', isActive);
        });

        this.jRpcController.setHandler('ext.qtLoaded', this.onQtLoaded.bind(this));
        this.jRpcController.setHandler('ext.qmlLoaded', this.onQmlLoaded.bind(this));
        this.jRpcController.setHandler('ext.webViewThemeInfo', this.sendColorThemeToQml.bind(this));

        vscode.commands.executeCommand('setContext', 'QmlSandbox.isOpen', true);

        this.view.onDidDispose(() => {
            vscode.commands.executeCommand('setContext', 'QmlSandbox.isOpen', false);
            this.disposeHandler();
        }, null, subscriptions);
    }

    public onNewSetDiagnostics(handler: Function) {
        this.jRpcController.setHandler('ext.setDiagnostics', handler);
    }

    public onNewLog(handler: Function) {
        this.jRpcController.setHandler('ext.addLog', handler);
    }

    public onNewSaveScreenshot(handler: Function) {
        this.jRpcController.setHandler('ext.saveScreenshot', handler);
    }

    public onOpenExample(handler: Function) {
        this.jRpcController.setHandler('ext.openExample', handler);
    }

    public onDispose(handler: Function) {
        this.disposeHandler = handler;
    }

    public loadHtml() {
        const indexHtmlPath = vscode.Uri.joinPath(this.qmlEngineDir, 'index.html');
        vscode.workspace.fs.readFile(indexHtmlPath).then(fileData => {
            let html = fileData.toString();
            // Inject webRoot into html
            const webRoot = this.view.webview.asWebviewUri(this.qmlEngineDir).toString();
            html = html.replace(/#{webRoot}/g, webRoot);
            this.view.webview.html = html;
        });
    }

    public currentViewMode(): ViewMode {
        return this.viewMode;
    }

    public reveal() {
        this.view.reveal();
    }

    public makeScreenshot() {
        this.sendJRpc('qml.makeScreenshot', []);
    }

    public sendVisualizeMode() {
        this.sendJRpc('qt.setVisualizeMode', this.viewMode);
    }

    public setQml(filename: string, qmlSource: string) {
        // Set title of current file
        this.view.title = `${this.defaultTitle} - ${filename}`;
        this.sendJRpc('qml.update', { file: filename, source: qmlSource });
    }

    public dispose() {
        this.view.dispose();
    }

    private onQtLoaded() {
        this.sendVisualizeMode();
        this.sendJRpc('qt.initQml', {});
    }

    private onQmlLoaded() {
        this.requestWebViewTheme();
    }

    private requestWebViewTheme() {
        this.sendJRpc('webView.getTheme', this.vscodeColorKeys);
    }

    private sendColorThemeToQml(theme: any) {
        this.sendJRpc('qml.setTheme', JSON.stringify(theme));
    }

    // This is not exactly a 100% compatible with JRpc, because
    // it is executed in controlled environment, and we can be sure about
    // possible types of arguments, errors, etc.
    // It is compatible with JRpc in a sense that it uses the same
    // field names and structure of the message.
    // I hope compatibility will be improved in the future
    private sendJRpc(method: string, params: any) {
        const cmd = { method: method, params: params };
        this.view.webview.postMessage(cmd);
    }
}
