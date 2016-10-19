namespace AntShares.Core
{
    export class PublishTransaction extends Transaction
    {
        public contracts: ArrayBuffer[];

        public get systemFee()
        {
            return Fixed8.fromNumber(500 * this.contracts.length);
        }

        constructor()
        {
            super(TransactionType.PublishTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.contracts = new Array<ArrayBuffer>(reader.readByte());
            for (let i = 0; i < this.contracts.length; i++)
                this.contracts[i] = reader.readVarBytes();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.contracts.length);
            for (let i = 0; i < this.contracts.length; i++)
                writer.writeVarBytes(this.contracts[i]);
        }
    }
}
