namespace AntShares.Wallets
{
    export class MultiSigContract extends Wallets.Contract
    {
        private m: number;
        private publicKeys: Cryptography.ECPoint[];

        // 合约的形式参数列表
        private _parameterList: ContractParameterType[];
        get parameterList(): ContractParameterType[]
        {
            this._parameterList = new Array<ContractParameterType>();
            for (let i = 0; i < this.m; i++)
            {
                this._parameterList.push(ContractParameterType.Signature);
            }

            return this._parameterList;
        }

        constructor()
        {
            super();
            this.Type = "MultiSigContract";
        }


        /**
         * 用指定的N个公钥创建一个MultiSigContract实例，并指定至少需要M个账户的签名
         * @param pPublicKeyHash 合约所属的账户
         * @param m 一个整数，该合约至少需要包含此数量的签名才能生效
         * @param pPublicKeys 公钥列表，该合约需要此列表中至少m个账户签名后才能生效
         * @return 返回一个多方签名合约
         */
        public static Create(pPublicKeyHash: Uint8Array, m: number, pPublicKeys: AntShares.Cryptography.ECPoint[]): MultiSigContract
        {
            let multisigContract = new MultiSigContract();
            multisigContract.RedeemScript = MultiSigContract.CreateMultiSigRedeemScript(m, pPublicKeys);
            multisigContract.PublicKeyHash = pPublicKeyHash;
            multisigContract.m = m;
            multisigContract.publicKeys = pPublicKeys;
            return multisigContract;
        }

        /**
         * 用指定的N个公钥创建一段MultiSigContract合约的脚本，并指定至少需要M个账户的签名
         * @param m 一个整数，该合约至少需要包含此数量的签名才能生效
         * @param publicKeys 公钥列表，该合约需要此列表中至少m个账户签名后才能生效
         * @return 返回一段多方签名合约的脚本代码
         */
        public static CreateMultiSigRedeemScript(m: number, publicKeys: AntShares.Cryptography.ECPoint[]): Uint8Array
        {
            if (!(1 <= m && m <= publicKeys.length && publicKeys.length <= 1024))
                throw new Error();

            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(m);

            //TODO:这里是否还需要对publicKeys中的项进行排序？
            for (let publickey of publicKeys){
                sb.push(publickey.encodePoint(true));
            }
            
            sb.push(publicKeys.length);
            sb.add(AntShares.Core.Scripts.ScriptOp.OP_CHECKMULTISIG);
            return sb.toArray();
        }

        //TODO:完善此方法
        public IsCompleted(publicKeys: Array<Cryptography.ECPoint>): boolean
        {
            return false;
        }

    }
}