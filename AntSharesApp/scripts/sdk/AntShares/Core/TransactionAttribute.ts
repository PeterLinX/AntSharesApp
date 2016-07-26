namespace AntShares.Core
{
    export class TransactionAttribute implements IO.ISerializable
    {
        public usage: TransactionAttributeUsage;
        public data: ArrayBuffer;

        public deserialize(reader: IO.BinaryReader): void
        {
            this.usage = reader.readByte();
            if (this.usage == TransactionAttributeUsage.ContractHash || (this.usage >= TransactionAttributeUsage.Hash1 && this.usage <= TransactionAttributeUsage.Hash15))
                this.data = reader.readBytes(32);
            else if (this.usage == TransactionAttributeUsage.ECDH02 || this.usage == TransactionAttributeUsage.ECDH03)
            {
                let array = new Uint8Array(33);
                array[0] = this.usage;
                Array.copy(new Uint8Array(reader.readBytes(32)), 0, array, 1, 32);
                this.data = array.buffer;
            }
            else if (this.usage == TransactionAttributeUsage.Script)
                this.data = reader.readVarBytes(0xffff);
            else if (this.usage == TransactionAttributeUsage.CertUrl || this.usage == TransactionAttributeUsage.DescriptionUrl)
                this.data = reader.readVarBytes(0xff);
            else if (this.usage == TransactionAttributeUsage.Description || this.usage >= TransactionAttributeUsage.Remark)
                this.data = reader.readVarBytes(0xff);
            else
                throw new RangeError();
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.usage);
            if (this.usage == TransactionAttributeUsage.Script)
                writer.writeVarInt(this.data.byteLength);
            else if (this.usage == TransactionAttributeUsage.CertUrl || this.usage == TransactionAttributeUsage.DescriptionUrl)
                writer.writeVarInt(this.data.byteLength);
            else if (this.usage == TransactionAttributeUsage.Description || this.usage >= TransactionAttributeUsage.Remark)
                writer.writeVarInt(this.data.byteLength);
            if (this.usage == TransactionAttributeUsage.ECDH02 || this.usage == TransactionAttributeUsage.ECDH03)
                writer.write(this.data, 1, 32);
            else
                writer.write(this.data);
        }
    }
}
