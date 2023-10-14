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

        const showMenuCmd = vscode.commands.registerCommand(`${cmdPrefix}.toggleLiveUpdate`,
            () => {
                this.liveUpdate = !this.liveUpdate;
                this.redraw();
                this.showInfoMessage();
            }
        );

        context.subscriptions.push(this.statusBarItem, showMenuCmd);
    }

    private liveUpdateText() {
        return `${this.liveUpdate ? '$(check)' : '$(x)'} QML Live-update`;
    }

    private backgroundColor() {
        return this.liveUpdate ? '' : new vscode.ThemeColor('statusBarItem.warningBackground');
    }

    private showInfoMessage() {
        vscode.window.showInformationMessage(`Live-update ${this.liveUpdate ? 'enabled' : 'disabled'}`);
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
    }
}