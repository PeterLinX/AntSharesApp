namespace AntShares.Core
{
    export class SignatureContext
    {
        public signable: ISignable;
        public scriptHashes: Uint160[];
        private redeemScripts: ArrayBuffer[];
        private signatures: Map<string, ArrayBuffer>[];
        private completed: boolean[];

        public add(contract: Wallets.Contract, pubkey: Cryptography.ECPoint, signature: ArrayBuffer): boolean
        {
            for (let i = 0; i < this.scriptHashes.length; i++)
            {
                if (this.scriptHashes[i].equals(contract.scriptHash))
                {
                    if (this.redeemScripts[i] == null)
                        this.redeemScripts[i] = contract.redeemScript;
                    if (this.signatures[i] == null)
                        this.signatures[i] = new Map<string, ArrayBuffer>();
                    this.signatures[i].set(pubkey.toString(), signature);
                    let completed = contract.parameterList.length == this.signatures[i].size;
                    for (let j = 0; j < contract.parameterList.length && completed; j++)
                        if (contract.parameterList[j] != Wallets.ContractParameterType.Signature)
                            completed = false;
                    this.completed[i] = this.completed[i] || completed;
                    return true;
                }
            }
            return false;
        }

        public static create(signable: ISignable): PromiseLike<SignatureContext>
        {
            return signable.getScriptHashesForVerifying().then(result =>
            {
                let context = new SignatureContext();
                context.signable = signable;
                context.scriptHashes = result;
                context.redeemScripts = new Array<ArrayBuffer>(result.length);
                context.signatures = new Array<Map<string, ArrayBuffer>>(result.length);
                context.completed = new Array<boolean>(result.length);
                return context;
            });
        }

        public getScripts(): Core.Scripts.Script[]
        {
            if (!this.isCompleted()) throw new Error();
            let scripts = new Array<Core.Scripts.Script>(this.signatures.length);
            for (let i = 0; i < scripts.length; i++)
            {
                let array = new Array<{ pubkey: Cryptography.ECPoint, signature: ArrayBuffer }>();
                this.signatures[i].forEach((signature, key) =>
                {
                    array.push({ pubkey: Cryptography.ECPoint.parse(key, Cryptography.ECCurve.secp256r1), signature: signature });
                });
                array.sort((a, b) => a.pubkey.compareTo(b.pubkey));
                let sb = new Core.Scripts.ScriptBuilder();
                for (let j = 0; j < array.length; j++)
                    sb.push(array[j].signature);
                scripts[i] = new Core.Scripts.Script();
                scripts[i].stackScript = sb.toArray();
                scripts[i].redeemScript = this.redeemScripts[i];
            }
            return scripts;
        }

        public isCompleted(): boolean
        {
            for (let i = 0; i < this.completed.length; i++)
                if (!this.completed[i])
                    return false;
            return true;
        }
    }
}
