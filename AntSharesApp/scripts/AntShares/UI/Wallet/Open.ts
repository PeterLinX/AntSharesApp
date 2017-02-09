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
            setTitle(0);
            AntShares.Wallets.Master.instance().then(result =>
            {
                return result.get();
            }).then(Open.listWallet);
            $("#open_error").hide();
        }

        private OnOpenButtonClick = () =>
        {
            if (formIsValid("form_open_wallet"))
            {
                let name = $('#list_wallet_name input[name="wallet"]:checked ').val();
                Implementations.Wallets.IndexedDB.IndexedDBWallet.open(name, $("#open_password").val()).then(result =>
                {
                    if (!result)//兼容IE
                    {
                        $("#open_error").show()
                        return;
                    }
                    Global.Wallet = result;
                    formReset("form_open_wallet");
                    $("#open_error").hide();
                    $(".menu-progress").show();
                    $("#open_password").blur();
                    //打开成功后跳转账户管理页面
                    TabBase.showTab("#Tab_Account_Index");
                }, reason => $("#open_error").show());
            }
        }

        private static listWallet(walletNameList: Array<string>): void
        {
            if (walletNameList.length == 0)
            {
                TabBase.showTab("#Tab_Wallet_Start");
                $("#menu_wallet_open").hide();
                $("footer").hide();
            }
            else
            {
                //$("#open_password").focus();
                $("#menu_wallet_start").hide();
                $("footer").show();

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
