namespace AntShares.Core
{
    export class TransactionInput implements IO.ISerializable
    {
        public prevHash: Uint256;
        public prevIndex: number;

        public deserialize(reader: IO.BinaryReader): void
        {
            this.prevHash = reader.readUint256();
            this.prevIndex = reader.readUint16();
        }

        public equals(other: TransactionInput): boolean
        {
            if (this === other) return true;
            if (null == other) return false;
            return this.prevHash.equals(other.prevHash) && this.prevIndex == other.prevIndex;
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeUintVariable(this.prevHash);
            writer.writeUint16(this.prevIndex);
        }

        public toString(): string
        {
            return this.prevHash.toString() + ':' + this.prevIndex;
        }
    }
}
