namespace AntShares.Core
{
    export abstract class Transaction extends Network.Inventory
    {
        public type: TransactionType;
        public version: number;
        public attributes: TransactionAttribute[];
        public inputs: TransactionInput[];
        public outputs: TransactionOutput[];
        public scripts: Scripts.Script[];

        public get systemFee() { return Fixed8.Zero; }

        constructor(type: TransactionType)
        {
            super();
            this.type = type;
        }

        public deserialize(reader: IO.BinaryReader): void
        {
            this.deserializeUnsigned(reader);
            this.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void { }

        public static deserializeFrom(value: ArrayBuffer, offset?: number): Transaction;
        public static deserializeFrom(reader: IO.BinaryReader): Transaction;
        public static deserializeFrom(): Transaction
        {
            if (arguments[0] instanceof ArrayBuffer)
            {
                let value = <ArrayBuffer>arguments[0];
                let offset = arguments.length == 2 ? <number>arguments[1] : 0;
                let ms = new IO.MemoryStream(value, offset, value.byteLength - offset, false);
                let reader = new IO.BinaryReader(ms);
                return Transaction.deserializeFrom(reader);
            }
            else
            {
                let reader = <IO.BinaryReader>arguments[0];
                let type = <TransactionType>reader.readByte();
                let typeName = "AntShares.Core." + TransactionType[type];
                let t = eval(typeName);
                let transaction = <Transaction>new t();
                if (transaction == null) throw new Error();
                transaction.deserializeUnsignedWithoutType(reader);
                transaction.scripts = <Scripts.Script[]>reader.readSerializableArray(Scripts.Script);
                return transaction;
            }
        }

        public deserializeUnsigned(reader: IO.BinaryReader): void
        {
            if (reader.readByte() != this.type)
                throw new Error();
            this.deserializeUnsignedWithoutType(reader);
        }

        private deserializeUnsignedWithoutType(reader: IO.BinaryReader): void
        {
            this.version = reader.readByte();
            this.deserializeExclusiveData(reader);
            this.attributes = <TransactionAttribute[]>reader.readSerializableArray(TransactionAttribute);
            this.inputs = <TransactionInput[]>reader.readSerializableArray(TransactionInput);
            this.outputs = <TransactionOutput[]>reader.readSerializableArray(TransactionOutput);
        }

        public getAllInputs(): TransactionInput[]
        {
            return this.inputs;
        }

        protected getReferences(): PromiseLike<Map<string, TransactionOutput>>
        {
            let inputs = this.getAllInputs();
            let promises = new Array<PromiseLike<Transaction>>();
            for (let i = 0; i < inputs.length; i++)
                promises.push(Blockchain.Default.getTransaction(inputs[i].prevHash));
            return Promise.all(promises).then(results =>
            {
                let dictionary = new Map<string, TransactionOutput>();
                for (let i = 0; i < inputs.length; i++)
                {
                    if (results[i] == null) return null;
                    dictionary.set(inputs[i].toString(), results[i].outputs[inputs[i].prevIndex]);
                }
                return dictionary;
            });
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            let hashes = new Map<string, Uint160>();
            return this.getReferences().then(result =>
            {
                if (result == null) throw new Error();
                for (let i = 0; i < this.inputs.length; i++)
                {
                    let hash = result.get(this.inputs[i].toString()).scriptHash;
                    hashes.set(hash.toString(), hash);
                }
                let promises = new Array<PromiseLike<Transaction>>();
                for (let i = 0; i < this.outputs.length; i++)
                    promises.push(Blockchain.Default.getTransaction(this.outputs[i].assetId));
                return Promise.all(promises);
            }).then(results =>
            {
                for (let i = 0; i < this.outputs.length; i++)
                {
                    let tx = <RegisterTransaction>results[i];
                    if (tx == null) throw new Error();
                    if (tx.assetType & AssetType.DutyFlag)
                    {
                        hashes.set(this.outputs[i].scriptHash.toString(), this.outputs[i].scriptHash);
                    }
                }
                let array = new Array<Uint160>();
                hashes.forEach(hash =>
                {
                    array.push(hash);
                });
                return array.sort((a, b) => a.compareTo(b));
            });
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            this.serializeUnsigned(writer);
            writer.writeSerializableArray(this.scripts);
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void { }

        public serializeUnsigned(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.type);
            writer.writeByte(this.version);
            this.serializeExclusiveData(writer);
            writer.writeSerializableArray(this.attributes);
            writer.writeSerializableArray(this.inputs);
            writer.writeSerializableArray(this.outputs);
        }

        public setScripts(scripts: Core.Scripts.Script[]): void
        {
            this.scripts = scripts;
        }
    }
}
