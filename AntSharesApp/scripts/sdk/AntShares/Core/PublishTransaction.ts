namespace AntShares.Core {
    export class PublishTransaction extends Transaction {
        public code: FunctionCode;
        public needStorage: boolean;
        public name: string;
        public codeVersion: string;
        public author: string;
        public email: string;
        public description: string;

        private size: number;
        public get Size(): number {
            //TODO
            return this.size;
        }

        constructor() {
            super(TransactionType.PublishTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void {
            this.code = <FunctionCode>(reader.readSerializable(FunctionCode));
            if (this.version == 0)
                this.needStorage = false;
            else
                this.needStorage = reader.readBoolean();
            this.name = reader.readVarString();
            this.codeVersion = reader.readVarString();
            this.author = reader.readVarString();
            this.email = reader.readVarString();
            this.description = reader.readVarString();
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void {
            //TODO
        }
    }
}
