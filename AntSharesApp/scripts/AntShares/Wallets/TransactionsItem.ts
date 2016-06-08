namespace AntShares.Wallets
{
    export class TransactionItem
    {
        constructor(public Hash: String, public Type: Core.TransactionType, public RawData: Uint8Array) { }
    }
}