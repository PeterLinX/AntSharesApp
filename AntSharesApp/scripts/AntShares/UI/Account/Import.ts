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
            $("#import_prikey_input").val("");
        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_create_wallet")) {
                let wifPrivateKey: string = $("#import_prikey_input").val();
                let accounts: AntShares.Wallets.Account[];
                AntShares.Wallets.Wallet.getPrivateKeyFromWIF(wifPrivateKey).then(result => {
                    return AntShares.Wallets.Account.create(new Uint8Array(result));
                }).then(result => {
                    accounts = Global.Wallet.getAccounts();
                    let wifPublicKeyHash = result.publicKeyHash.toString();
                    for (let i = 0; i < accounts.length; i++)
                    {
                        if (wifPublicKeyHash == accounts[i].publicKeyHash.toString()) {
                            throw new Error("该账户已经存在！");
                        }
                    }
                    return Global.Wallet.import(wifPrivateKey);
                    }).then(result => {
                    alert(Resources.global.importAccountAlert);
                    }).then(() => {
                        return Global.Wallet.rebuild();
                    }).then(() => {
                        TabBase.showTab("#Tab_Account_Index");
                    }).catch(e => {
                        alert(e);
                    });;
            }
        }
    }
}
