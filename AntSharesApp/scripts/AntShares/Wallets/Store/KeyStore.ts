namespace AntShares.Wallets
{
    export class KeyStore extends DBStore
    {
        constructor(public Name: string, public Value: any)
        {
            super();
        }
    }
}