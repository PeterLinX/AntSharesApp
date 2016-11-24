namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#copy-addr").click(this.OnCopyAddress);
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            Global.Wallet.getContracts()[0].getAddress().then(result => {
                $("#receiver").text(result);
            });

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();

            let coins = Global.Wallet.findCoins();
            if (coins.length <= 0)
            {
                $("#Tab_Asset_Index h5").show();
                return;
            }
            else
            {
                $("#Tab_Asset_Index h5").hide();
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

        protected OnCopyAddress(): void
        {

        }

        private static addCoinList(item: { assetId: Uint256, amount: Fixed8 })
        {
            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            li.find(".asset_value").text(item.amount.toString());
            Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset = <Core.RegisterTransaction>result;
                if (asset.assetType == AntShares.Core.AssetType.AntShare || asset.assetType == AntShares.Core.AssetType.AntCoin) {
                    li.find(".asset_issuer").text(Resources.global.issuer + Resources.global.theAntsharesSystem);
                } else
                {
                    li.find(".asset_issuer").text(Resources.global.issuerPubKey + asset.issuer.toString());
                }
                li.find(".asset_name").text(asset.getName());
                ul.append(li);
            });
        }
    }
}
