namespace AntShares.UI.Contract
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let wallet = GlobalWallet.getCurrentWallet();
            let i = args[0] as number;
            $("#contract_type").text(wallet.contracts[i].Type);
            $("#contract_content").text(wallet.contracts[i].RedeemScript.toHexString());
            $("#contract_scripthash").text(wallet.contracts[i].ScriptHash.toHexString());
            $("#contract_address").text(wallet.contracts[i].Address);
        }
    }
}