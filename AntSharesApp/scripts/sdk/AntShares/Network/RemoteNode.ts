namespace AntShares.Network
{
    export class RemoteNode
    {
        constructor(private rpc: RPC.RpcClient) { }

        public relay(tx: Core.Transaction): PromiseLike<boolean>
        {
            return this.rpc.call("sendrawtransaction", [Uint8Array.fromSerializable(tx).toHexString()]);
        }
    }
}
