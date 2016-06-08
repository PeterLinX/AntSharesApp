namespace AntShares.Core
{
    export class TransactionInput
    {
        constructor(public txid: string, public vout: number)
        {
        }
    }
}