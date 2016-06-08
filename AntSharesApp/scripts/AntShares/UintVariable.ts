namespace AntShares
{
    export class UintVariable
    {
        private _bits: Uint32Array;

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

        public and(other: number | UintVariable): UintVariable
        {
            if (typeof other === "number")
            {
                return this.and(new UintVariable([other]));
            }
            else
            {
                let bits = new Uint32Array(Math.max(this._bits.length, other._bits.length));
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] & other._bits[i];
                return new UintVariable(bits);
            }
        }

        public compareTo(other: number | UintVariable): number
        {
            if (typeof other === "number")
            {
                return this.compareTo(new UintVariable([other]));
            }
            else
            {
                let max = Math.max(this._bits.length, other._bits.length);
                for (let i = max - 1; i >= 0; i--)
                    if ((this._bits[i] || 0) > (other._bits[i] || 0))
                        return 1;
                    else if ((this._bits[i] || 0) < (other._bits[i] || 0))
                        return -1;
                return 0;
            }
        }

        public equals(other: number | UintVariable): boolean
        {
            if (typeof other === "number")
            {
                return this.equals(new UintVariable([other]));
            }
            else
            {
                let max = Math.max(this._bits.length, other._bits.length);
                for (let i = 0; i < max; i++)
                    if ((this._bits[i] || 0) != (other._bits[i] || 0))
                        return false;
                return true;
            }
        }

        public leftShift(shift: number): UintVariable
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
            return new UintVariable(bits);
        }

        public not(): UintVariable
        {
            let bits = new Uint32Array(this._bits.length);
            for (let i = 0; i < bits.length; i++)
                bits[i] = ~this._bits[i];
            return new UintVariable(bits);
        }

        public or(other: number | UintVariable): UintVariable
        {
            if (typeof other === "number")
            {
                return this.or(new UintVariable([other]));
            }
            else
            {
                let bits = new Uint32Array(Math.max(this._bits.length, other._bits.length));
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] | other._bits[i];
                return new UintVariable(bits);
            }
        }

        public rightShift(shift: number): UintVariable
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
            return new UintVariable(bits);
        }

        public serialize(): Uint8Array
        {
            return new Uint8Array(this.bits.buffer, this.bits.byteOffset, this.bits.byteLength);
        }

        public toInt32(): number
        {
            return this._bits[0] | 0;
        }

        public toString(): string
        {
            let s = "";
            for (let i = this._bits.length * 32 - 4; i >= 0; i -= 4)
                s += ((this._bits[i >>> 5] >>> (i % 32)) & 0xf).toString(16);
            return s;
        }

        public toUint32(): number
        {
            return this._bits[0];
        }

        public xor(other: number | UintVariable): UintVariable
        {
            if (typeof other === "number")
            {
                return this.xor(new UintVariable([other]));
            }
            else
            {
                let bits = new Uint32Array(Math.max(this._bits.length, other._bits.length));
                for (let i = 0; i < bits.length; i++)
                    bits[i] = this._bits[i] ^ other._bits[i];
                return new UintVariable(bits);
            }
        }
    }
}
