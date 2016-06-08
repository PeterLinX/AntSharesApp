namespace AntShares.Wallets
{
    //表示智能合约的参数类型
    export enum ContractParameterType
    {
        // 签名
        Signature,
        // 整数
        Integer,
        // 160位散列值
        Hash160,
        // 256位散列值
        Hash256,
        // 字节数组
        ByteArray
    }
}
