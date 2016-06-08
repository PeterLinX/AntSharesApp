namespace AntShares.UI.Account
{
    export class Import extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#import_prikey").click(this.OnImportButtonClick);
        }

        protected onload(): void
        {
        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_create_wallet"))
            {
                let wif = $("#import_prikey_input").val()
                let wallet = GlobalWallet.getCurrentWallet();
                checkPrivateKeyWIF(wif, (prikey) =>
                {
                    for (let i = 0; i < wallet.accounts.length; i++)
                    {
                        if (Equals(wallet.accounts[i].PrivateKey, prikey))
                        {
                            alert("该账户在钱包中已存在");
                            return;
                        }
                    }
                    //用私钥生成Account，加密后存到钱包中
                    let publicPoint = Cryptography.ECPoint.multiply(Cryptography.ECCurve.secp256r1.G, prikey);
                    ToScriptHash(publicPoint.encodePoint(true),
                        (publicKeyHash: Uint8Array) =>
                        {
                            let wallet = GlobalWallet.getCurrentWallet();
                            let publicKey = publicPoint.encodePoint(false).subarray(1, 65);
                            wallet.encriptPrivateKeyAndSave(prikey, publicKey, publicKeyHash, "导入账户", () =>
                            {
                                let sc = new Wallets.SignatureContract(publicKeyHash, publicPoint);
                                ToScriptHash(sc.RedeemScript, (ScriptHash: Uint8Array) =>
                                {
                                    let contract = new Wallets.ContractStore(ScriptHash, sc, sc.PublicKeyHash, "SignatureContract");
                                    wallet.addContract(contract, () =>
                                    {
                                        wallet.loadAccounts(() =>
                                        {
                                            wallet.loadContracts(() =>
                                            {
                                                alert("账户导入成功");
                                                TabBase.showTab("#Tab_Account_Index");
                                            })
                                        });
                                    });
                                })
                            });
                        });
                },
                    (msg) =>
                    {
                        $("#import_error").text(msg);
                    });
            }
        }
    }

    export function checkPrivateKeyWIF(wif: string, success: (prikey: Uint8Array) => any, error: (msg: string) => any)
    {
        let decode = wif.base58Decode();
        if (decode[0] != 0x80 || decode[33] != 0x01)
        {
            error("格式错误");
            return;
        }
        let checkA = decode.subarray(34, 38);

        let data = new Uint8Array(38);
        decode = decode.subarray(0, 34);
        sha256Twice(decode,
            (result) =>
            {
                let checkB = result.subarray(0, 4);
                if (Equals(checkA, checkB))
                {
                    let prikey = decode.subarray(1, 33);
                    success(prikey);
                }
                else
                {
                    error("未通过校验，请检查拼写");
                }
            },
            (msg) =>
            {
                error(msg);
            })
    }
}