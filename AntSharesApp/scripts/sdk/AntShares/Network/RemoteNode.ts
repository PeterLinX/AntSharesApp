namespace AntShares.Network
{
    export class RemoteNode
    {
        constructor(private rpc: RPC.RpcClient) { }

        public relay(iv: Network.Inventory): PromiseLike<boolean>
        {
            return this.rpc.call("sendrawtransaction", [Uint8Array.fromSerializable(iv).toHexString()]);
        }
    }
}
