namespace AntShares.Core {
    export class FunctionCode implements IO.ISerializable {

        public script: ArrayBuffer;

        public parameterList: ContractParameterType[];

        public returnType: ContractParameterType;

        private scriptHash: Uint160;
        public get ScriptHash() {
            if (this.scriptHash == null) {
                this.script.toScriptHash().then(result => {
                    this.scriptHash = result;
                    return this.scriptHash;
                });
            }
            return this.scriptHash;
        }

        private _size;
        public get Size() {
            //TODO
            return this._size;
        }

        public deserialize(reader: IO.BinaryReader): void {
            this.script = reader.readVarBytes();
            let paraList = reader.readVarBytes() as Uint8Array;
            for (var i = 0; i < paraList.length; i++) {
                this.parameterList.push(paraList[i]);
            }
            this.returnType - reader.readByte() as ContractParameterType;
        }

        public serialize(writer: IO.BinaryWriter): void {
            //TODO
        }

    }
}