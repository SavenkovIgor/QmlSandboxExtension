
export class JRpcController {
    private handlers: Map<string, Function> = new Map();

    public setHandler(method: string, handler: Function) {
        this.handlers.set(method, handler);
    }

    public receiveJRcpFromQml(jRpc: any) {
        const handler = this.handlers.get(jRpc.method);
        if (handler) {
            handler(jRpc.params);
        } else {
            console.error(`Unknown message type: ${jRpc.method}`);
        }
    }
}

