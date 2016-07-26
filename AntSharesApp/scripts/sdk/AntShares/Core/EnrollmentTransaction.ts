namespace AntShares.Core
{
    export class EnrollmentTransaction extends Transaction
    {
        public publicKey: Cryptography.ECPoint;

        public get systemFee() { return Fixed8.fromNumber(1000); }

        constructor()
        {
            super(TransactionType.EnrollmentTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.publicKey = Cryptography.ECPoint.deserializeFrom(reader, Cryptography.ECCurve.secp256r1);
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            let hashes = new Map<string, Uint160>();
            return super.getScriptHashesForVerifying().then(result =>
            {
                for (let i = 0; i < result.length; i++)
                    hashes.set(result[i].toString(), result[i]);
                return Wallets.Contract.createSignatureRedeemScript(this.publicKey).toScriptHash();
            }).then(result =>
            {
                hashes.set(result.toString(), result);
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
            writer.write(this.publicKey.encodePoint(true).buffer);
        }
    }
}
