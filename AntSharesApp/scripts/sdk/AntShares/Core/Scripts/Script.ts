namespace AntShares.Core.Scripts
{
    export class Script implements IO.ISerializable
    {
        public stackScript: ArrayBuffer;
        public redeemScript: ArrayBuffer;

        public deserialize(reader: IO.BinaryReader): void
        {
            this.stackScript = reader.readVarBytes();
            this.redeemScript = reader.readVarBytes();
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeVarBytes(this.stackScript);
            writer.writeVarBytes(this.redeemScript);
        }
    }
}
