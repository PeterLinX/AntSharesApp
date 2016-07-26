namespace AntShares.Cryptography
{
    class CryptoKey
    {
        constructor(public type: string, public extractable: boolean, public algorithm: Algorithm, public usages: string[])
        {
        }
    }

    export class AesCryptoKey extends CryptoKey
    {
        constructor(private _key_bytes: Uint8Array)
        {
            super("secret", true, { name: "AES-CBC", length: _key_bytes.length * 8 }, ["encrypt", "decrypt"]);
        }

        public static create(length: number): AesCryptoKey
        {
            if (length != 128 && length != 192 && length != 256)
                throw new RangeError();
            let key = new AesCryptoKey(new Uint8Array(length / 8));
            window.crypto.getRandomValues(key._key_bytes);
            return key;
        }

        public export(): Uint8Array
        {
            return this._key_bytes;
        }

        public static import(keyData: ArrayBuffer | ArrayBufferView): AesCryptoKey
        {
            if (keyData.byteLength != 16 && keyData.byteLength != 24 && keyData.byteLength != 32)
                throw new RangeError();
            return new AesCryptoKey(Uint8Array.fromArrayBuffer(keyData));
        }
    }

    export class ECDsaCryptoKey extends CryptoKey
    {
        constructor(public publicKey: ECPoint, public privateKey?: Uint8Array)
        {
            super(privateKey == null ? "public" : "private", true, { name: "ECDSA", namedCurve: "P-256" }, [privateKey == null ? "verify" : "sign"]);
        }
    }
}
