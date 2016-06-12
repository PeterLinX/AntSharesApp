namespace AntShares.Core
{
    export class TransactionInput
    {
        constructor(public prevHash: string, public prevIndex: number)
        {
        }

        public serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(this.prevHash.hexToBytes());
            array.push(this.prevIndex.serialize(2));
            return ToUint8Array(array);
        }
    }
}