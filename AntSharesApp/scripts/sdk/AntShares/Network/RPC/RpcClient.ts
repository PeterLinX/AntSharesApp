namespace AntShares.Network.RPC
{
    export class RpcClient
    {
        constructor(private url = "http://localhost/") { }

        private static makeRequest(method: string, params: any[]): any
        {
            return { jsonrpc: "2.0", method: method, params: params, id: Math.random() };
        }

        private static send(url: string, request: any): PromiseLike<any>
        {
            return new Promise((resolve, reject) =>
            {
                let xhr = new XMLHttpRequest();
                xhr.addEventListener("load", () => { resolve(JSON.parse(xhr.responseText)); });
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-Type', 'application/json-rpc');
                xhr.send(JSON.stringify(request));
            });
        }

        public call(method: string, params: any[]): PromiseLike<any>
        {
            return RpcClient.send(this.url, RpcClient.makeRequest(method, params)).then(response =>
            {
                return new Promise((resolve, reject) =>
                {
                    if (response.error !== undefined)
                        reject(response.error);
                    else
                        resolve(response.result);
                });
            });
        }

        public callBatch(batch: Array<{ method: string, params: any[] }>): PromiseLike<any[]>
        {
            let request = [];
            for (let i = 0; i < batch.length; i++)
                request.push(RpcClient.makeRequest(batch[i].method, batch[i].params));
            return RpcClient.send(this.url, request).then(response =>
            {
                return new Promise((resolve, reject) =>
                {
                    if (response.error !== undefined)
                        reject(response.error);
                    else
                    {
                        let results = [];
                        for (let i = 0; i < response.length; i++)
                            results.push(response[i].result);
                        resolve(results);
                    }
                });
            });
        }
    }
}
