namespace AntShares.Network
{
    export abstract class Inventory implements Core.ISignable
    {
        public hash: Uint256;

        public ensureHash(): PromiseLike<Uint256>
        {
            if (this.hash != null) return Promise.resolve(this.hash);
            return window.crypto.subtle.digest("SHA-256", this.getHashData()).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                return this.hash = new Uint256(result);
            });
        }

        public abstract deserialize(reader: IO.BinaryReader): void;

        public abstract deserializeUnsigned(reader: IO.BinaryReader): void;

        protected getHashData(): ArrayBuffer
        {
            let ms = new IO.MemoryStream();
            let w = new IO.BinaryWriter(ms);
            this.serializeUnsigned(w);
            return ms.toArray();
        }

        public abstract getScriptHashesForVerifying(): PromiseLike<Uint160[]>;

        public abstract serialize(writer: IO.BinaryWriter): void;

        public abstract serializeUnsigned(writer: IO.BinaryWriter): void;
    }
}
