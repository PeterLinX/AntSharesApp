namespace AntShares.Core {
    export class FunctionCode implements IO.ISerializable {

        public script: ArrayBuffer;
        public parameterList: ContractParameterType[];
        public returnType: ContractParameterType;

        public getScriptHash(): PromiseLike<AntShares.Uint160> {
            return this.script.toScriptHash();
        }

        public getSize()
        {
            //TODO
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
