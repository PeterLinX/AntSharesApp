namespace AntShares.UI.Wallet
{
    export class Create extends TabBase
    {
        private account: Wallets.Account;
        private CurrentHeight: number;

        protected oncreate(): void
        {
            $(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
        }

        protected onload(): void
        {
            Core.Blockchain.Default.getBlockCount().then(result =>
            {
                this.CurrentHeight = result - 1;
            });
            $("#wallet_name").focus();
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
                    this.clear();
                    TabBase.showTab("#Tab_Account_Index");
                }, reason => alert(reason));
            }
        }

        //删除当前所有钱包，测试用
        private OnDeleteButtonClick = () =>
        {
            console.clear();
            let master: Wallets.Master;
            Wallets.Master.instance().then(result =>
            {
                master = result;
                if (Global.Wallet != null)
                    return Global.Wallet.close();
            }).then(() =>
            {
                Global.Wallet = null;
                return master.get();
            }).then(result =>
            {
                let promises = new Array<PromiseLike<void>>();
                for (let i = 0; i < result.length; i++)
                {
                    promises.push(Implementations.Wallets.IndexedDB.IndexedDBWallet.delete(result[i]));
                }
                return Promise.all(promises);
            }).then(() =>
            {
                master.close();
                return Implementations.Wallets.IndexedDB.DbContext.delete("master");
            });
        }

        private clear()
        {
            $("#wallet_name").val("");
            $("#create_password").val("");
            $("#create_password_confirm").val("");
        }
    }
}
