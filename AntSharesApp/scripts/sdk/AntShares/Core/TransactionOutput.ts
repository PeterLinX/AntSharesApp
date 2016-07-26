namespace AntShares.Core
{
    export class TransactionOutput implements IO.ISerializable
    {
        public assetId: Uint256;
        public value: Fixed8;
        public scriptHash: Uint160;

        public deserialize(reader: IO.BinaryReader): void
        {
            this.assetId = reader.readUint256();
            this.value = reader.readFixed8();
            this.scriptHash = reader.readUint160();
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeUintVariable(this.assetId);
            writer.writeFixed8(this.value);
            writer.writeUintVariable(this.scriptHash);
        }
    }
}
