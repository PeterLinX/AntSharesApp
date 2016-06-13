namespace AntShares.Core
{
    export class SignatureContext
    {
        //要签名的数据
        public signable: Signable;
        //要验证的脚本散列值
        public scriptHashes: Uint8Array[]; //UInt160
        private redeemScripts: Uint8Array[];
        private signatures: Dictionary[];
        //判断签名是否完成
        private completed: boolean[];

        public SignatureContext(signable: Signable)
        {
            //实际使用时需要边界检查
            this.signable = signable;
            //this.scriptHashes = signable.GetScriptHashesForVerifying();
            this.redeemScripts = new Array<Uint8Array>();
            this.redeemScripts.length = this.scriptHashes.length;
            this.signatures = new Array<Dictionary>();
            this.signatures.length = this.scriptHashes.length;
            this.completed = new Array<boolean>();
            this.completed.length = this.scriptHashes.length;
        }

        /**
         * 添加一个签名
         * @param contract 该签名所对应的合约
         * @param publicECPoint 该签名所对应的公钥
         * @param signature 签名
         * @return 返回签名是否已成功添加
         */
        public Add(contract: Wallets.Contract, publicECPoint: Cryptography.ECPoint, signature: Uint8Array): boolean
        {
            for (let i = 0; i < this.scriptHashes.length; i++)
            {
                if (this.scriptHashes[i] == contract.ScriptHash)
                {
                    if (this.redeemScripts[i] == null)
                        this.redeemScripts[i] = contract.RedeemScript;
                    if (this.signatures[i] == null)
                        this.signatures[i] = new Dictionary();
                    if (this.signatures[i].containsKey(publicECPoint))
                        this.signatures[i].set(publicECPoint, signature);
                    else
                        this.signatures[i].add(publicECPoint, signature);
                    this.Check(contract);
                    return true;
                }
            }
            return false;
        };

        public Check(contract: Wallets.Contract)
        {
            for (let i = 0; i < this.scriptHashes.length; i++)
            {
                if (this.scriptHashes[i] == contract.ScriptHash)
                {
                    this.completed[i] = contract.IsCompleted(this.signatures[i].getKeys());
                    break;
                }
            }
        }

        /**
         * 从指定的json对象中解析出签名上下文
         * @param json json对象
         * @return 返回上下文
         */
        //public static FromJson(json: Object): SignatureContext
        //{
            
        //}

    }
}