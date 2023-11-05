function installVscodeToWasmMessageHandlers(instance) {
    window.addEventListener('message', (event) => {
        instance?.receiveJRpcFromExtension(JSON.stringify(event.data));
    });
}

function installWasmToVscodeMessageHandlers() {
    const vscode = window.acquireVsCodeApi();

    if (!window.receiveJRpcFromQml) {
        window.receiveJRpcFromQml = (jRpcString) => {
            const jRpc = JSON.parse(jRpcString);
            vscode.postMessage(jRpc);
        };
    }
}
