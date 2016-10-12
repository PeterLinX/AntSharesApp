namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void
        {
            AntShares.Wallets.Master.instance().then(result =>
            {
                return result.get();
            }).then(Open.listWallet);
            $("#open_password").focus();
            console.clear();
        }

        private OnOpenButtonClick = () =>
        {
            if (formIsValid("form_open_wallet"))
            {
                let name = $('#list_wallet_name input[name="wallet"]:checked ').val();
                Implementations.Wallets.IndexedDB.IndexedDBWallet.open(name, $("#open_password").val()).then(result =>
                {
                    Global.Wallet = result;
                    this.clear();
                    alert(Resources.globel.openWalletAlert);
                    $("#open_error").hide();
                    //打开成功后跳转账户管理页面
                    TabBase.showTab("#Tab_Account_Index");
                }, reason => $("#open_error").show());
            }
        }

        private clear()
        {
            $("#open_password").val("");
        }

        private static listWallet(walletNameList: Array<string>): void
        {
            if (walletNameList.length == 0)
            {
                TabBase.showTab("#Tab_Wallet_Create");
            }
            else
            {
                $("#input_wallet_name").hide();
                $("#list_wallet_name").show();
                let ul = $("#list_wallet_name");
                ul.find("li:visible").remove();
                for (let i = 0; i < walletNameList.length; i++)
                {
                    let liTemplet = ul.find("li:eq(0)");
                    let li = liTemplet.clone();
                    li.removeAttr("style");
                    li.find("input").val(walletNameList[i]);
                    li.find("span").text(walletNameList[i]);
                    if (i == 0) //第一个默认选中
                    {
                        li.find("input").attr("checked", 'checked');
                    }
                    ul.append(li);
                }
            }
        }
    }
}
