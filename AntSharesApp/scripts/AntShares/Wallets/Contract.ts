namespace AntShares.Wallets
{
    export abstract class Contract
    {
        //合约脚本代码
        public RedeemScript: Uint8Array;

        //公钥散列值，用于标识该合约在钱包中隶属于哪一个账户
        public PublicKeyHash: Uint8Array;

        //合约地址
        //TODO:可能需要改造此Address
        public Address: string;

        // 脚本散列值
        public ScriptHash: Uint8Array;
        
        public Type: string;
        
        public abstract IsCompleted(publicKeys: Array<Cryptography.ECPoint>): boolean
    }
}