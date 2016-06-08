namespace AntShares.UI.Asset
{
    import CoinItem = AntShares.Wallets.CoinItem;

    export class Index extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#show_all_coin").click(this.showAllCoin);
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.getCurrentWallet();
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();
            if (wallet.coins.length <= 0)
            {
                $("h5").show();
                return;
            }
            else
            {
                $("h5").hide();
            }

            let group = new Array<CoinItem>();
            for (let i = 0; i < wallet.coins.length; i++)
            {
                if (wallet.coins[i].State != Core.CoinState.Unspent)
                    continue;
                let index = CoinsIndexof(group, wallet.coins[i]);
                if (index < 0)
                {
                    group.push(new CoinItem(wallet.coins[i].Input, wallet.coins[i].Address, wallet.coins[i].State, wallet.coins[i].AssetId, wallet.coins[i].Value));
                }
                else
                {
                    group[index].Value = group[index].Value.add(wallet.coins[i].Value);
                }
            }
            for (let item of group)
            {
                addCoinList(item as CoinItem);
            }
        }

        public showAllCoin()
        {
            let allcoin = $("#Tab_Asset_Index").find(".all-coin");
            let a = $("#show_all_coin");
            let str1 = "显示所有零钱";
            let str2 = "隐藏所有零钱";
            if (a.text() == str1)
            {
                allcoin.show("fast");
                a.text(str2);
                $("#all_coin").find("ul:eq(0)").find("li :visible").remove();
                let wallet = GlobalWallet.getCurrentWallet();
                for (let item of wallet.coins)
                {
                    if (item.State == Core.CoinState.Unspent)
                        addChangeList(item as CoinItem);
                }
            }
            else
            {
                allcoin.hide("fast");
                a.text(str1);
            }
        }
    }
    function CoinsIndexof(coins: CoinItem[], coin: CoinItem): number
    {
        for (let i = 0; i < coins.length; i++)
        {
            if (coins[i].AssetId == coin.AssetId)
                return i;
        }
        return -1;
    }
    function addCoinList(item: CoinItem)
    {
        let wallet = GlobalWallet.getCurrentWallet();
        let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        li.find(".asset_address").text(item.Address);
        li.find(".asset_value").text(item.Value.toString());
        GetAssetName(item.AssetId.reverse().toHexString(), (name) =>
        {
            li.find(".asset_name").text(name);
            li.find(".asset_issuer").text("发行人"); //TODO:发行人
            ul.append(li);
        });
    }
    function addChangeList(item: CoinItem)
    {
        let wallet = GlobalWallet.getCurrentWallet();
        let ul = $("#all_coin").find("ul:eq(0)");;
        let liTemplet = ul.find("li:eq(0)");
        let li = liTemplet.clone(true);
        li.removeAttr("style");
        li.find(".asset_address").text(item.Address);
        li.find(".asset_value").text(item.Value.toString());
        GetAssetName(item.AssetId.reverse().toHexString(), (name) =>
        {
            li.find(".asset_name").text(name);
            ul.append(li);
        });
    }

    function GetAssetName(assetId: string, callback: (name: string) => any)
    {
        let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
        //根据指定的高度（索引），返回对应区块的散列值
        rpc.call("getrawtransaction", [assetId],
            (tx: any) =>
            {
                callback((tx.asset.name as any)[0].name);
            });
    }
}