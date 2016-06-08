namespace AntShares.UI.Account
{
    export class Create extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#create_account_action").click(this.OnCreateButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#account_name").focus();
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_account"))
            {
                let accountName = $("#account_name").val().trim();
                let account = new Wallets.Account();
                let wallet = GlobalWallet.getCurrentWallet();
                wallet.createECDSAKey(accountName, account, (pAccount) =>
                {
                    wallet.createContract(pAccount.PublicKeyHash, pAccount.publicECPoint, (pWallet) =>
                    {
                        wallet.loadAccounts(() =>
                        {
                            wallet.loadContracts(() =>
                            {
                                wallet.loadCoins(() =>
                                {
                                    alert("创建账户成功");
                                    this.clear();
                                    //新建账户成功后跳转至账户管理页面
                                    TabBase.showTab("#Tab_Account_Index");
                                });
                            });
                        });
                    });
                });//createECDSAKey
            }
        }

        private clear()
        {
            $("#account_name").val("");
        }
    }
}