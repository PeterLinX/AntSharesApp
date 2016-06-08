namespace AntShares.Wallets {
    export class Account {

        private _privateKey: Uint8Array;
        get privateKey(): Uint8Array {
            return this._privateKey;
        }
        set privateKey(pPrivateKey: Uint8Array) {
            this._privateKey = pPrivateKey;
        }

        private _publicKey: Uint8Array;
        get publicKey(): Uint8Array {
            return this._publicKey;
        }
        set publicKey(pPublicKey: Uint8Array) {
            this._publicKey = pPublicKey;
        }

        //public publicECPoint: AntShares.Cryptography.ECPoint;
        //public publicKeyHash: Uint8Array;

        private _publicECPoint: AntShares.Cryptography.ECPoint;
        get publicECPoint(): AntShares.Cryptography.ECPoint {
            return this._publicECPoint;
        }
        set publicECPoint(pPublicECPoint: AntShares.Cryptography.ECPoint) {
            this._publicECPoint = pPublicECPoint;
        }

        private _publicKeyHash: Uint8Array;
        get PublicKeyHash(): Uint8Array {
            return this._publicKeyHash;
        }
        set PublicKeyHash(pPublicKeyHash: Uint8Array) {
            this._publicKeyHash = pPublicKeyHash;
        }
    }
}