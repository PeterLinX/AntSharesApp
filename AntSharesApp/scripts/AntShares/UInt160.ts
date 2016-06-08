namespace AntShares
{
    export class UInt160 extends UIntBase
    {
        public static Zero = new UInt160();

        constructor(value: Uint8Array = null) { super(20, value); }

        public serialize(): Uint8Array
        {
            return new Uint8Array(this._bytes.buffer, this._bytes.byteOffset, this._bytes.byteLength);
        }

        public toString(): string
        {
            return this._bytes.reverse().toHexString();
        }

    }
}
