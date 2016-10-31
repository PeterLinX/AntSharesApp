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
                    return Promise.all<any>([
                        master.add(name),
                        Implementations.Wallets.IndexedDB.IndexedDBWallet.create(name, $("#create_password").val())
                    ]);
                }).then(results =>
                {
                    Global.Wallet = results[1];
                    formReset("form_create_wallet");
                    TabBase.showTab("#Tab_Account_Index");
                }, reason => alert(reason));
            }
        }
    }
}
