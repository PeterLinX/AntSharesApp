namespace AntShares.UI.Wallet
{
    export class Create extends TabBase
    {
        private account: Wallets.Account;

        protected oncreate(): void
        {
            $(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
        }

        protected onload(): void
        {
            setTitle(0);
            $("#create_wallet").text(Resources.global.createWallet);
            $("#wallet_name").val("wallet");
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_wallet"))
            {
                if ($("#create_wallet").text() == Resources.global.pleaseWait)
                {
                    console.log("重复点击");
                    return;
                }
                $("#create_wallet").text(Resources.global.pleaseWait);
                setTimeout(() => { this.CreateRun() }, 100);
            }
        }

        private CreateRun()
        {
            let name = "wallet";
            if (Global.isConnected == false) {
                alert(Resources.global.RPCError);
                $("#create_wallet").text(Resources.global.createWallet);
                return;
            }
            let master: Wallets.Master;
            Wallets.Master.instance().then(result => {
                master = result;
                return master.get();
            }).then(result => {
                if (result.indexOf(name) >= 0)
                    throw new Error(Resources.global.sameWalletName);
                return Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#create_password").val());
            }).then(wallet => {
                Global.Wallet = wallet;
                return master.add(name);
            }).then(results => {
                $("#create_wallet").text(Resources.global.createWallet);
                formReset("form_create_wallet");
                $("footer").show();
                $(".menu-progress").show();
                $("#menu_wallet_start").hide();
                $(".camera").show();
                TabBase.showTab("#Tab_Wallet_Backup", true);
            }, reason => {
                alert(reason);
                $("#create_wallet").text(Resources.global.createWallet);
            });
        }
    }
}
