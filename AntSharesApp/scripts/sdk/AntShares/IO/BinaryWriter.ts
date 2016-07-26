namespace AntShares.IO
{
    export class BinaryWriter
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

        public constructor(private output: Stream)
        {
        }

        public close(): void
        {
        }

        public seek(offset: number, origin: SeekOrigin): number
        {
            return this.output.seek(offset, origin);
        }

        public write(buffer: ArrayBuffer, index = 0, count = buffer.byteLength - index): void
        {
            this.output.write(buffer, index, count);
        }

        public writeBoolean(value: boolean): void
        {
            this.writeByte(value ? 0xff : 0);
        }

        public writeByte(value: number): void
        {
            if (this.array_uint8 == null)
                this.array_uint8 = new Uint8Array(this._buffer, 0, 1);
            this.array_uint8[0] = value;
            this.output.write(this._buffer, 0, 1);
        }

        public writeDouble(value: number): void
        {
            if (this.array_float64 == null)
                this.array_float64 = new Float64Array(this._buffer, 0, 1);
            this.array_float64[0] = value;
            this.output.write(this._buffer, 0, 8);
        }

        public writeFixed8(value: Fixed8): void
        {
            this.writeUintVariable(value.getData());
        }

        public writeInt16(value: number): void
        {
            if (this.array_int16 == null)
                this.array_int16 = new Int16Array(this._buffer, 0, 1);
            this.array_int16[0] = value;
            this.output.write(this._buffer, 0, 2);
        }

        public writeInt32(value: number): void
        {
            if (this.array_int32 == null)
                this.array_int32 = new Int32Array(this._buffer, 0, 1);
            this.array_int32[0] = value;
            this.output.write(this._buffer, 0, 4);
        }

        public writeSByte(value: number): void
        {
            if (this.array_int8 == null)
                this.array_int8 = new Int8Array(this._buffer, 0, 1);
            this.array_int8[0] = value;
            this.output.write(this._buffer, 0, 1);
        }

        public writeSerializableArray(array: ISerializable[]): void
        {
            this.writeVarInt(array.length);
            for (let i = 0; i < array.length; i++)
                array[i].serialize(this);
        }

        public writeSingle(value: number): void
        {
            if (this.array_float32 == null)
                this.array_float32 = new Float32Array(this._buffer, 0, 1);
            this.array_float32[0] = value;
            this.output.write(this._buffer, 0, 4);
        }

        public writeUint16(value: number): void
        {
            if (this.array_uint16 == null)
                this.array_uint16 = new Uint16Array(this._buffer, 0, 1);
            this.array_uint16[0] = value;
            this.output.write(this._buffer, 0, 2);
        }

        public writeUint32(value: number): void
        {
            if (this.array_uint32 == null)
                this.array_uint32 = new Uint32Array(this._buffer, 0, 1);
            this.array_uint32[0] = value;
            this.output.write(this._buffer, 0, 4);
        }

        public writeUintVariable(value: UintVariable): void
        {
            this.write(value.bits.buffer);
        }

        public writeVarBytes(value: ArrayBuffer): void
        {
            this.writeVarInt(value.byteLength);
            this.output.write(value, 0, value.byteLength);
        }

        public writeVarInt(value: number): void
        {
            if (value < 0) throw new RangeError();
            if (value < 0xfd)
            {
                this.writeByte(value);
            }
            else if (value <= 0xffff)
            {
                this.writeByte(0xfd);
                this.writeUint16(value);
            }
            else if (value <= 0xFFFFFFFF)
            {
                this.writeByte(0xfe);
                this.writeUint32(value);
            }
            else
            {
                this.writeByte(0xff);
                this.writeUint32(value);
                this.writeUint32(value / Math.pow(2, 32));
            }
        }

        public writeVarString(value: string): void
        {
            value = unescape(encodeURIComponent(value));
            let codes = new Uint8Array(value.length);
            for (let i = 0; i < codes.length; i++)
                codes[i] = value.charCodeAt(i);
            this.writeVarBytes(codes.buffer);
        }
    }
}
