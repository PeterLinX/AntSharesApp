namespace AntShares
{
    export abstract class UintVariable
    {
        protected _bits: Uint32Array;

        public get bits()
        {
            return this._bits;
        }

        constructor(bits: number | Uint8Array | Uint32Array | number[])
        {
            if (typeof bits === "number")
            {
                if (bits <= 0 || bits % 32 != 0) throw new RangeError();
                this._bits = new Uint32Array(bits / 32);
            }
            else if (bits instanceof Uint8Array)
            {
                if (bits.length == 0 || bits.length % 4 != 0) throw new RangeError();
                if (bits.byteOffset % 4 == 0)
                {
                    this._bits = new Uint32Array(bits.buffer, bits.byteOffset, bits.length / 4);
                }
                else
                {
                    let bits_new = new Uint8Array(bits);
                    this._bits = new Uint32Array(bits_new.buffer);
                }
            }
            else if (bits instanceof Uint32Array)
            {
                this._bits = bits;
            }
            else if (bits instanceof Array)
            {
                if (bits.length == 0) throw new RangeError();
                this._bits = new Uint32Array(bits);
            }
        }

        public compareTo(other: UintVariable): number
        {
            let max = Math.max(this._bits.length, other._bits.length);
            for (let i = max - 1; i >= 0; i--)
                if ((this._bits[i] || 0) > (other._bits[i] || 0))
                    return 1;
                else if ((this._bits[i] || 0) < (other._bits[i] || 0))
                    return -1;
            return 0;
        }

        public equals(other: UintVariable): boolean
        {
            let max = Math.max(this._bits.length, other._bits.length);
            for (let i = 0; i < max; i++)
                if ((this._bits[i] || 0) != (other._bits[i] || 0))
                    return false;
            return true;
        }

        public toString(): string
        {
            let s = "";
            for (let i = this._bits.length * 32 - 4; i >= 0; i -= 4)
                s += ((this._bits[i >>> 5] >>> (i % 32)) & 0xf).toString(16);
            return s;
        }
    }
}
