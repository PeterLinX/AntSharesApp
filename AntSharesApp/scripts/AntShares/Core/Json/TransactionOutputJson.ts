namespace AntShares.Core
{
    export class TransactionOutputJson
    {
        private n: number;
        private asset: string;
        private value: string;
        private high: number;
        private low: number;
        private address: string;

        public deserialize(): TransactionOutput
        {
            let r = new TransactionOutput();
            r.index = this.n;
            r.assetId = this.asset.hexToBytes().reverse();
            r.value = Fixed8.from64(this.low, this.high, this.value);
            r.address = this.address;
            return r;
        }
    }
}