namespace AntShares.Core
{
    export class SplitOrder implements IO.ISerializable
    {
        public amount: Fixed8;
        public price: Fixed8;
        public client: Uint160;

        public deserialize(reader: IO.BinaryReader): void
        {
            this.amount = reader.readFixed8();
            this.price = reader.readFixed8();
            this.client = reader.readUint160();
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeFixed8(this.amount);
            writer.writeFixed8(this.price);
            writer.writeUintVariable(this.client);
        }
    }
}
