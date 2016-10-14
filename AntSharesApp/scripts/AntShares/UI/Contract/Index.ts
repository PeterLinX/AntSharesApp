namespace AntShares.UI.Contract
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#contract_list_wallet").text(Global.Wallet.dbPath);
            let ul = $("#Tab_Contract_Index #form_contract_list").find("ul:eq(0)");
            ul.find("li:visible").remove();
            let contracts = Global.Wallet.getContracts();
            for (let i = 0; i < contracts.length; i++)
                if (!contracts[i].isStandard())
                    this.addContractList(contracts[i]);
        }

        private addContractList(contract: Wallets.Contract)
        {
            let ul = $("#form_contract_list").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");

            let spanAddress = li.find("span:eq(0)");
            let a = li.find("a");
            a.click(() =>
            {
                TabBase.showTab("#Tab_Contract_Details", contract);
            });
            contract.getAddress().then(result =>
            {
                spanAddress.text(result);
                ul.append(li);
            });
        }
    }
}
