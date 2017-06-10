namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(args: any[]): void
        {
            setTitle(0);
            $(".camera").hide();
			if (args[0])
			{
				$("#gesture_pwd_tips").show();
            }
            if (Global.isDebug)
            {
                $("#developer_tool").show();
                $("#debug_log").show();
            } else {
                $("#developer_tool").hide();
                $("#debug_log").hide();
            }

            AntShares.Wallets.Master.instance().then(result =>
            {
                return result.get();
            }).then(Open.listWallet);
			if (window.innerWidth > 767)
			{
				$("#open_password").focus();
			}
            $("#open_error").hide();
        }

        private OnOpenButtonClick = () =>
        {
            if (formIsValid("form_open_wallet"))
            {
                let name = $('#list_wallet_name').val();
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
                    $("#menu_wallet_open").hide();
                    $(".camera").show();
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
                $("#menu_wallet_start").hide();
                $("footer").show();

                $("#list_wallet_name").show();
                let select = $("#list_wallet_name");
                select.find("option").remove();
                for (let i = 0; i < walletNameList.length; i++)
                {
                    let option = document.createElement("option");
                    option.value = walletNameList[i];
                    option.text = walletNameList[i];
                    select.append(option);
                }
            }
        }
    }
}
