/**
 * 静态方法的定义要在引用前面, 这里的静态方法在Fixed8类中调用过, 所以文件要放在Fixed8.ts前面
 */
namespace AntShares
{
    export class UInt64
    {
        constructor(private low: number, private high: number)
        {
            if ((low == null) != (high == null))
                throw new RangeError("Exists one of the field elements is null");
        }

        public add(other: UInt64): UInt64
        {
            let low = (this.low + other.low) % Math.pow(2, 32);
            let carries = Math.floor((this.low + other.low) / Math.pow(2, 32))
            let high = this.high + other.high + carries;
            return new UInt64(low, high);
        }

        private static d2b(d: string, bits: boolean[])
        {
            let half = this.div2(d);
            if (half.length > 0)
                this.d2b(half, bits);
            bits.push(parseInt(d[d.length - 1]) % 2 == 1);
        }

        private static div2(x: string): string
        {
            let result = "";
            let remainder = 0;
            for (let i = 0; i < x.length; i++)
            {
                let bit = parseInt(x[i]);
                let dividend = remainder * 10 + bit;
                let a = Math.floor(dividend / 2);
                if (i > 0 || a != 0)
                    result = result + a;
                remainder = dividend % 2;
            }
            return result;
        }

        public equals(other: UInt64): boolean
        {
            return this.high == other.high && this.low == other.low;
        }

        public static from32(low: number): UInt64
        {
            return low < 0 ? new UInt64(low, -1) : new UInt64(low, 0) ;
        }

        public static from64(low: number, high: number): UInt64
        {
            return new UInt64(low, high);
        }

        /**
         * @param str 十进制数字的字符串 eg:"123456789012345"
         */
        public static fromString(str: string): UInt64
        {
            var re = /^[1-9]+[0-9]*]*$/
            if (!re.test(str))
            {
                throw new RangeError("Parameters format exception");
            }
            let bits = new Array<boolean>(); //eg:[1, 0, 0, 1, 0, 1, 1, 1] big-endian
            this.d2b(str, bits);
            let array = this.toUint8Array(bits); //eg:[4, 242, 61, 8, 128, 9, 233] little-endian
            console.log(array);
            let b7 = 7 < array.length ? array[7] : 0;
            let b6 = 6 < array.length ? array[6] : 0;
            let b5 = 5 < array.length ? array[5] : 0;
            let b4 = 4 < array.length ? array[4] : 0;
            let b3 = 3 < array.length ? array[3] : 0;
            let b2 = 2 < array.length ? array[2] : 0;
            let b1 = 1 < array.length ? array[1] : 0;
            let b0 = array[0];
            let low = b3 * Math.pow(256, 3) + b2 * Math.pow(256, 2) + b1 * 256 + b0;
            if (array.length <= 4)
            {
                return UInt64.from32(low);
            }
            else
            {
                let high = b7 * Math.pow(256, 3) + b6 * Math.pow(256, 2) + b5 * 256 + b4;
                return UInt64.from64(low, high);
            }
        }

        public getLow()
        {
            return this.low;
        }

        public getHigh()
        {
            return this.high;
        }

        public is64bits()
        {
            return this.high != 0;
        }

        public serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(this.low.serialize(4));
            array.push(this.high.serialize(4));
            return ToUint8Array(array);
        }

        private static toUint8Array(bits: boolean[]): Uint8Array
        {
            let array = new Uint8Array(Math.ceil(bits.length / 8));
            for (let i = bits.length - 1; i >= 0; i-=8)
            {
                let b7 = i - 7 >= 0 && bits[i - 7] ? 1 : 0;
                let b6 = i - 6 >= 0 && bits[i - 6] ? 1 : 0;
                let b5 = i - 5 >= 0 && bits[i - 5] ? 1 : 0;
                let b4 = i - 4 >= 0 && bits[i - 4] ? 1 : 0;
                let b3 = i - 3 >= 0 && bits[i - 3] ? 1 : 0;
                let b2 = i - 2 >= 0 && bits[i - 2] ? 1 : 0;
                let b1 = i - 1 >= 0 && bits[i - 1] ? 1 : 0;
                let b0 = bits[i] ? 1 : 0;
                let bit = b7 * Math.pow(2, 7) + b6 * Math.pow(2, 6) + b5 * Math.pow(2, 5)
                    + b4 * Math.pow(2, 4) + b3 * Math.pow(2, 3) + b2 * Math.pow(2, 2) + b1 * Math.pow(2, 1) + b0;
                array[(bits.length - 1 - i) / 8] = bit;
            }
            return array;
        }
    }
}