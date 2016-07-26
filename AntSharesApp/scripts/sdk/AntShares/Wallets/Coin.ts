namespace AntShares.Wallets
{
    export class Coin implements IO.Caching.ITrackable<string>
    {
        public input: Core.TransactionInput;
        public assetId: Uint256;
        public value: Fixed8;
        public scriptHash: Uint160;
        public trackState: IO.Caching.TrackState;

        public get key() { return this.input.toString(); }

        private _state = CoinState.Unconfirmed;
        public get state() { return this._state; }
        public set state(value)
        {
            if (this._state != value)
            {
                this._state = value;
                if (this.trackState == IO.Caching.TrackState.None)
                    this.trackState = IO.Caching.TrackState.Changed;
            }
        }

        public equals(other: Coin): boolean
        {
            if (this === other) return true;
            if (null === other) return false;
            return this.input.equals(other.input);
        }

        public getAddress(): PromiseLike<string>
        {
            return Wallet.toAddress(this.scriptHash);
        }
    }
}
