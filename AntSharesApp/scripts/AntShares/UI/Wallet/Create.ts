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
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_wallet"))
            {
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
                    let name = $("#wallet_name").val().trim();
                    if (result.indexOf(name) >= 0)
                        throw new Error(Resources.global.sameWalletName);
                    return Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#create_password").val());
                }).then(wallet =>
                {
                    Global.Wallet = wallet;
                    return master.add($("#wallet_name").val().trim());
                }).then(results =>
                {
                    formReset("form_create_wallet");
                    TabBase.showTab("#Tab_Config_Backup", true);
                    }, reason => alert(reason));
            }
        }
    }
}
