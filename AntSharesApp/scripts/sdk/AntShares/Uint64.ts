namespace AntShares
{
    let _max: Uint64, _min: Uint64;

    export class Uint64 extends UintVariable
    {
        public static get MaxValue() { return _max || (_max = new Uint64(0xffffffff, 0xffffffff)); }
        public static get MinValue() { return _min || (_min = new Uint64()); }
        public static get Zero() { return Uint64.MinValue; }

        constructor(low = 0, high = 0)
        {
            super([low, high]);
        }

        public add(other: Uint64): Uint64
        {
            let low = this._bits[0] + other._bits[0];
            let high = this._bits[1] + other._bits[1] + (low > 0xffffffff ? 1 : 0);
            return new Uint64(low, high);
        }

        public and(other: number | Uint64): Uint64
        {
            if (typeof other === "number")
            {
                return this.and(new Uint64(other));
            }
            else
            {
                let bits = new Uint32Array(this._bits.length);
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] & other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        }

        public leftShift(shift: number): Uint64
        {
            if (shift == 0) return this;
            let shift_units = shift >>> 5;
            shift = shift & 0x1f;
            let bits = new Uint32Array(this._bits.length);
            for (let i = shift_units; i < bits.length; i++)
                if (shift == 0)
                    bits[i] = this._bits[i - shift_units];
                else
                    bits[i] = this._bits[i - shift_units] << shift | this._bits[i - shift_units - 1] >>> (32 - shift);
            return new Uint64(bits[0], bits[1]);
        }

        public not(): Uint64
        {
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length; i++)
                bits[i] = ~this._bits[i];
            return new Uint64(bits[0], bits[1]);
        }

        public or(other: number | Uint64): Uint64
        {
            if (typeof other === "number")
            {
                return this.or(new Uint64(other));
            }
            else
            {
                let bits = new Uint32Array(this._bits.length);
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] | other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        }

        public static parse(str: string): Uint64
        {
            let bi = BigInteger.parse(str);
            if (bi.bitLength() > 64) throw new RangeError();
            let array = new Uint32Array(bi.toUint8Array(true, 8).buffer);
            return new Uint64(array[0], array[1]);
        }

        public rightShift(shift: number): Uint64
        {
            if (shift == 0) return this;
            let shift_units = shift >>> 5;
            shift = shift & 0x1f;
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length - shift_units; i++)
                if (shift == 0)
                    bits[i] = this._bits[i + shift_units];
                else
                    bits[i] = this._bits[i + shift_units] >>> shift | this._bits[i + shift_units + 1] << (32 - shift);
            return new Uint64(bits[0], bits[1]);
        }

        public subtract(other: Uint64): Uint64
        {
            let low = this._bits[0] - other._bits[0];
            let high = this._bits[1] - other._bits[1] - (this._bits[0] < other._bits[0] ? 1 : 0);
            return new Uint64(low, high);
        }

        public toInt32(): number
        {
            return this._bits[0] | 0;
        }

        public toNumber(): number
        {
            return this._bits[0] + this._bits[1] * Math.pow(2, 32);
        }

        public toString(): string
        {
            return (new BigInteger(this._bits.buffer)).toString();
        }

        public toUint32(): number
        {
            return this._bits[0];
        }

        public xor(other: number | Uint64): Uint64
        {
            if (typeof other === "number")
            {
                return this.xor(new Uint64(other));
            }
            else
            {
                let bits = new Uint32Array(this._bits.length);
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] ^ other._bits[i];
                return new Uint64(bits[0], bits[1]);
            }
        }
    }
}
