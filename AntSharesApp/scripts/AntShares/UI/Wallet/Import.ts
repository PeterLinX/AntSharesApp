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
            setTitle(0);
            formReset("form_account_import");
        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_account_import"))
            {
                let wifPrivateKey: string = $("#import_prikey_input").val();
                let account: Wallets.Account;
                let name = "wallet"
                AntShares.Wallets.Wallet.getPrivateKeyFromWIF(wifPrivateKey).then(result =>
                {
                    return AntShares.Wallets.Account.create(new Uint8Array(result));
                },(e) =>
                {
                    throw new Error(Resources.global.privateIsWrong);
                }).then(result =>
                {
                    account = result;
                    if ($("#remote_height").text() == "0")
                    {
                        throw new Error(Resources.global.RPCError);
                    }
                    return Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#import_password").val(), false);
                }).then(wallet =>
                {
                    Global.Wallet = wallet;
                    return Wallets.Master.instance();
                }).then(master =>
                {
                    return master.add(name);
                }).then(results =>
                { 
                    let accounts = Global.Wallet.getAccounts();
                    let wifPublicKeyHash = account.publicKeyHash.toString();
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
                    return Global.Wallet.rebuild();
                }).then(() =>
                {
                    $("footer").show();
                    $(".menu-progress").show();
                    $("#menu_wallet_start").hide();
                    TabBase.showTab("#Tab_Account_Index");
                }).catch(e =>
                {
                    alert("failed: " + e.message + "\r\n" + e.stack)
                });
            }
        }
    }
}
