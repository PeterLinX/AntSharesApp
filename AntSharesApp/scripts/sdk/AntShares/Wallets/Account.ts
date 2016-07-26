namespace AntShares.Wallets
{
    export class Account
    {
        public privateKey: ArrayBuffer;
        public publicKey: Cryptography.ECPoint;
        public publicKeyHash: Uint160;

        public static create(privateKey?: ArrayBuffer | Uint8Array): PromiseLike<Account>
        {
            if (privateKey == null)
            {
                privateKey = new Uint8Array(32);
                window.crypto.getRandomValues(<Uint8Array>privateKey);
            }
            if (privateKey.byteLength != 32 && privateKey.byteLength != 96 && privateKey.byteLength != 104)
                throw new RangeError();
            privateKey = Uint8Array.fromArrayBuffer(privateKey);
            let account = new Account();
            account.privateKey = new ArrayBuffer(32);
            Array.copy(<Uint8Array>privateKey, privateKey.byteLength - 32, new Uint8Array(account.privateKey), 0, 32);
            if (privateKey.byteLength == 32)
                account.publicKey = Cryptography.ECPoint.multiply(Cryptography.ECCurve.secp256r1.G, <Uint8Array>privateKey);
            else
                account.publicKey = Cryptography.ECPoint.fromUint8Array(<Uint8Array>privateKey, Cryptography.ECCurve.secp256r1);
            return account.publicKey.encodePoint(true).toScriptHash().then(result =>
            {
                account.publicKeyHash = result;
                return account;
            });
        }

        public equals(other: Account): boolean
        {
            if (this === other) return true;
            if (null == other) return false;
            return this.publicKeyHash.equals(other.publicKeyHash);
        }

        public export(): PromiseLike<string>
        {
            let data = new Uint8Array(38);
            data[0] = 0x80;
            Array.copy(new Uint8Array(this.privateKey), 0, data, 1, 32);
            data[33] = 0x01;
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, data.byteLength - 4)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", new Uint8Array(result));
            }).then(result =>
            {
                let checksum = new Uint8Array(result, 0, 4);
                Array.copy(checksum, 0, data, data.byteLength - 4, 4);
                let wif = data.base58Encode();
                data.fill(0);
                return wif;
            });
        }
    }
}
