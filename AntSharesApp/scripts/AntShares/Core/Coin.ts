namespace AntShares.Core
{
    export class Coin
    {
        input: TransactionInput;
        sssetId: number;
        value: number;
        scriptHash: Uint8Array;
        state: CoinState;
    }

    export enum CoinState
    {
        Unconfirmed,
        Unspent,
        Spending,
        Spent,
        SpentAndClaimed
    }
}