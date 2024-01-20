const vscode = window.acquireVsCodeApi();

function installVscodeToWasmMessageHandlers(instance) {
    window.addEventListener('message', (event) => {
        if (event.data.method === 'webView.getTheme') {
            sendWebViewTheme(event.data.params);
        } else {
            instance?.receiveJRpcFromExtension(JSON.stringify(event.data));
        }
    });
}

function installWasmToVscodeMessageHandlers() {
    if (!window.receiveJRpcFromQml) {
        window.receiveJRpcFromQml = (jRpcString) => {
            const jRpc = JSON.parse(jRpcString);
            vscode.postMessage(jRpc);
        };
    }
}

function getTheme(vscodeColorKeys) {
    // https://code.visualstudio.com/api/references/theme-color
    const styles = getComputedStyle(document.querySelector('html'));
    const theme = {};
    for (const key of vscodeColorKeys) {
        const colorName = `--vscode-${key.replace('.', '-')}`;
        theme[key] = styles.getPropertyValue(colorName);
    }
    return theme;
}

function sendWebViewTheme(vscodeColorKeys) {
    vscode.postMessage({
        method: 'ext.webViewThemeInfo',
        params: getTheme(vscodeColorKeys),
    });
}
