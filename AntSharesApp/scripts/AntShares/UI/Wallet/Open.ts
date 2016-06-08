namespace AntShares.UI.Wallet
{
    export class Open extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnOpenButtonClick);
            $(this.target).find("#open_password").change(() => { this.vertifyPassword() });
            $(this.target).find("#list_wallet_name input[name='wallet']").change(() => { this.vertifyPassword() }); //没有触发
        }

        private vertifyPassword()
        {
            verifyPassword(
                $('#list_wallet_name input[name="wallet"]:checked').val(),
                "open_password",
                "open_error")
        }

        protected onload(): void
        {
            let master = AntShares.Wallets.Master.GetInstance();
            master.OpenDB(
                () =>
                {
                    master.GetWalletNameList(listWallet)
                }
            );
            $("#open_password").focus();
            console.clear();
        }

        private OnOpenButtonClick()
        {
            if (formIsValid("form_open_wallet"))
            {
                let wallet = GlobalWallet.newWallet();
                let walletName = $('#list_wallet_name input[name="wallet"]:checked ').val();
                wallet.openDB(walletName, () =>
                {
                    wallet.verifyPassword($("#open_password").val().toUint8Array(), () =>
                    {
                        wallet.loadSomething(() =>
                        {
                            alert("打开钱包成功");
                            $("#open_error").hide();
                            //打开成功后跳转账户管理页面
                            TabBase.showTab("#Tab_Account_Index");
                            let sync = new AntShares.UI.Sync();
                            sync.startSyncWallet();
                        });
                    }, () =>
                        {
                            $("#open_error").show();
                        }
                    );
                })
            }
        }
    }

    function listWallet(walletNameList: Array<string>)
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