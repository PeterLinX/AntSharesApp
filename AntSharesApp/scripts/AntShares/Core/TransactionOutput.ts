namespace AntShares.Core
{
    export class TransactionOutput
    {
        public index: number;
        public assetId: Uint8Array; //UInt256
        public value: Fixed8;
        public address: string;

        public static deserialize(json: TransactionOutputJson): TransactionOutput
        {
            let r = new TransactionOutput();
            r.index = json.n;
            r.assetId = (json.asset as string).hexToBytes().reverse();
            r.value = Fixed8.from64(json.low, json.high, json.value);
            r.address = json.address;
            return r;
        }
    }

    class TransactionOutputJson
    {
        n;
        asset;
        value;
        high;
        low;
        address;
    }
}