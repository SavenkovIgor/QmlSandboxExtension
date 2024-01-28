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

function normalizeColor(color) {
    if (color.startsWith('#')) {
        return color;
    }
    const errorColor = "#FF0000";
    if (color.startsWith('rgb')) {
        // Example: rgba(255, 255, 255, 0.07)",
        const left = color.indexOf('(');
        const right = color.indexOf(')');
        if (left === -1 || right === -1 || right < left) {
            return errorColor;
        }
        const rgb = color.substring(left + 1, right);
        const rgbValues = rgb.split(',');
        const len = rgbValues.length;
        if (len === 3 || len === 4) {
            const hexR = parseInt(rgbValues[0]).toString(16);
            const hexG = parseInt(rgbValues[1]).toString(16);
            const hexB = parseInt(rgbValues[2]).toString(16);

            const hasAlpha = len === 4;
            let hexA = "";
            if (hasAlpha) {
                const a = parseFloat(rgbValues[3]);
                if (0 < a && a <= 1) {
                    hexA = Math.round(a * 255).toString(16);
                } else {
                    hexA = a.toString(16);
                }
            }

            const ret = `#${hexA}${hexR}${hexG}${hexB}`;
            return ret;
        }
    }
    return errorColor;
}

function getTheme(vscodeColorKeys) {
    // https://code.visualstudio.com/api/references/theme-color
    const styles = getComputedStyle(document.querySelector('html'));
    const theme = {};
    for (const key of vscodeColorKeys) {
        const colorName = `--vscode-${key.replace('.', '-')}`;
        theme[key] = normalizeColor(styles.getPropertyValue(colorName));
    }
    return theme;
}

function sendWebViewTheme(vscodeColorKeys) {
    vscode.postMessage({
        method: 'ext.webViewThemeInfo',
        params: getTheme(vscodeColorKeys),
    });
}
