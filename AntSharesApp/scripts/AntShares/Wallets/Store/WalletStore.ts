namespace AntShares.Wallets
{
    export class WalletStore extends DBStore
    {
        Name: string;
        constructor(name: string)
        {
            super();
            this.Name = name;
        }
    }
}