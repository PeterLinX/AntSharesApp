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

        public static Parse(json : JSON): PromiseLike<SignatureContext>
        {
            let type = json["type"];
            let hex: string = <string>json["hex"];
            let scripts = json["scripts"];

            let signable: Core.ISignable = new AntShares.Core.ContractTransaction;
            let ms = new IO.MemoryStream(hex.hexToBytes(), false);
            let reader = new IO.BinaryReader(ms);
            signable.deserializeUnsigned(reader);

            return Core.SignatureContext.create(signable).then(result => {
                for (let i = 0; i < scripts.length; i++)
                {
                    if (scripts[i] != null) {
                        result.redeemScripts[i] = (<string>scripts[i]["redeem_script"]).hexToBytes();
                        result.signatures[i] = new Map<string, ArrayBuffer>();
                        let sigs = scripts[i]["signatures"];
                        for (let j = 0; j < sigs.length; j++)
                        {
                            let pubkey = Cryptography.ECPoint.decodePoint((<string>sigs[j]["pubkey"]).hexToBytes(), Cryptography.ECCurve.secp256r1);
                            let signature = (<string>sigs[j]["signature"]).hexToBytes();
                            result.signatures[i].set(pubkey.toString(), signature);
                        }
                        result.completed[i] = <boolean>scripts[i]["completed"];
                    }
                }
                return result;
            });
        }


        public toJson(): JSON
        {
            let jsonObject = new Object();
            jsonObject["type"] = typeof (this.signable);
            let ms = new IO.MemoryStream();
            let writer = new IO.BinaryWriter(ms);
            this.signable.serializeUnsigned(writer);
            let tempMs: Uint8Array = new Uint8Array(ms.toArray(), 0);
            jsonObject["hex"] = tempMs.toHexString();

            let scripts = new Array();
            for (let i = 0; i < this.signatures.length; i++)
            {
                if (this.signatures[i] == null) {
                    scripts.push(null);
                } else {
                    scripts.push(new Object());
                    let tempRedeemScripts: Uint8Array = new Uint8Array(this.redeemScripts[i], 0);
                    scripts[i]["redeem_script"] = tempRedeemScripts.toHexString();
                    let sigs = new Array();
                    this.signatures[i].forEach((value, key) => {
                        let signature = new Object();
                        signature["pubkey"] = key;
                        let tempSignature = new Uint8Array(value, 0);
                        signature["signature"] = tempSignature.toHexString();
                        sigs.push(signature);
                    });
                    scripts[i]["signatures"] = sigs;
                    scripts[i]["completed"] = this.completed[i];
                }
            }
            jsonObject["scripts"] = scripts;

            let strJson = JSON.stringify(jsonObject);
            let json = JSON.parse(strJson);
            return json;
        }

        public toString(): string {
            let strJson = JSON.stringify(this.toJson());
            return strJson;
        }


    }
}
