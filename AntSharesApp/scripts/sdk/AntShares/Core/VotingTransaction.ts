namespace AntShares.Core
{
    export class VotingTransaction extends Transaction
    {
        public enrollments: Uint256[];

        public get systemFee() { return Fixed8.fromNumber(10); }

        constructor()
        {
            super(TransactionType.VotingTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.enrollments = new Array<Uint256>(reader.readVarInt(0x10000000));
            for (let i = 0; i < this.enrollments.length; i++)
                this.enrollments[i] = reader.readUint256();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeVarInt(this.enrollments.length);
            for (let i = 0; i < this.enrollments.length; i++)
                writer.writeUintVariable(this.enrollments[i]);
        }
    }
}
