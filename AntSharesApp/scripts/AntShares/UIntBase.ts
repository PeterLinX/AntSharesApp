namespace AntShares
{
    export abstract class UIntBase
    {
        protected _bytes: Uint8Array;

        public get data_bytes()
        {
            return this._bytes;
        }

        constructor(bytes:number, value:Uint8Array)
        {
            if (value == null)
            {
                this._bytes = new Uint8Array(bytes);
                return;
            }
            if (value.length != bytes) throw new RangeError();
            this._bytes = value;
        }

        public toString(): string
        {
            let temp: Uint8Array = new Uint8Array(this._bytes.length);
            for (let i = 0; i < this._bytes.length;i++)
            {
                temp[i] = this._bytes[i];
            }
            return temp.reverse().toHexString();
        }

        public serialize(): Uint8Array
        {
            return new Uint8Array(this._bytes.buffer, this._bytes.byteOffset, this._bytes.byteLength);
        }
    }
}
