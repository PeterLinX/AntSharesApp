namespace AntShares
{
    let _zero: Uint256;

    export class Uint256 extends UintVariable
    {
        public static get Zero() { return _zero || (_zero = new Uint256()); }

        constructor(value?: ArrayBuffer)
        {
            if (value == null) value = new ArrayBuffer(32);
            if (value.byteLength != 32) throw new RangeError();
            super(new Uint32Array(value));
        }

        public static parse(str: string): Uint256
        {
            if (str.length != 64) throw new RangeError();
            return new Uint256(str.hexToBytes().buffer);
        }
    }
}
