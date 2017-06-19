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
            $("#import_prikey").text(Resources.global.importPrikey);
            formReset("form_account_import");
        }
        
        private OnImportButtonClick = () =>
        {
            if (formIsValid("form_account_import"))
            {
                if ($("#import_prikey").text() == Resources.global.pleaseWait) {
                    console.log("重复点击");
                    return;
                }
                $("#import_prikey").text(Resources.global.pleaseWait);
                setTimeout(() => { this.ImportRun() }, 100);
            }
        }
        private ImportRun() {
            let wifPrivateKey: string = $("#import_prikey_input").val();
            let account: Wallets.Account;
            let name = "wallet"
            Promise.resolve(1).then(() =>
            {
                try
                {
                    return AntShares.Wallets.Wallet.getPrivateKeyFromWIF(wifPrivateKey);
                } catch (e)
                {
                    $("#import_prikey").text(Resources.global.importPrikey);
                    throw new Error(Resources.global.privateIsWrong);
                }
            }).then(result =>
            {
                return AntShares.Wallets.Account.create(new Uint8Array(result));
            },(e) =>
            {
                $("#import_prikey").text(Resources.global.importPrikey);
                throw new Error(Resources.global.privateIsWrong);
            }).then(result =>
            {
                account = result;
                if ($("#remote_height").text() == "0")
                {
                    $("#import_prikey").text(Resources.global.importPrikey);
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
                        $("#import_prikey").text(Resources.global.importPrikey);
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
                $("#import_prikey").text(Resources.global.importPrikey);
                $("footer").show();
                $(".menu-progress").show();
                $("#menu_wallet_start").hide();
                setCookie("hasBackup", "1", 365);
                TabBase.showTab("#Tab_Account_Index");
                $(".camera").show();
            }).catch(e =>
            {
                $("#import_prikey").text(Resources.global.importPrikey);
                alert(e.message);
            });
        }
    }
}
