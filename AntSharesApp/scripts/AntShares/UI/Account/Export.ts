namespace AntShares.UI.Account
{
    /**
     * 将私钥以WIF格式导出
     * 参考AntSharesCore项目中的AntShares.Wallets.Account Export();
     * @param privateKey 私钥
     * @param callback 导出后调用的方法，通过回调函数把wif格式的导出传出
     */
    export function Export(privateKey: Uint8Array, callback: (wif: string) => any)
    {
        let data = new Uint8Array(38);
        data[0] = 0x80;
        data.set(privateKey, 1);
        data[33] = 0x01;

        sha256Twice(data.subarray(0, 34), (hash2) =>
        {
            let check = hash2.subarray(0, 4);
            data.set(check, 34);
            let wif = data.base58Encode();
            callback(wif);
        })
    }
}