namespace AntShares.UI.Account {
    export class Index extends TabBase {
        private CurrentHeight: number;

        protected oncreate(): void {
            $(this.target).find("#create_account").click(this.OnCreateButtonClick);
        }
        
        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#account_list_wallet").text(Global.Wallet.dbPath);
            let ul = $("#form_account_list").find("ul:eq(0)");
            ul.find("li :visible").remove();
            let accounts = Global.Wallet.getAccounts();
            for (let i = 0; i < accounts.length; i++)
            {
                addAccountList(accounts[i]);
            }

            let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
            rpc.call("getblockcount", []).then(result =>
            {
                this.CurrentHeight = result - 1;
            });
        }

        private OnCreateButtonClick()
        {
            TabBase.showTab("#Tab_Account_Create");
        }
    }

    function addAccountList(account: Wallets.Account)
    {
        let ul = $("#form_account_list").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");//账户
        let a = li.find("a");//详情
        let btn = li.find("button:eq(0)");//导出
        btn.click(() =>
        {
            account.export().then(result =>
            {
                alert("WIF格式的私钥为：" + result);
            });
        })
        a.click(() =>
        {
            TabBase.showTab("#Tab_Account_Details", account);
        });
        span.text(account.publicKeyHash.toString());
        ul.append(li);
    }

}