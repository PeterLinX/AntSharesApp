namespace AntShares
{
    export class Global
    {
        public static Wallet: Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient = new Network.RPC.RpcClient("https://seed2.antshares.org:10331/");
        public static Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
        public static Node = new Network.RemoteNode(Global.RpcClient);
    }
}
