namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

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
            setTitle(1);
            let tbody = $("#Tab_Asset_TransactionList").find("tbody:eq(0)");
            tbody.find("tr :visible").remove();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open().then(() =>
            {
                this.loadTransactionList();
            });

            let ul = $("#Tab_Asset_Index").find("ul:eq(0)");
            ul.find("li :visible").remove();

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
                if (asset.assetType == AntShares.Core.AssetType.AntShare) {
                    $("#my_ans").text(item.amount.toString())
                }
                else if (asset.assetType == AntShares.Core.AssetType.AntCoin)
                {
                    $("#my_anc").text(item.amount.toString())
                } else
                {
                    li.find(".asset_issuer").text(Resources.global.issuerPubKey + asset.issuer.toString());
                }
                li.find(".asset_name").text(asset.getName());
                ul.append(li);
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
                    $("#Tab_Asset_TransactionList > h5").show();
                    $("#Tab_Asset_TransactionList > table").hide();
                    throw new Error(Resources.global.noTxs);
                }
                else
                {
                    $("#Tab_Asset_TransactionList > h5").hide();
                    $("#Tab_Asset_TransactionList > table").show();
                    let txArray = linq(arrayTransaction).orderByDescending(p => p.time).toArray();
                    let result = Promise.resolve();
                    execute = function (): PromiseLike<void>
                    {
                        for (let i = 0; i < txArray.length; i++)
                        {
                            let tbody = $("#Tab_Asset_TransactionList").find("tbody:eq(0)");
                            let trTemp = tbody.find("tr:eq(0)");
                            let tr = trTemp.clone(true);
                            tr.removeAttr("style");

                            let tx = Core.Transaction.deserializeFrom(txArray[i].rawData.hexToBytes().buffer);
                            result = result.then(() =>
                            {
                                return tx.ensureHash();
                            }).then(() =>
                            {
                                return Global.Blockchain.getBlockCount();
                            }).then(currentHeight =>
                            {
                                let confirmations: number = currentHeight - txArray[i].height + 1;
                                tr.find(".tx-time").text(new Date(parseInt(txArray[i].time) * 1000).toLocaleString());
                                tr.find(".tx-id").text(tx.hash.toString());
                                if (confirmations <= 0)
                                {
                                    tr.find(".tx-confirm").text(Resources.global.unConfirmed);
                                } else
                                {
                                    tr.find(".tx-confirm").text(confirmations);
                                }
                                tr.find(".tx-confirm").attr("href", "http://antcha.in/tx/hash/" + tx.hash.toString());
                                tr.find(".tx-type").text(convertTxType(tx.type));
                                tbody.append(tr);
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
                console.log(Resources.global.noTxs);
            }).catch(e =>
            {
                alert(e);
            });
        }

    }
}
