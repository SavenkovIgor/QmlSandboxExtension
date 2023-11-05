function installVscodeToWasmMessageHandlers(instance) {
    window.addEventListener('message', (event) => {
        instance?.receiveJRpcFromExtension(JSON.stringify(event.data));
    });
}

function installWasmToVscodeMessageHandlers() {
    const vscode = window.acquireVsCodeApi();
    if (!window.receiveScreenshot) {
        window.receiveScreenshot = (screenshotData) => {
            vscode.postMessage({ type: 'screenshot', data: screenshotData });
        };
    }

    if (!window.addLog) {
        window.addLog = (level, file, functionName, line, msg) => {
            vscode.postMessage({ type: 'addLog', data: { level, file, functionName, line, msg } });
        };
    }
}
