namespace AntShares.Wallets
{
    export class AccountItem
    {
        constructor(public Name: String, public PublicKeyHash: Uint8Array,
            public PrivateKey: Uint8Array, public PublicKeyPoint: Cryptography.ECPoint) { };
    }
}