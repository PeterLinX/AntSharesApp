namespace AntShares.Core
{
    export abstract class Blockchain
    {
        public static get SecondsPerBlock() { return 15; }
        public static get DecrementInterval() { return 2000000; }

        private static _MintingAmount = [8, 7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        public static get MintingAmount() { return Blockchain._MintingAmount; }

        private static _GenesisBlock: Block;
        public static get GenesisBlock()
        {
            if (Blockchain._GenesisBlock == null)
            {
                Blockchain._GenesisBlock = <Block>"000000000000000000000000000000000000000000000000000000000000000000000000f41bc036e39b0d6b0579c851c6fde83af802fa4e57bec0bc3365eae3abf43f8065fc8857000000001dac2b7c0000000059e75d652b5d3827bf04c165bbe9ef95cca4bf55010001510400001dac2b7c00000000400000455b7b226c616e67223a227a682d434e222c226e616d65223a22e5b08fe89a81e882a1227d2c7b226c616e67223a22656e222c226e616d65223a22416e745368617265227d5d0000c16ff28623000000da1745e9b549bd0bfa1a569971c77eba30cd5a4b0000000141406b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c2969a713acafff9250a06b1a0757b120949693cc4ac9aaa36a6ce229b16e809b5f4030100ac400001445b7b226c616e67223a227a682d434e222c226e616d65223a22e5b08fe89a81e5b881227d2c7b226c616e67223a22656e222c226e616d65223a22416e74436f696e227d5d0000c16ff286230008009f7fd096d37ed2c0e3f7f0cfc924beef4ffceb680000000141406b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c29623ece748e1269b71ece92508aa7a0dfc104dec7ed06c591e4253edc841a02ced030100ac01000000019b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc50000c16ff28623005fa99d93303775fe50ca119c327759313eccfa1c01000151".hexToBytes().asSerializable(Block);
            }
            return Blockchain._GenesisBlock;
        }

        private static _AntShare: RegisterTransaction;
        public static get AntShare(): RegisterTransaction
        {
            if (Blockchain._AntShare == null)
            {
                for (let i = 0; i < Blockchain.GenesisBlock.transactions.length; i++)
                    if (Blockchain.GenesisBlock.transactions[i].type == TransactionType.RegisterTransaction)
                    {
                        let asset = <RegisterTransaction>Blockchain.GenesisBlock.transactions[i];
                        if (asset.assetType == AssetType.AntShare)
                        {
                            Blockchain._AntShare = asset;
                            break;
                        }
                    }
            }
            return Blockchain._AntShare;
        }

        private static _AntCoin: RegisterTransaction;
        public static get AntCoin(): RegisterTransaction
        {
            if (Blockchain._AntCoin == null)
            {
                for (let i = 0; i < Blockchain.GenesisBlock.transactions.length; i++)
                    if (Blockchain.GenesisBlock.transactions[i].type == TransactionType.RegisterTransaction)
                    {
                        let asset = <RegisterTransaction>Blockchain.GenesisBlock.transactions[i];
                        if (asset.assetType == AssetType.AntCoin)
                        {
                            Blockchain._AntCoin = asset;
                            break;
                        }
                    }
            }
            return Blockchain._AntCoin;
        }

        private static _Default: Blockchain;
        public static get Default() { return Blockchain._Default; }
        public static registerBlockchain(blockchain: Blockchain): Blockchain
        {
            if (blockchain == null) throw new RangeError();
            return Blockchain._Default = blockchain;
        }

        public abstract getBestBlockHash(): PromiseLike<Uint256>;
        public abstract getBlock(hash: Uint256): PromiseLike<Block>;
        public abstract getBlock(index: number): PromiseLike<Block>;
        public abstract getBlockCount(): PromiseLike<number>;
        public abstract getBlockHash(index: number): PromiseLike<Uint256>;
        public abstract getTransaction(hash: Uint256): PromiseLike<Transaction>;
    }
}
