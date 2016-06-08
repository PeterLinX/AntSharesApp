namespace AntShares.Network.RPC
{
    export class RpcClient
    {
        constructor(private url = "http://localhost/") { }

        private static makeRequest(method: string, params: any[]): any
        {
            return { jsonrpc: "2.0", method: method, params: params, id: Math.random() };
        }

        private static send(url: string, request: any, callback: (response: any) => void): void
        {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("load", () => { callback(JSON.parse(xhr.responseText)); });
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-Type', 'application/json-rpc');
            xhr.send(JSON.stringify(request));
        }

        public call(method: string, params: any[], callback: (result: any) => void, onerror?: (error: any) => void): void
        {
            RpcClient.send(this.url, RpcClient.makeRequest(method, params), response =>
            {
                if (response.error && onerror)
                    onerror(response.error);
                else if (response.result !== undefined)
                    callback(response.result);
            });
        }

        public callBatch(batch: Array<{ method: string, params: any[] }>, callback: (results: any[]) => void, onerror?: (error: any) => void): void
        {
            let request = [];
            for (let i = 0; i < batch.length; i++)
                request.push(RpcClient.makeRequest(batch[i].method, batch[i].params));
            RpcClient.send(this.url, request, response =>
            {
                if (response.error && onerror)
                    onerror(response.error);
                else if (response.length > 0)
                {
                    let results = [];
                    for (let i = 0; i < response.length; i++)
                        results.push(response[i].result);
                    callback(results);
                }
            });
        }
    }
}
import RpcClient = AntShares.Network.RPC.RpcClient;