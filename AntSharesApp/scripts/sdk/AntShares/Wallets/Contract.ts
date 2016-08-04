namespace AntShares.Wallets
{
    export class Contract implements IO.ISerializable
    {
        public redeemScript: ArrayBuffer;
        public parameterList: ContractParameterType[];
        public publicKeyHash: Uint160;
        public scriptHash: Uint160;

        public static create(publicKeyHash: Uint160, parameterList: ContractParameterType[], redeemScript: ArrayBuffer): PromiseLike<Contract>
        {
            let contract = new Contract();
            contract.redeemScript = redeemScript;
            contract.parameterList = parameterList;
            contract.publicKeyHash = publicKeyHash;
            return redeemScript.toScriptHash().then(result =>
            {
                contract.scriptHash = result;
                return contract;
            });
        }

        public static createMultiSigContract(publicKeyHash: Uint160, m: number, publicKeys: Cryptography.ECPoint[]): PromiseLike<Contract>
        {
            let redeemScript = Contract.createMultiSigRedeemScript(m, publicKeys);
            let parameterList = AntShares.Linq.Enumerator.repeat(ContractParameterType.Signature, m).toArray();
            return Contract.create(publicKeyHash, parameterList, redeemScript);
        }

        public static createMultiSigRedeemScript(m: number, publicKeys: Cryptography.ECPoint[]): ArrayBuffer
        {
            if (!(1 <= m && m <= publicKeys.length && publicKeys.length <= 1024))
                throw new RangeError();
            publicKeys.sort((a, b) => a.compareTo(b));
            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(m);
            for (let i = 0; i < publicKeys.length; i++)
            {
                sb.push(publicKeys[i].encodePoint(true));
            }
            sb.push(publicKeys.length);
            sb.add(Core.Scripts.ScriptOp.OP_CHECKMULTISIG);
            return sb.toArray();
        }

        public static createSignatureContract(publicKey: Cryptography.ECPoint): PromiseLike<Contract>
        {
            return publicKey.encodePoint(true).toScriptHash().then(result =>
            {
                return Contract.create(result, [ContractParameterType.Signature], Contract.createSignatureRedeemScript(publicKey));
            });
        }

        public static createSignatureRedeemScript(publicKey: Cryptography.ECPoint): ArrayBuffer
        {
            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(publicKey.encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }

        public deserialize(reader: IO.BinaryReader): void
        {
            this.scriptHash = reader.readUint160();
            this.publicKeyHash = reader.readUint160();
            this.parameterList = Array.from(new Uint8Array(reader.readVarBytes()));
            this.redeemScript = reader.readVarBytes();
        }

        public equals(other: Contract): boolean
        {
            if (this === other) return true;
            if (null === other) return false;
            return this.scriptHash.equals(other.scriptHash);
        }

        public getAddress(): PromiseLike<string>
        {
            return Wallet.toAddress(this.scriptHash);
        }

        public isStandard(): boolean
        {
            if (this.redeemScript.byteLength != 35) return false;
            let array = new Uint8Array(this.redeemScript);
            if (array[0] != 33 || array[34] != Core.Scripts.ScriptOp.OP_CHECKSIG)
                return false;
            return true;
        }

        public serialize(writer: IO.BinaryWriter): void
        {
            writer.writeUintVariable(this.scriptHash);
            writer.writeUintVariable(this.publicKeyHash);
            writer.writeVarBytes((new Uint8Array(this.parameterList)).buffer);
            writer.writeVarBytes(this.redeemScript);
        }
    }
}
