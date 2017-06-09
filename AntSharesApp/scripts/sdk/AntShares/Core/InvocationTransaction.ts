namespace AntShares.Core {
    export class InvocationTransaction extends Transaction {
        public script: ArrayBuffer;
        public gas: Fixed8;

        private size: number;
        get Size(): number {
            return this.size;
        }

        private networkFee: Fixed8;
        get NetworkFee(): Fixed8 {
            return this.gas;
        }

        constructor() {
            super(TransactionType.InvocationTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void {
            this.script = reader.readVarBytes(65536);
            if (this.version >= 1) {
                this.gas = <Fixed8>reader.readSerializable(Fixed8);
                if (this.gas < Fixed8.Zero) throw new Error("格式错误");
            } else {
                this.gas = Fixed8.Zero;
            }
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void {
            //TODO
        }
    }
}
