function installVscodeToWasmMessageHandlers(instance) {
    window.addEventListener('message', (event) => {
        switch (event.data.type) {
            case 'update':
                instance?.newCodeHandler(event.data.text);
                break;
            case 'screenshot':
                instance?.screenshotHandler();
                break;
            default:
                console.error(`Unknown message type: ${event.data.type}`);
        }
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
