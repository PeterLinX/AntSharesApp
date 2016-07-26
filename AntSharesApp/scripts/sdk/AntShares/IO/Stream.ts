namespace AntShares.IO
{
    export enum SeekOrigin
    {
        Begin,
        Current,
        End
    }

    export abstract class Stream
    {
        private _array = new Uint8Array(1);

        public abstract canRead(): boolean;
        public abstract canSeek(): boolean;
        public abstract canWrite(): boolean;
        public close(): void { }
        public abstract length(): number;
        public abstract position(): number;
        public abstract read(buffer: ArrayBuffer, offset: number, count: number): number;
        public readByte(): number
        {
            if (this.read(this._array.buffer, 0, 1) == 0) return -1;
            return this._array[0];
        }
        public abstract seek(offset: number, origin: SeekOrigin): number;
        public abstract setLength(value: number): void;
        public abstract write(buffer: ArrayBuffer, offset: number, count: number): void;
        public writeByte(value: number): void
        {
            if (value < 0 || value > 255) throw new RangeError();
            this._array[0] = value;
            this.write(this._array.buffer, 0, 1);
        }
    }
}
