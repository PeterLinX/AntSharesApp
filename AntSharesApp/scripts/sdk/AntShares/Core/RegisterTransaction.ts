namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        public assetType: AssetType;
        public name: string;
        public amount: Fixed8;
        public issuer: Cryptography.ECPoint;
        public admin: Uint160;

        public get systemFee()
        {
            return this.assetType == AssetType.AntShare || this.assetType == AssetType.AntCoin ? Fixed8.Zero :
                TESTNET ? Fixed8.fromNumber(100) : Fixed8.fromNumber(10000);
        }

        constructor()
        {
            super(TransactionType.RegisterTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.assetType = reader.readByte();
            this.name = reader.readVarString();
            this.amount = reader.readFixed8();
            this.issuer = Cryptography.ECPoint.deserializeFrom(reader, Cryptography.ECCurve.secp256r1);
            this.admin = reader.readUint160();
        }

        public getName(lang = navigator.language || navigator.browserLanguage): string
        {
            let _names = <Object>JSON.parse(this.name);
            if (_names.hasOwnProperty(lang))
                return _names[lang];
            else if (_names.hasOwnProperty("en"))
                return _names["en"];
            else
                for (let lang in _names)
                    return _names[lang];
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            let hashes = new Map<string, Uint160>();
            return super.getScriptHashesForVerifying().then(result =>
            {
                for (let i = 0; i < result.length; i++)
                    hashes.set(result[i].toString(), result[i]);
                return Wallets.Contract.createSignatureRedeemScript(this.issuer).toScriptHash();
            }).then(result =>
            {
                hashes.set(result.toString(), result);
                hashes.set(this.admin.toString(), this.admin);
                let array = new Array<Uint160>();
                hashes.forEach(hash =>
                {
                    array.push(hash);
                });
                return array.sort((a, b) => a.compareTo(b));
            });
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeByte(this.assetType);
            writer.writeVarString(this.name);
            writer.writeFixed8(this.amount);
            writer.write(this.issuer.encodePoint(true).buffer);
            writer.writeUintVariable(this.admin);
        }
    }
}
