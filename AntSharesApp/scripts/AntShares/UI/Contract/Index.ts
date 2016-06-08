namespace AntShares.UI.Contract
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.getCurrentWallet();
            $("#contract_list_wallet").text(wallet.walletName);
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            let ul = $("#form_contract_list").find("ul:eq(1)");
            ul.find("li:visible").remove();
            for (let i = 0; i < wallet.contracts.length; i++)
            {
                this.addContractList(i);
            }
            
        }

        private addContractList(i: number)
        {
            let ul = $("#form_contract_list").find("ul:eq(1)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            let spanAddress = li.find("span:eq(0)");
            let spanType = li.find("span:eq(1)");
            let a = li.find("a");
            a.click(() =>
            {
                TabBase.showTab("#Tab_Contract_Details", i);
            });
            spanAddress.text(GlobalWallet.getCurrentWallet().contracts[i].Address);
            spanType.text(GlobalWallet.getCurrentWallet().contracts[i].Type);
            ul.append(li);
        }

    }

    

}