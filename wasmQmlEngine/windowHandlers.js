function installVscodeToWasmMessageHandlers(instance) {
    window.addEventListener('message', (event) => {
        const handlers = {
            update: ({ text }) => { instance?.newCodeHandler(text); },
            screenshot: () => { instance?.screenshotHandler(); }
        };

        const handler = handlers[event.data.type];

        console.assert(handler, `Unknown message type: ${event.data.type}`);
        handler?.(event.data);
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