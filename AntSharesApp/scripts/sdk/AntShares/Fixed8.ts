namespace AntShares
{
    const D = 100000000;

    let _max: Fixed8, _minus: Fixed8, _min: Fixed8, _one: Fixed8, _satoshi: Fixed8;

    export class Fixed8
    {
        public static get MaxValue() { return _max || (_max = new Fixed8(new Uint64(0xffffffff, 0x7fffffff))); }
        public static get MinusOne() { return _minus || (_minus = new Fixed8(new Uint64(0xffffffff, 0xffffffff))); }
        public static get MinValue() { return _min || (_min = new Fixed8(Uint64.MinValue)); }
        public static get One() { return _one || (_one = Fixed8.fromNumber(1)); }
        public static get Satoshi() { return _satoshi || (_satoshi = new Fixed8(new Uint64(1))); }
        public static get Zero() { return Fixed8.MinValue; }

        constructor(private data: Uint64)
        {
            if (data.bits[1] >= 0x80000000 && (data.bits[0] != 0xffffffff || data.bits[1] != 0xffffffff))
                throw new RangeError();
        }

        public add(other: Fixed8): Fixed8
        {
            let result = this.data.add(other.data);
            if (result.compareTo(this.data) < 0)
                throw new Error();
            return new Fixed8(result);
        }

        public compareTo(other: Fixed8): number
        {
            return this.data.compareTo(other.data);
        }

        public equals(other: Fixed8): boolean
        {
            return this.data.equals(other.data);
        }

        public static fromNumber(value: number): Fixed8
        {
            if (value < 0) throw new RangeError();
            value *= D;
            if (value >= 0x8000000000000000)
                throw new RangeError();
            let array = new Uint32Array((new BigInteger(value)).toUint8Array(true, 8).buffer);
            return new Fixed8(new Uint64(array[0], array[1]));
        }

        public getData(): Uint64
        {
            return this.data;
        }

        public static max(first: Fixed8, ...others: Fixed8[]): Fixed8
        {
            for (let i = 0; i < others.length; i++)
                if (first.compareTo(others[i]) < 0)
                    first = others[i];
            return first;
        }

        public static min(first: Fixed8, ...others: Fixed8[]): Fixed8
        {
            for (let i = 0; i < others.length; i++)
                if (first.compareTo(others[i]) > 0)
                    first = others[i];
            return first;
        }

        public static parse(str: string): Fixed8
        {
            let dot = str.indexOf('.');
            let digits = dot >= 0 ? str.length - dot - 1 : 0;
            str = str.replace('.', '');
            if (digits > 8)
                str = str.substr(0, str.length - digits + 8);
            else if (digits < 8)
                for (let i = digits; i < 8; i++)
                    str += '0';
            return new Fixed8(Uint64.parse(str));
        }

        public subtract(other: Fixed8): Fixed8
        {
            if (this.data.compareTo(other.data) < 0)
                throw new Error();
            return new Fixed8(this.data.subtract(other.data));
        }

        public toString(): string
        {
            let str = this.data.toString();
            while (str.length <= 8)
                str = '0' + str;
            str = str.substr(0, str.length - 8) + '.' + str.substr(str.length - 8);
            let e = 0;
            for (let i = str.length - 1; i >= 0; i--)
                if (str[i] == '0')
                    e++;
                else
                    break;
            str = str.substr(0, str.length - e);
            if (str[str.length - 1] == '.')
                str = str.substr(0, str.length - 1);
            return str;
        }
    }
}
