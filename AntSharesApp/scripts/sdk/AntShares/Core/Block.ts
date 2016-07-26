namespace AntShares.Core
{
    export class Block extends Network.Inventory
    {
        public version: number;
        public prevBlock: Uint256;
        public merkleRoot: Uint256;
        public timestamp: number;
        public height: number;
        public nonce: Uint64;
        public nextMiner: Uint160;
        public script: Scripts.Script;
        public transactions: Transaction[];

        private _header: Block;
        public get header(): Block
        {
            if (this.isHeader) return this;
            if (this._header == null)
            {
                this._header = new Block();
                this._header.version = this.version;
                this._header.prevBlock = this.prevBlock;
                this._header.merkleRoot = this.merkleRoot;
                this._header.timestamp = this.timestamp;
                this._header.height = this.height;
                this._header.nonce = this.nonce;
                this._header.nextMiner = this.nextMiner;
                this._header.script = this.script;
                this._header.transactions = [];
            }
            return this._header;
        }

        public get isHeader() { return this.transactions.length == 0; }

        public deserialize(reader: IO.BinaryReader): void
        {
            this.deserializeUnsigned(reader);
            if (reader.readByte() != 1) throw new Error();
            this.script = <Scripts.Script>reader.readSerializable(Scripts.Script);
            this.transactions = new Array<Transaction>(reader.readVarInt(0x10000000));
            for (let i = 0; i < this.transactions.length; i++)
                this.transactions[i] = Transaction.deserializeFrom(reader);
        }

        public deserializeUnsigned(reader: IO.BinaryReader): void
        {
            this.version = reader.readUint32();
            this.prevBlock = reader.readUint256();
            this.merkleRoot = reader.readUint256();
            this.timestamp = reader.readUint32();
            this.height = reader.readUint32();
            this.nonce = reader.readUint64();
            this.nextMiner = reader.readUint160();
            this.transactions = [];
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            if (this.prevBlock.equals(Uint256.Zero))
                return this.script.redeemScript.toScriptHash().then(result =>
                {
                    return [result];
                });
            return Blockchain.Default.getBlock(this.prevBlock).then(result =>
            {
                if (result == null) throw new Error();
                return [result.nextMiner];
            });
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            this.serializeUnsigned(writer);
            writer.writeByte(1); this.script.serialize(writer);
            writer.writeSerializableArray(this.transactions);
        }

        public serializeUnsigned(writer: IO.BinaryWriter): void
        {
            writer.writeUint32(this.version);
            writer.writeUintVariable(this.prevBlock);
            writer.writeUintVariable(this.merkleRoot);
            writer.writeUint32(this.timestamp);
            writer.writeUint32(this.height);
            writer.writeUintVariable(this.nonce);
            writer.writeUintVariable(this.nextMiner);
        }
    }
}
