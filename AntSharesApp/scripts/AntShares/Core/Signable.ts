namespace AntShares.Core
{
    export interface Signable
    {
        sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)

        //为需要签名的数据提供一个接口
        //_scripts: Script[];

        //获得需要校验的脚本Hash值
        //GetScriptHashesForVerifying(): UInt160[];

    }
}