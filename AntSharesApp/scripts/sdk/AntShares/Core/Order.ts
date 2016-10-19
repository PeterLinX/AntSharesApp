namespace AntShares.Core
{
    export class Order implements ISignable
    {
        public assetId: Uint256;
        public valueAssetId: Uint256;
        public agent: Uint160;
        public amount: Fixed8;
        public price: Fixed8;
        public client: Uint160;
        public inputs: TransactionInput[];
        public scripts: Scripts.Script[];

        public deserialize(reader: IO.BinaryReader): void
        {
            this.deserializeUnsigned(reader);
            this.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
        }

        public deserializeInTransaction(reader: IO.BinaryReader, tx: AgencyTransaction): void
        {
            this.deserializeUnsignedInternal(reader, tx.assetId, tx.valueAssetId, tx.agent);
            this.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
        }

        public deserializeUnsigned(reader: IO.BinaryReader): void
        {
            let asset_id = reader.readUint256();
            let value_asset_id = reader.readUint256();
            let agent = reader.readUint160();
            this.deserializeUnsignedInternal(reader, asset_id, value_asset_id, agent);
        }

        private deserializeUnsignedInternal(reader: IO.BinaryReader, asset_id: Uint256, value_asset_id: Uint256, agent: Uint160): void
        {
            this.assetId = asset_id;
            this.valueAssetId = value_asset_id;
            this.agent = agent;
            this.amount = reader.readFixed8();
            this.price = reader.readFixed8();
            this.client = reader.readUint160();
            this.inputs = <TransactionInput[]>reader.readSerializableArray(TransactionInput);
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            throw new Error("NotSupported");
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            this.serializeUnsigned(writer);
            writer.writeSerializableArray(this.scripts);
        }

        public serializeInTransaction(writer: IO.BinaryWriter): void
        {
            writer.writeFixed8(this.amount);
            writer.writeFixed8(this.price);
            writer.writeUintVariable(this.client);
            writer.writeSerializableArray(this.inputs);
            writer.writeSerializableArray(this.scripts);
        }

        public serializeUnsigned(writer: IO.BinaryWriter): void
        {
            writer.writeUintVariable(this.assetId);
            writer.writeUintVariable(this.valueAssetId);
            writer.writeUintVariable(this.agent);
            writer.writeFixed8(this.amount);
            writer.writeFixed8(this.price);
            writer.writeUintVariable(this.client);
            writer.writeSerializableArray(this.inputs);
        }

        public setScripts(scripts: Core.Scripts.Script[]): void
        {
            this.scripts = scripts;
        }
    }
}
