namespace AntShares.Core
{
    export class SignatureContext
    {
        public scriptHashes: Uint8Array[];
        public signable: Signable;
        private redeemScripts: Uint8Array[];
        private signatures: Dictionary[];
        private completed: boolean[];

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


        //public static FromJson(json: Object): SignatureContext
        //{
            
        //}

    }
}