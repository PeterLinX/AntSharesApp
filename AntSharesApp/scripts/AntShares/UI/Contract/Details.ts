namespace AntShares.UI.Contract
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let contract = args[0] as Wallets.Contract;
            $("#contract_type").text("AntShares.Wallets.MultiSigContract");
            $("#contract_content").text(new Uint8Array(contract.redeemScript).toHexString());
            $("#contract_scripthash").text(contract.scriptHash.toString());
            contract.getAddress().then(result =>
            {
                $("#contract_address").text(result);
            });
        }
    }
}