namespace AntShares.Core
{
    export class TransactionInputJson
    {
        private txid: string;
        private vout: number;

        public deserialize(): TransactionInput
        {
            return new TransactionInput(this.txid, this.vout);
        }
    }
}