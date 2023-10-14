import * as vscode from 'vscode';

export class QmlStatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private liveUpdate: boolean = true;

    constructor(cmdPrefix: string, context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 8);
        this.statusBarItem.text = this.liveUpdateText();
        this.statusBarItem.backgroundColor = this.backgroundColor();
        this.statusBarItem.tooltip = 'Update qml webview on each code edit. Click to toggle.';
        this.statusBarItem.command = `${cmdPrefix}.toggleLiveUpdate`;

        this.updateContext();

        const showMenuCmd = vscode.commands.registerCommand(`${cmdPrefix}.toggleLiveUpdate`,
            () => {
                this.toggleLiveUpdate();
                this.redraw();
                this.showInfoMessage();
            }
        );

        context.subscriptions.push(this.statusBarItem, showMenuCmd);
    }

    private liveUpdateText() {
        return `${this.isLiveUpdate() ? '$(check)' : '$(x)'} QML Live-update`;
    }

    private backgroundColor() {
        return this.isLiveUpdate() ? '' : new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    private showInfoMessage() {
        const msg = `QML WebView live updating is ${this.isLiveUpdate() ? 'enabled' : 'disabled'}`;
        vscode.window.showInformationMessage(msg);
    }

    public show() {
        this.statusBarItem.show();
    }

    public hide() {
        this.statusBarItem.hide();
    }

    public redraw() {
        this.statusBarItem.text = this.liveUpdateText();
        this.statusBarItem.backgroundColor = this.backgroundColor();
        this.statusBarItem.show();
    }

    public isLiveUpdate() {
        return this.liveUpdate;
    }

    public reset() {
        this.liveUpdate = true;
        this.updateContext();
    }

    private toggleLiveUpdate() {
        this.liveUpdate = !this.liveUpdate;
        this.updateContext();
    }

    private updateContext() {
        vscode.commands.executeCommand('setContext', 'isQmlLiveUpdateEnabled', this.isLiveUpdate());
    }
}