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
            $("#wallet_name").val("wallet");
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_wallet"))
            {
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
                    return Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#create_password").val());
                }).then(wallet =>
                {
                    Global.Wallet = wallet;
                    return master.add(name);
                }).then(results =>
                {
                    formReset("form_create_wallet");
                    $("footer").show();
                    $("#menu_wallet_start").hide();
                    TabBase.showTab("#Tab_Wallet_Backup", true);
                }, reason => alert(reason));
            }
        }
    }
}
