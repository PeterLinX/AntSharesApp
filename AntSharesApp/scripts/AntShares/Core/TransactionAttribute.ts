namespace AntShares.Core
{
    export class TransactionAttribute
    {
        public transactionAttributeUsage: TransactionAttributeUsage;
        public data: Uint8Array;

        public serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array[this.transactionAttributeUsage]);
            array.push(this.data);
            return ToUint8Array(array);
        }
    }

}