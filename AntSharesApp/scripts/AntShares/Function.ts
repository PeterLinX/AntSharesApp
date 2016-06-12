
//规范：Function文件中只存放全局函数

function InputEqueal(x: AntShares.Core.TransactionInput, y: AntShares.Core.TransactionInput)
{
    return x.prevHash == y.prevHash && x.prevIndex == y.prevIndex;
}

function CoinsIndexof(coins: AntShares.Wallets.CoinItem[], input: AntShares.Core.TransactionInput): number
{
    for (let i = 0; i < coins.length; i++)
    {
        if (InputEqueal(coins[i].Input, input))
            return i;
    }
    return -1;
}

function encodeUTF8(str: string): string
{
    let temp = "", rs = "";
    for (let i = 0, len = str.length; i < len; i++)
    {
        temp = str.charCodeAt(i).toString(16);
        rs += "\\u" + new Array(5 - temp.length).join("0") + temp;
    }
    return rs;
}

//参照AntShares.Core.Scripts.Helper的对应方法
function ToScriptHash(EncodedPoint: Uint8Array, callback: (scriptHash: ArrayBuffer) => any)
{
    window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        EncodedPoint
    )
        .then(hash =>
        {
            callback(AntShares.Cryptography.RIPEMD160.computeHash(new Uint8Array(hash)));
        }, err =>
        {
            console.error(err);
        })
}

function Equals(x: Uint8Array, y: Uint8Array): boolean
{
    if (x.length != y.length)
        return false;
    for (let i = 0; i < x.length; i++)
        if (x[i] != y[i])
            return false;
    return true;
}

function ToPasswordKey(password: Uint8Array, callback: (key: Uint8Array) => any)
{
    sha256Twice(password, (result) => { callback(result); });
}

function formIsValid(formId: string): boolean
{
    console.clear();
    let demo = $('#' + formId) as any;
    if (!demo.valid())
    {
        console.log("表单验证未通过");
        return false;
    }
    else
    {
        console.log("表单验证通过");
        return true;
    }
}

/**
 * 创建一个新的钱包对象用于验证钱包密码是否正确
 * @param walletName 用户选择的钱包名称。
 * @param inputID 用户输入的钱包密码的文本框ID。
 * @param errorID 显示密码错误的ID。
 */
function verifyPassword(walletName: string, inputID: string, errorID: string)
{
    let wallet = new AntShares.Wallets.Wallet();
    wallet.openDB(walletName,
        () =>
        {
            wallet.verifyPassword(
                $('#' + inputID).val().toUint8Array(),
                () => { $('#' + errorID).hide(); },
                () => { $('#' + errorID).show(); }
            );

        });

}

function toAddress(scriptHash: Uint8Array, callback: (result: string) => any)
{
    let data = new Uint8Array(21);
    data[0] = 0x17;
    data.set(scriptHash, 1);
    sha256Twice(data, (result) =>
    {
        let check = result.subarray(0, 4);
        let add = new Uint8Array(25);
        add.set(data);
        add.set(check, 21);
        let address = add.base58Encode();
        callback(address);
    });
}

function sha256Twice(data: Uint8Array, success: (result: Uint8Array) => any, error = null)
{
    window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        data
    )
        .then((hash) =>
        {
            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                new Uint8Array(hash)
            )
                .then((hash2) =>
                {
                    let result = new Uint8Array(hash2);
                    success(result);
                })
                .catch(function (err)
                {
                    error(err);
                });
        })
        .catch(function (err)
        {
            error(err);
        });
}

/**
 * 用于序列化操作的方法，将Array<Uint8Array>转换为Uint8Array
 */
function ToUint8Array(array: Array<Uint8Array>): Uint8Array
{
    let length = 0;
    for (let i of array)
    {
        length += i.length;
    }
    let result = new Uint8Array(length);
    let p = 0;
    for (let i of array)
    {
        result.set(i, p);
        p += i.length;
    }
    return result;
}

function convert_keyup(obj)
{
    let n = obj.value.replace(/,/g, "") as string;

    let str = n.split('.');
    if (str.length > 2)
        return;
    let z = str[0].split('').reverse().join('');
    let z1 = "";
    for (let i = 0; i < z.length; i++)
    {
        z1 = z1 + z[i];
        if ((i + 1) % 3 == 0 && i < z.length - 1)
            z1 = z1 + ",";
    }
    z1 = z1.split('').reverse().join('');

    let result = z1;
    if (str.length == 2)
    {
        let f = str[1];
        result = result + "." + f;
    }
    obj.value = result;
}

function convert_keydown(obj)
{
    setTimeout(() => { convert_keyup(obj) }, 10);
}

function reverseArray()
{
    let m = Math.floor(this.length / 2);
    for (let i = 0; i < m; i++)
    {
        let swap = this[i];
        this[i] = this[length - 1 - i];
        this[length - 1 - i] = swap;
    }
    return this;
}