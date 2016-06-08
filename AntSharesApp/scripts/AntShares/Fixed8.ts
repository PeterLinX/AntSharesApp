namespace AntShares
{
    export class Fixed8
    {
        public static satoshi = Fixed8.from32(1);
        public static negativeSatoshi = Fixed8.from32(-1);
        public static one = Fixed8.from32(100000000);
        public static zero = Fixed8.from32(0);
        private str: string;

        constructor(private value: UInt64) { }

        /**
         * 两个Fixed8相加,返回和
         * @param other 加数
         */
        public add(other: Fixed8): Fixed8
        {
            return new Fixed8(this.value.add(other.value));
            //TODO:计算和str
        }

        /**
         * 两个Fixed8比较,返回结果
         * @param other 比较数
         */
        public equals(other: Fixed8): boolean
        {
            return this.value == other.value;
        }


        private static from32(low: number): Fixed8
        {
            let r = new Fixed8(UInt64.from32(low));
            r.str = low.toString();
            return r;
        }

        /**
         * 从64位数生成Fixed8
         * @param low 对应C#代码中的Fixed8的低32位(已经乘过1亿)
         * @param high 对应C#代码中的Fixed8的高32位(已经乘过1亿)
         * @param str 对应C#代码中的Fixed8的字符串形式(没有乘过1亿)
         */
        public static from64(low: number, high: number, str: string): Fixed8
        {
            let r = new Fixed8(UInt64.from64(low, high));
            r.str = low.toString();
            return r;
        }

        /**
         * 从字符串格式的数字生成Fixed8
         * @param str 字符串格式的数字(没有乘过1亿),如用户发行资产和转账时输入的"12345678"
         */
        public static fromString(str: string): Fixed8
        {
            var re = /^[0-9]+.?[0-9]*$/
            if (!re.test(str))
            {
                throw new RangeError("Parameters format exception");
            }
            let raw = str;
            if (str.indexOf("."))
            {
                let decimal = str.substring(str.indexOf(".") + 1, str.length);
                if (decimal.length > 8)
                    str = str.substring(0, str.indexOf(".") + 9);
                for (let i = decimal.length; i < 8; i++)
                    str += "0";
                str = str.replace(".", "");
            }
            else
            {
                str += "00000000";
            }
            let result = new Fixed8(UInt64.fromString(str));
            result.str = raw;
            return result;
        }

        /**
         * 将Fixed8的值,即64位整数序列化成Uint8Array
         */
        public serialize(): Uint8Array
        {
            return this.value.serialize();
        }

        /**
         * 转成字符串,正常形式的(没有乘过1亿)
         */
        public toString(): string
        {
            return this.str;
        }
    }
}