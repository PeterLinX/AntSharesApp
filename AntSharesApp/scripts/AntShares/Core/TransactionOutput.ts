namespace AntShares.Core
{
    export class TransactionOutput
    {
        public index: number;
        public assetId: Uint8Array; //UInt256
        public value: Fixed8;
        public address: string;   
    }
}