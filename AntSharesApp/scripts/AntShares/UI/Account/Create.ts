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
                Global.Wallet.createAccount().then(result =>
                {
                    alert("创建账户成功");
                    this.clear();
                    //新建账户成功后跳转至账户管理页面
                    TabBase.showTab("#Tab_Account_Index");
                });
            }
        }

        private clear()
        {
            $("#account_name").val("");
        }
    }
}