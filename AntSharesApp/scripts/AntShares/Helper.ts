//规范：Helper文件中只存放扩展方法
interface ArrayConstructor
{
    copy<T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void;
}

interface String
{
    hexToBytes(): Uint8Array;
    toUint8Array(): Uint8Array;
    serialize(): Uint8Array;
}

interface Number
{
    serialize(Byte: number): Uint8Array;
}

interface Uint8Array
{
    toHexString(): string;
}

interface Uint8ArrayConstructor
{
    fromArrayBuffer(buffer: ArrayBuffer | ArrayBufferView): Uint8Array
}

namespace AntShares
{
    Array.copy = function <T>(src: ArrayLike<T>, srcOffset: number, dst: ArrayLike<T>, dstOffset: number, count: number): void
    {
        for (let i = 0; i < count; i++)
            dst[i + dstOffset] = src[i + srcOffset];
    }

    function fillArray<T>(value: T, start = 0, end = this.length)
    {
        if (start < 0) start += this.length;
        if (start < 0) start = 0;
        if (start >= this.length) return this;
        if (end < 0) end += this.length;
        if (end < 0) return this;
        if (end > this.length) end = this.length;
        for (let i = start; i < end; i++)
            this[i] = value;
        return this;
    }

    Uint8Array.fromArrayBuffer = function (buffer: ArrayBuffer | ArrayBufferView): Uint8Array
    {
        if (buffer instanceof Uint8Array) return buffer;
        else if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
        else
        {
            let view = buffer as ArrayBufferView;
            return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
        }
    }

    String.prototype.hexToBytes = function (): Uint8Array
    {
        if ((this.length & 1) != 0) throw new RangeError();
        let bytes = new Uint8Array(this.length / 2);
        for (let i = 0; i < bytes.length; i++)
            bytes[i] = parseInt(this.substr(i * 2, 2), 16);
        return bytes;
    }

    String.prototype.serialize = function (): Uint8Array
    {
        let text = this.toUint8Array();
        if (text.length < 128)
        {
            let result = new Uint8Array(text.length + 1);
            result[0] = text.length;
            result.set(text, 1);
            return result;
        }
        else
        {
            let result = new Uint8Array(text.length + 2);
            result[1] = text.length / 128;
            result[0] = text.length - (result[1] - 1) * 128;
            result.set(text, 2);
            return result;
        }
    }

    String.prototype.toUint8Array = function (): Uint8Array
    {
        let w = window as any;
        if (w.TextEncoder)
        {
            let encoder = new w.TextEncoder('utf8');
            return encoder.encode(this);
        }
        else
        {
            let encoder = encodeURI(this);
            let list = new Array<number>();
            for (let i = 0; i < encoder.length; i++)
            {
                if (encoder[i] != '%')
                {
                    list.push(encoder.charCodeAt(i));
                }
                else
                {
                    list.push(parseInt("0x" + encoder.charCodeAt(i + 1) + encoder.charCodeAt(i + 2)));
                    i += 2;
                }
            }
            let array = new Uint8Array(list.length);
            for (let i = 0; i < list.length; i++)
            {
                array[i] = list[i];
            }
            return array;
        }
    }

    Number.prototype.serialize = function (Byte: number): Uint8Array
    {
        var uint8array = new Uint8Array(Byte);
        try
        {
            if (this < 0)
            {
                for (let i = 0; i < uint8array.length; i++)
                    uint8array[i] = 255;
                let tc = (this * -1);
                if (tc < 256)
                {
                    let occ = tc ^ 255;
                    let cc = occ + 1;
                    uint8array.set([cc], 0)
                }
                else if (tc < 65536)
                {
                    let occ = tc ^ 65535;
                    let cc = occ + 1;
                    uint8array.set([cc % 256, cc / 256], 0);
                }
                else
                {
                    let occ = tc ^ 4294967295;
                    let cc = occ + 1;
                    uint8array.set([cc % 256, cc / 256, cc / 65536 % 256, cc / 65536 / 256], 0);
                }
            }
            else if (this < 256)
            {
                uint8array.set([this], 0)
            }
            else if (this < 65536)
            {
                uint8array.set([this % 256, this / 256], 0);
            }
            else
            {
                uint8array.set([this % 256, this / 256, this / 65536 % 256, this / 65536 / 256], 0);
            }
        }
        catch (e)
        {
            console.error(e);
        }
        return uint8array;
    }

    

    ArrayBuffer.prototype.slice = ArrayBuffer.prototype.slice || function (begin: number, end = this.byteLength): ArrayBuffer
    {
        if (begin < 0) begin += this.byteLength;
        if (begin < 0) begin = 0;
        if (end < 0) end += this.byteLength;
        if (end > this.byteLength) end = this.byteLength;
        let length = end - begin;
        if (length < 0) length = 0;
        let src = new Uint8Array(this);
        let dst = new Uint8Array(length);
        for (let i = 0; i < length; i++)
            dst[i] = src[i + begin];
        return dst.buffer;
    }

    Uint8Array.prototype.toHexString = function (): string
    {
        let s = "";
        for (let i = 0; i < this.length; i++)
        {
            s += (this[i] >>> 4).toString(16);
            s += (this[i] & 0xf).toString(16);
        }
        return s;
    }


    Int8Array.prototype.fill = Int8Array.prototype.fill || fillArray;
    Int16Array.prototype.fill = Int16Array.prototype.fill || fillArray;
    Int32Array.prototype.fill = Int32Array.prototype.fill || fillArray;
    Uint8Array.prototype.fill = Uint8Array.prototype.fill || fillArray;
    Uint16Array.prototype.fill = Uint16Array.prototype.fill || fillArray;
    Uint32Array.prototype.fill = Uint32Array.prototype.fill || fillArray;

    Int8Array.prototype.reverse = Int8Array.prototype.reverse || reverseArray;
    Int16Array.prototype.reverse = Int16Array.prototype.reverse || reverseArray;
    Int32Array.prototype.reverse = Int32Array.prototype.reverse || reverseArray;
    Uint8Array.prototype.reverse = Uint8Array.prototype.reverse || reverseArray;
    Uint16Array.prototype.reverse = Uint16Array.prototype.reverse || reverseArray;
    Uint32Array.prototype.reverse = Uint32Array.prototype.reverse || reverseArray;
}