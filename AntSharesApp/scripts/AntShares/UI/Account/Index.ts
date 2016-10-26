namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {

        protected oncreate(): void
        {
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
            let lis = ul.find("li:visible");
            lis.remove();
            let contracts = Global.Wallet.getContracts();
            for (let i = 0; i < contracts.length; i++)
                if (contracts[i].isStandard())
                    addAccountList(contracts[i]);

        }

        private OnCreateButtonClick()
        {
            //TabBase.showTab("#Tab_Account_Create");
            Global.Wallet.createAccount().then(result =>
            {
                addAccountList(Global.Wallet.getContracts(result.publicKeyHash)[0]);
                alert(Resources.global.createAccountAlert);
            });
        }
    }

    function addAccountList(contract: Wallets.Contract)
    {
        let ul = $("#form_account_list").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        let span = li.find("span");//账户
        let a = li.find("a");//详情
        let btn = li.find("button:eq(0)");//导出
        let account = Global.Wallet.getAccount(contract.publicKeyHash);
        btn.click(() =>
        {
            account.export().then(result =>
            {
                alert(Resources.global.WIFis + result);
            });
        })
        a.click(() =>
        {
            TabBase.showTab("#Tab_Account_Details", account, contract);
        });
        contract.getAddress().then(result =>
        {
            span.text(result);
        });
        ul.append(li);
    }
}
