namespace AntShares.Core
{
    export class MinerTransaction extends Transaction
    {
        public nonce: number;

        constructor()
        {
            super(TransactionType.MinerTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.nonce = reader.readUint32();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeUint32(this.nonce);
        }
    }
}
