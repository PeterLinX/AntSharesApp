namespace AntShares.Wallets
{
    export class AccountStore extends DBStore
    {
        private ID;
        constructor(public Name: string, public PublicKeyHash: Uint8Array, public PrivateKeyEncrypted: Uint8Array)
        {
            super();
            this.ID = this.Name + this.PublicKeyHash.base58Encode().substr(0, 8)
        }
    }
}