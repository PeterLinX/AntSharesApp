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
                Blockchain._GenesisBlock = <Block>"000000000000000000000000000000000000000000000000000000000000000000000000854f0d1fc6b4ebdd594132e399ac842976d7f5b2fc8a4dc68385766760e7714165fc8857000000001dac2b7c00000000f3812db982f3b0089a21a278988efeec6a027b250100015104001dac2b7c000000004000565b7b276c616e67273a277a682d434e272c276e616d65273a27e5b08fe89a81e882a128e6b58be8af9529277d2c7b276c616e67273a27656e272c276e616d65273a27416e74536861726528546573744e657429277d5d0000c16ff286230002a2d6adf934fe7f7e860ed48117e7590fd19db1ad018d15d5425fc5b3d6f11e74da1745e9b549bd0bfa1a569971c77eba30cd5a4b000000004001555b7b276c616e67273a277a682d434e272c276e616d65273a27e5b08fe89a81e5b88128e6b58be8af9529277d2c7b276c616e67273a27656e272c276e616d65273a27416e74436f696e28546573744e657429277d5d0000c16ff286230002a2d6adf934fe7f7e860ed48117e7590fd19db1ad018d15d5425fc5b3d6f11e749f7fd096d37ed2c0e3f7f0cfc924beef4ffceb6800000000011dac2b7c000001c9b4afd3375aa51e02531d5b2b5d9d1e0dad11b6f958ed6c86a4132da19d3ddc0000c16ff2862300197ff6783d512a740d42f4cc4f5572955fa44c9501000151".hexToBytes().asSerializable(Block);
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
