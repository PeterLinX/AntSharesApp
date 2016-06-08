namespace AntShares.Wallets
{
    export class CoinStore extends DBStore
    {
        private Name: string; //作为Core表的主键
        constructor(public Input: AntShares.Core.TransactionInput, public AssetId : Uint8Array, //UInt256,
            public Value: Fixed8, public Address: string,
            public State: AntShares.Core.CoinState)
        {
            super();
            this.Name = Input.txid + Input.vout;
        }
    }
}