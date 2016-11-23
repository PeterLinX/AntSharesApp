namespace AntShares.UI.Wallet
{
    export class Import extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#import_prikey").click(this.OnImportButtonClick);
        }

        protected onload(): void
        {
            formReset("form_account_import");
        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_account_import"))
            {
                //创建钱包
                let name = "wallet";
                if ($("#remote_height").text() == "0")
                {
                    alert(Resources.global.RPCError);
                    return;
                }
                let master: Wallets.Master;
                Wallets.Master.instance().then(result =>
                {
                    master = result;
                    return master.get();
                }).then(result =>
                {
                    if (result.indexOf(name) >= 0)
                        throw new Error(Resources.global.sameWalletName);
                    return Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#import_password").val());
                }).then(wallet =>
                {
                    Global.Wallet = wallet;
                    return master.add(name);
                }).then(results =>
                {
                    //导入私钥
                    let wifPrivateKey: string = $("#import_prikey_input").val();
                    let accounts: AntShares.Wallets.Account[];
                    AntShares.Wallets.Wallet.getPrivateKeyFromWIF(wifPrivateKey).then(result =>
                    {
                        return AntShares.Wallets.Account.create(new Uint8Array(result));
                    }).then(result =>
                    {
                        accounts = Global.Wallet.getAccounts();
                        let wifPublicKeyHash = result.publicKeyHash.toString();
                        for (let i = 0; i < accounts.length; i++)
                        {
                            if (wifPublicKeyHash == accounts[i].publicKeyHash.toString())
                            {
                                throw new Error(Resources.global.accountAlreadyExits);
                            }
                        }
                        return Global.Wallet.import(wifPrivateKey);
                    }).then(result =>
                    {
                        alert(Resources.global.importAccountAlert);
                    }).then(() =>
                    {
                        return Global.Wallet.rebuild();
                    }).then(() =>
                    {
                        TabBase.showTab("#Tab_Account_Index");
                    }).catch(e =>
                    {
                        alert(e);
                    });;
                }, reason => alert(reason));
            }
        }
    }
}
