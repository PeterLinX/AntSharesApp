namespace AntShares.Core
{
    export class SignatureContext
    {
        public signable: ISignable;
        public scriptHashes: Uint160[];
        private redeemScripts: ArrayBuffer[];
        private signatures: Map<string, ArrayBuffer>[];
        private completed: boolean[];
        private typeName: string;

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

        public static create(signable: ISignable, typeName: string): PromiseLike<SignatureContext>
        {
            return signable.getScriptHashesForVerifying().then(result =>
            {
                let context = new SignatureContext();
                context.signable = signable;
                context.scriptHashes = result;
                context.redeemScripts = new Array<ArrayBuffer>(result.length);
                context.signatures = new Array<Map<string, ArrayBuffer>>(result.length);
                context.completed = new Array<boolean>(result.length);
                context.typeName = typeName;
                return context;
            });
        }

        public static fromJson(json: any): PromiseLike<SignatureContext>
        {
            let t: () => void = eval(json["type"]);

            let signable: Core.ISignable = new t();
            let ms = new IO.MemoryStream(json["hex"].hexToBytes(), false);
            let reader = new IO.BinaryReader(ms);
            signable.deserializeUnsigned(reader);

            return Core.SignatureContext.create(signable, json["type"]).then(result =>
            {
                for (let i = 0; i < json["scripts"].length; i++)
                {
                    if (json["scripts"][i] != null)
                    {
                        result.redeemScripts[i] = json["scripts"][i]["redeem_script"].hexToBytes();
                        result.signatures[i] = new Map<string, ArrayBuffer>();
                        let sigs = json["scripts"][i]["signatures"];
                        for (let j = 0; j < sigs.length; j++)
                        {
                            let pubkey = Cryptography.ECPoint.decodePoint((<string>sigs[j]["pubkey"]).hexToBytes(), Cryptography.ECCurve.secp256r1);
                            let signature = (<string>sigs[j]["signature"]).hexToBytes();
                            result.signatures[i].set(pubkey.toString(), signature);
                        }
                        result.completed[i] = json["scripts"][i]["completed"];
                    }
                }
                return result;
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

        public static parse(value: string): PromiseLike<SignatureContext>
        {
            return SignatureContext.fromJson(JSON.parse(value));
        }

        public toJson(): any
        {
            let json = new Object();
            json["type"] = this.typeName;
            let ms = new IO.MemoryStream();
            let writer = new IO.BinaryWriter(ms);
            this.signable.serializeUnsigned(writer);
            json["hex"] = new Uint8Array(ms.toArray()).toHexString();
            json["scripts"] = new Array();
            for (let i = 0; i < this.signatures.length; i++)
            {
                if (this.signatures[i] == null)
                {
                    json["scripts"].push(null);
                }
                else
                {
                    json["scripts"].push(new Object());
                    json["scripts"][i]["redeem_script"] = new Uint8Array(this.redeemScripts[i]).toHexString();
                    let sigs = new Array();
                    this.signatures[i].forEach((value, key) =>
                    {
                        let signature = new Object();
                        signature["pubkey"] = key;
                        signature["signature"] = new Uint8Array(value).toHexString();
                        sigs.push(signature);
                    });
                    json["scripts"][i]["signatures"] = sigs;
                    json["scripts"][i]["completed"] = this.completed[i];
                }
            }
            return json;
        }

        public toString(): string
        {
            return JSON.stringify(this.toJson());
        }
    }
}
