namespace AntShares.IO
{
    export class BinaryReader
    {
        private _buffer = new ArrayBuffer(8);
        private array_uint8: Uint8Array;
        private array_int8: Int8Array;
        private array_uint16: Uint16Array;
        private array_int16: Int16Array;
        private array_uint32: Uint32Array;
        private array_int32: Int32Array;
        private array_float32: Float32Array;
        private array_float64: Float64Array;

        public constructor(private input: Stream)
        {
        }

        public close(): void
        {
        }

        private fillBuffer(buffer: ArrayBuffer, count: number)
        {
            let i = 0;
            while (count > 0)
            {
                let actual_count = this.input.read(buffer, 0, count);
                if (actual_count == 0) throw new Error("EOF");
                i += actual_count;
                count -= actual_count;
            }
        }

        public read(buffer: ArrayBuffer, index: number, count: number): number
        {
            return this.input.read(buffer, index, count);
        }

        public readBoolean(): boolean
        {
            return this.readByte() != 0;
        }

        public readByte(): number
        {
            this.fillBuffer(this._buffer, 1);
            if (this.array_uint8 == null)
                this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
            return this.array_uint8[0];
        }

        public readBytes(count: number): ArrayBuffer
        {
            let buffer = new ArrayBuffer(count);
            this.fillBuffer(buffer, count);
            return buffer;
        }

        public readDouble(): number
        {
            this.fillBuffer(this._buffer, 8);
            if (this.array_float64 == null)
                this.array_float64 = new Float64Array(this._buffer, 0, 1);
            return this.array_float64[0];
        }

        public readFixed8(): Fixed8
        {
            return new Fixed8(this.readUint64());
        }

        public readInt16(): number
        {
            this.fillBuffer(this._buffer, 2);
            if (this.array_int16 == null)
                this.array_int16 = new Int16Array(this._buffer, 0, 1);
            return this.array_int16[0];
        }

        public readInt32(): number
        {
            this.fillBuffer(this._buffer, 4);
            if (this.array_int32 == null)
                this.array_int32 = new Int32Array(this._buffer, 0, 1);
            return this.array_int32[0];
        }

        public readSByte(): number
        {
            this.fillBuffer(this._buffer, 1);
            if (this.array_int8 == null)
                this.array_int8 = new Int8Array(this._buffer, 0, 1);
            return this.array_int8[0];
        }

        public readSerializable(T: Function): ISerializable
        {
            let obj = <ISerializable>new (<any>T)();
            obj.deserialize(this);
            return obj;
        }

        public readSerializableArray(T: Function): ISerializable[]
        {
            let array = new Array<ISerializable>(this.readVarInt(0x10000000));
            for (let i = 0; i < array.length; i++)
                array[i] = this.readSerializable(T);
            return array;
        }

        public readSingle(): number
        {
            this.fillBuffer(this._buffer, 4);
            if (this.array_float32 == null)
                this.array_float32 = new Float32Array(this._buffer, 0, 1);
            return this.array_float32[0];
        }

        public readUint16(): number
        {
            this.fillBuffer(this._buffer, 2);
            if (this.array_uint16 == null)
                this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
            return this.array_uint16[0];
        }

        public readUint160(): Uint160
        {
            return new Uint160(this.readBytes(20));
        }

        public readUint256(): Uint256
        {
            return new Uint256(this.readBytes(32));
        }

        public readUint32(): number
        {
            this.fillBuffer(this._buffer, 4);
            if (this.array_uint32 == null)
                this.array_uint32 = new Uint32Array(this._buffer, 0, 2);
            return this.array_uint32[0];
        }

        public readUint64(): Uint64
        {
            this.fillBuffer(this._buffer, 8);
            if (this.array_uint32 == null)
                this.array_uint32 = new Uint32Array(this._buffer, 0, 2);
            return new Uint64(this.array_uint32[0], this.array_uint32[1]);
        }

        public readVarBytes(max = 0X7fffffc7): ArrayBuffer
        {
            return this.readBytes(this.readVarInt(max));
        }

        public readVarInt(max = 9007199254740991): number
        {
            let fb = this.readByte();
            let value: number;
            if (fb == 0xfd)
                value = this.readUint16();
            else if (fb == 0xfe)
                value = this.readUint32();
            else if (fb == 0xff)
                value = this.readUint64().toNumber();
            else
                value = fb;
            if (value > max) throw new RangeError();
            return value;
        }

        public readVarString(): string
        {
            return decodeURIComponent(escape(String.fromCharCode.apply(null, new Uint8Array(this.readVarBytes()))));
        }
    }
}
