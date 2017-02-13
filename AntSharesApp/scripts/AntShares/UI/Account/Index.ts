namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

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
            setTitle(1);

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

        private static addCoinList(item: { assetId: Uint256, amount: Fixed8 })
        {
            let ul = $("#Tab_Account_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset = <Core.RegisterTransaction>result;
				li.find(".asset_value").text(convert(item.amount.toString()));
				
				li.find(".asset_name").text(asset.getName());
				li.addClass("add");
				
                if (asset.assetType == AntShares.Core.AssetType.AntShare || asset.assetType == AntShares.Core.AssetType.AntCoin)
				{
					li.find(".asset_issuer").text(Resources.global.theAntsharesSystem);
                }
				else
                {
                    li.find(".asset_issuer").text(asset.issuer.toString());
                }
				ul.append(li);
				$(".blue-panel").height($("#Tab_Account_Index").find("ul:eq(0)").find("li").length * 42);
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
                                console.log(tx);
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
                //console.log(Resources.global.noTxs);
            }).catch(e =>
            {
                alert(e);
            });
        }
    }
}
