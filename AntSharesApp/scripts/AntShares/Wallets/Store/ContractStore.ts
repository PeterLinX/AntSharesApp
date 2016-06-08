namespace AntShares.Wallets
{
    export class ContractStore extends DBStore
    {
        Name: string; //作为Contract表的主键
        constructor(public ScriptHash: Uint8Array, public RawData: any, public PublicKeyHash: Uint8Array, public Type: string)
        {
            super();
            this.Name = ScriptHash.base58Encode();
        }
    }
}