namespace AntShares.Core.Scripts
{
    export class ScriptBuilder
    {
        private ms = new Array<number>();

        public add(script: ScriptOp | ArrayBuffer | ArrayBufferView): ScriptBuilder
        {
            if (typeof script === "number")
            {
                this.ms.push(script);
            }
            else
            {
                Array.prototype.push.apply(this.ms, Uint8Array.fromArrayBuffer(script));
            }
            return this;
        }

        public push(data: number | ArrayBuffer | ArrayBufferView): ScriptBuilder
        {
            if (data == null) throw new RangeError();
            if (typeof data === "number")
            {
                if (data == -1) return this.add(ScriptOp.OP_1NEGATE);
                if (data == 0) return this.add(ScriptOp.OP_0);
                if (data > 0 && data <= 16) return this.add(ScriptOp.OP_1 - 1 + data);
                return this.push(new BigInteger(data).toUint8Array());
            }
            else
            {
                let buffer = data as ArrayBuffer | ArrayBufferView;
                if (buffer.byteLength <= ScriptOp.OP_PUSHBYTES75)
                {
                    this.add(buffer.byteLength);
                    this.add(buffer);
                }
                else if (buffer.byteLength < 0x100)
                {
                    this.add(ScriptOp.OP_PUSHDATA1);
                    this.add(buffer.byteLength);
                    this.add(buffer);
                }
                else if (buffer.byteLength < 0x10000)
                {
                    this.add(ScriptOp.OP_PUSHDATA2);
                    this.add(buffer.byteLength & 0xff);
                    this.add(buffer.byteLength >>> 8);
                    this.add(buffer);
                }
                else if (buffer.byteLength < 0x100000000)
                {
                    this.add(ScriptOp.OP_PUSHDATA4);
                    this.add(buffer.byteLength & 0xff);
                    this.add((buffer.byteLength >>> 8) & 0xff);
                    this.add((buffer.byteLength >>> 16) & 0xff);
                    this.add(buffer.byteLength >>> 24);
                    this.add(buffer);
                }
                else
                {
                    throw new RangeError();
                }
                return this;
            }
        }

        public toArray(): ArrayBuffer
        {
            return (new Uint8Array(this.ms)).buffer;
        }
    }
}
