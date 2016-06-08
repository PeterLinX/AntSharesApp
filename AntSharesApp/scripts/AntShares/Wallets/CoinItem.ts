namespace AntShares.Wallets
{
    export class CoinItem
    {
        constructor(public Input: Core.TransactionInput, public Address: string,
            public State: AntShares.Core.CoinState, public AssetId: Uint8Array, //UInt256
            public Value: Fixed8) { }
        public toKey(): string
        {
            return this.Input.txid + this.Input.vout + this.AssetId + this.Value + this.Address + this.State;
        }
    }
}