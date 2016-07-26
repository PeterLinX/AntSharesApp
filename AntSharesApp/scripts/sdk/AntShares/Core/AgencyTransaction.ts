/// <reference path="Transaction.ts"/>

namespace AntShares.Core
{
    export class AgencyTransaction extends Transaction
    {
        public assetId: Uint256;
        public valueAssetId: Uint256;
        public agent: Uint160;
        public orders: Order[];
        public splitOrder: SplitOrder;

        constructor()
        {
            super(TransactionType.AgencyTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.assetId = reader.readUint256();
            this.valueAssetId = reader.readUint256();
            this.agent = reader.readUint160();
            this.orders = new Order[reader.readVarInt(0x10000000)];
            for (let i = 0; i < this.orders.length; i++)
            {
                this.orders[i] = new Order();
                this.orders[i].deserializeInTransaction(reader, this);
            }
            if (reader.readVarInt(1) == 0)
            {
                this.splitOrder = null;
            }
            else
            {
                this.splitOrder = <SplitOrder>reader.readSerializable(SplitOrder);
            }
        }

        public getAllInputs(): TransactionInput[]
        {
            let array = new Array<TransactionInput>();
            for (let i = 0; i < this.orders.length; i++)
                Array.prototype.push.apply(array, this.orders[i].inputs);
            Array.prototype.push.apply(array, this.inputs);
            return array;
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            throw new Error("NotSupported");
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeUintVariable(this.assetId);
            writer.writeUintVariable(this.valueAssetId);
            writer.writeUintVariable(this.agent);
            writer.writeVarInt(this.orders.length);
            for (let i = 0; i < this.orders.length; i++)
            {
                this.orders[i].serializeInTransaction(writer);
            }
            if (this.splitOrder == null)
            {
                writer.writeByte(0);
            }
            else
            {
                writer.writeByte(1);
                this.splitOrder.serialize(writer);
            }
        }
    }
}
