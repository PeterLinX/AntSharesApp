/// <reference path="Stream.ts"/>

namespace AntShares.IO
{
    const BufferSize = 1024;

    export class MemoryStream extends Stream
    {
        private _buffers = new Array<ArrayBuffer>();
        private _origin = 0;
        private _position = 0;
        private _length: number;
        private _capacity: number;
        private _expandable: boolean;
        private _writable: boolean;

        public constructor(capacity?: number);
        public constructor(buffer: ArrayBuffer, writable?: boolean);
        public constructor(buffer: ArrayBuffer, index: number, count: number, writable?: boolean);
        public constructor()
        {
            super();
            if (arguments.length == 0)
            {
                this._length = 0;
                this._capacity = 0;
                this._expandable = true;
                this._writable = true;
            }
            else if (arguments.length == 1 && typeof arguments[0] === "number")
            {
                this._length = 0;
                this._capacity = arguments[0];
                this._expandable = true;
                this._writable = true;
                this._buffers.push(new ArrayBuffer(this._capacity));
            }
            else
            {
                let buffer = arguments[0] as ArrayBuffer;
                this._buffers.push(buffer);
                this._expandable = false;
                if (arguments.length == 1)
                {
                    this._writable = false;
                    this._length = buffer.byteLength;
                }
                else if (typeof arguments[1] === "boolean")
                {
                    this._writable = arguments[1];
                    this._length = buffer.byteLength;
                }
                else
                {
                    this._origin = arguments[1] as number;
                    this._length = arguments[2] as number;
                    this._writable = arguments.length == 4 ? arguments[3] as boolean : false;
                    if (this._origin < 0 || this._origin + this._length > buffer.byteLength)
                        throw new RangeError();
                }
                this._capacity = this._length;
            }
        }

        public canRead(): boolean
        {
            return true;
        }

        public canSeek(): boolean
        {
            return true;
        }

        public canWrite(): boolean
        {
            return this._writable;
        }

        public capacity(): number
        {
            return this._capacity;
        }

        private findBuffer(position: number): { iBuff: number, pBuff: number }
        {
            let iBuff: number, pBuff: number;
            let firstSize = this._buffers[0] == null ? BufferSize : this._buffers[0].byteLength;
            if (position < firstSize)
            {
                iBuff = 0;
                pBuff = position;
            }
            else
            {
                iBuff = Math.floor((position - firstSize) / BufferSize) + 1;
                pBuff = (position - firstSize) % BufferSize;
            }
            return { iBuff, pBuff };
        }

        public length(): number
        {
            return this._length;
        }

        public position(): number
        {
            return this._position;
        }

        public read(buffer: ArrayBuffer, offset: number, count: number): number
        {
            if (this._position + count > this._length)
                count = this._length - this._position;
            this.readInternal(new Uint8Array(buffer, offset, count), this._position);
            this._position += count;
            return count;
        }

        private readInternal(dst: Uint8Array, srcPos: number): void
        {
            if (this._expandable)
            {
                let i = 0, count = dst.length;
                let d = this.findBuffer(srcPos);
                while (count > 0)
                {
                    let actual_count: number;
                    if (this._buffers[d.iBuff] == null)
                    {
                        actual_count = Math.min(count, BufferSize - d.pBuff);
                        dst.fill(0, i, i + actual_count);
                    }
                    else
                    {
                        actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                        let src = new Uint8Array(this._buffers[d.iBuff]);
                        Array.copy(src, d.pBuff, dst, i, actual_count);
                    }
                    i += actual_count;
                    count -= actual_count;
                    d.iBuff++;
                    d.pBuff = 0;
                }
            }
            else
            {
                let src = new Uint8Array(this._buffers[0], this._origin, this._length);
                Array.copy(src, srcPos, dst, 0, dst.length);
            }
        }

        public seek(offset: number, origin: SeekOrigin): number
        {
            switch (origin)
            {
                case SeekOrigin.Begin:
                    break;
                case SeekOrigin.Current:
                    offset += this._position;
                    break;
                case SeekOrigin.End:
                    offset += this._length;
                    break;
                default:
                    throw new RangeError();
            }
            if (offset < 0 || offset > this._length)
                throw new RangeError();
            this._position = offset;
            return offset;
        }

        public setLength(value: number): void
        {
            if (value < 0 || (value != this._length && !this._writable) || (value > this._capacity && !this._expandable))
                throw new RangeError();
            this._length = value;
            if (this._position > this._length)
                this._position = this._length;
            if (this._capacity < this._length)
                this._capacity = this._length;
        }

        public toArray(): ArrayBuffer
        {
            if (this._buffers.length == 1 && this._origin == 0 && this._length == this._buffers[0].byteLength)
                return this._buffers[0];
            let bw = new Uint8Array(this._length);
            this.readInternal(bw, 0);
            return bw.buffer;
        }

        public write(buffer: ArrayBuffer, offset: number, count: number): void
        {
            if (!this._writable || (!this._expandable && this._capacity - this._position < count))
                throw new Error();
            if (this._expandable)
            {
                let src = new Uint8Array(buffer);
                let d = this.findBuffer(this._position);
                while (count > 0)
                {
                    if (this._buffers[d.iBuff] == null)
                        this._buffers[d.iBuff] = new ArrayBuffer(BufferSize);
                    let actual_count = Math.min(count, this._buffers[d.iBuff].byteLength - d.pBuff);
                    let dst = new Uint8Array(this._buffers[d.iBuff]);
                    Array.copy(src, offset, dst, d.pBuff, actual_count);
                    this._position += actual_count;
                    offset += actual_count;
                    count -= actual_count;
                    d.iBuff++;
                    d.pBuff = 0;
                }
            }
            else
            {
                let src = new Uint8Array(buffer, offset, count);
                let dst = new Uint8Array(this._buffers[0], this._origin, this._capacity);
                Array.copy(src, 0, dst, this._position, count);
                this._position += count;
            }
            if (this._length < this._position) this._length = this._position;
            if (this._capacity < this._length) this._capacity = this._length;
        }
    }
}
