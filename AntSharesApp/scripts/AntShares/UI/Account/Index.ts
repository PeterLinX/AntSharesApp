namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#asset_show_more").click(this.OnShowMore);
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);

            $("#my_ans").text("0");
            $("#my_anc").text("0");

            let tx_ul = $("#Account_TransactionList").find("ul:eq(0)");
            tx_ul.find("li.add").remove();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open().then(() =>
            {
                this.loadTransactionList();
            });
            let asset_ul = $("#Tab_Account_Index").find("ul:eq(0)");
            asset_ul.find(".add").remove();

            let coins = Global.Wallet.findCoins();

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

        private OnShowMore =()=>
        {
            if ($("#asset_show_more").hasClass("rotate180"))
            {
                $("#asset_show_more").removeClass("rotate180");
                $(".blue-panel").css("height", "240");
                $(".other-assets").hide("400");
            }
            else
            {
                $("#asset_show_more").addClass("rotate180");
                let otherAssetCount = $("#Tab_Account_Index").find("ul:eq(0)").find("li").length - 1;
                console.log(otherAssetCount);
                if (otherAssetCount)
                    $(".blue-panel").css("height", (320 + otherAssetCount * 40).toString());
                else
                    $(".blue-panel").css("height", 320);
                $(".other-assets").show("400");
            }
        }

        private static addCoinList(item: { assetId: Uint256, amount: Fixed8 })
        {
            let ul = $("#Tab_Account_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset = <Core.RegisterTransaction>result;
                if (asset.assetType == AntShares.Core.AssetType.AntShare) {
                    $("#my_ans").text(convert(item.amount.toString()))
                }
                else if (asset.assetType == AntShares.Core.AssetType.AntCoin)
                {
                    $("#my_anc").text(convert(item.amount.toString()))
                } else {
                    li.find(".asset_value").text(convert(item.amount.toString()));
                    li.find(".asset_issuer").text(asset.issuer.toString());
                    li.find(".asset_name").text(asset.getName());
                    li.addClass("add");
                    ul.append(li);
                }
            });
        }

        private loadTransactionList = (): PromiseLike<any> =>
        {
            let _transaction = this.db.transaction("Transaction", "readonly");
            let arrayTransaction = new Array<any>();
            let execute: () => PromiseLike<void>;
            _transaction.store("Transaction").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    arrayTransaction.push(cursor.value);
                    cursor.continue();
                }
            };
            return _transaction.commit().then(() =>
            {
                if (arrayTransaction.length <= 0)
                {
                    $("#Account_TransactionList .empty").show();
                    $("#Account_TransactionList .title").hide();
                    throw new Error(Resources.global.noTxs);
                }
                else
                {
                    $("#Account_TransactionList .empty").hide();
                    $("#Account_TransactionList .title").show();
                    let txArray = linq(arrayTransaction).orderByDescending(p => p.time).toArray();
                    let result = Promise.resolve();
                    execute = function (): PromiseLike<void>
                    {
                        for (let i = 0; i < txArray.length; i++)
                        {
                            let ul = $("#Account_TransactionList").find("ul:eq(0)");
                            let liTemp = ul.find("li:eq(0)");
                            let li = liTemp.clone(true);
                            li.removeAttr("style");

                            let tx = Core.Transaction.deserializeFrom(txArray[i].rawData.hexToBytes().buffer);
                            result = result.then(() =>
                            {
                                return tx.ensureHash();
                            }).then(() =>
                            {
                                li.find(".tx-time").text(new Date(parseInt(txArray[i].time) * 1000).toLocaleString());
                                li.find(".tx-id").text(tx.hash.toString());
                                // li.find(".tx-id").attr("href", "http://antcha.in/tx/hash/" + tx.hash.toString());
                                li.find(".tx-id").bind("click", function(){
  
                                    let target = "_blank";
                                    let options = "location=yes";
                                    let inAppBrowserRef = (<any>cordova).InAppBrowser.open("http://antcha.in/tx/hash/" + tx.hash.toString(), target, options);
                                });

                                // let ref = (<any>cordova).InAppBrowser.open('http://antcha.in/tx/hash/' + tx.hash.toString(), '_blank', 'location=yes');
                                //li.find(".tx-id").attr("target", "_blank");
                                li.find(".tx-type").text(convertTxType(tx.type));
                                li.addClass("add");
                                ul.append(li);
                            });
                        }
                        return result;
                    }
                }
            }).then(() =>
            {
                execute();
            }, onreject =>
            {
                debugLog(Resources.global.noTxs);
            }).catch(e =>
            {
                alert(e);
            });
        }
    }
}
