namespace AntShares
{
    export class Global
    {
        public static Wallet: AntShares.Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
        public static Blockchain = AntShares.Core.Blockchain.registerBlockchain(new AntShares.Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
    }
}
