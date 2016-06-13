namespace AntShares.Core
{

    //为需要签名的数据提供一个接口
    export interface Signable
    {
        sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)

        //用于验证该对象的脚本列表
        scripts: Script[];

        //获得需要校验的脚本Hash值
        GetScriptHashesForVerifying(): Uint8Array[];//UInt160

        /**
         * 反序列化未签名的数据
         * @param reader 数据来源
         */
        DeserializeUnsigned(reader:string): void;


        /**
         * 序列化未签名的数据
         * @param writer 存放序列化后的结果
         */
        SerializeUnsigned(writer:string): void;
    }
}