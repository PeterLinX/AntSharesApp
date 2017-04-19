namespace AntShares
{
    export class Global
    {
        public static isMainNet: boolean = true;
        public static isConnected: boolean = false;
        public static reConnectMultiplier: number = 15;
        //MainNet
        public static mainHttpNetList: string[] = ["http://seed2.antshares.org:10332"];
        public static mainHttpsNetList: string[] = ["https://seed2.antshares.org:10331", "https://seed8.antshares.org:10331"];
        //TestNet
        public static testNetList: string[] = ["http://seed2.antshares.org:20332"];
        
        public static Wallet: Implementations.Wallets.IndexedDB.IndexedDBWallet;
        public static RpcClient: Network.RPC.RpcClient;
        public static Blockchain: Core.Blockchain;
        public static Node: Network.RemoteNode;


        public static chooseNode() {
            let start = new Date().getTime();
            let seed2 = new Network.RPC.RpcClient("https://seed2.antshares.org:10331/");
            let seed8 = new Network.RPC.RpcClient("https://seed8.antshares.org:10331");
            $("#seed").text("中国上海 https://seed2.antshares.org:10331");
            new Implementations.Blockchains.RPC.RpcBlockchain(seed2).getBlockCount().then(result => {
                let end = new Date().getTime();
                let timeSpan = end - start;
                $("#seed2").text(timeSpan);

                let start2 = new Date().getTime();
                new Implementations.Blockchains.RPC.RpcBlockchain(seed8).getBlockCount().then(result => {
                    let end2 = new Date().getTime();
                    let timeSpan2 = end2 - start2;
                    $("#seed8").text(timeSpan2);

                    if (timeSpan2 < timeSpan) {
                        Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(seed8));
                        $("#seed").text("英国伦敦 https://seed8.antshares.org:10331");
                    }
                });

            });
        }
    }
    
}
