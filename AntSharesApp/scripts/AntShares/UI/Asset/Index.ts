namespace AntShares.UI.Asset
{
    export class Index extends TabBase
    {
        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();

            let coins = Global.Wallet.findCoins();
            if (coins.length <= 0)
            {
                $("h5").show();
                return;
            }
            else
            {
                $("h5").hide();
            }

            let map = new Map<string, { assetId: Uint256, amount: Fixed8 }>();
            for (let i = 0; i < coins.length; i++)
            {
                if (coins[i].state != Wallets.CoinState.Unspent && coins[i].state != Wallets.CoinState.Unconfirmed)
                    continue;
                let key = coins[i].assetId.toString();
                if (map.has(key))
                {
                    let item = map.get(key);
                    item.amount = item.amount.add(coins[i].value);
                }
                else
                {
                    map.set(key, { assetId: coins[i].assetId, amount: coins[i].value });
                }
            }
            map.forEach(Index.addCoinList);
        }

        private static addCoinList(item: { assetId: Uint256, amount: Fixed8 })
        {
            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            li.find(".asset_address").text('-');
            li.find(".asset_value").text(item.amount.toString());
            Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset = <Core.RegisterTransaction>result;
                li.find(".asset_name").text(asset.getName());
                li.find(".asset_issuer").text(asset.issuer.toString());
                ul.append(li);
            });
        }
    }
}
