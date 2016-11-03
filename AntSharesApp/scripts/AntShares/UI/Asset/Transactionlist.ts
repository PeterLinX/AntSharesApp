namespace AntShares.UI.Asset {
    export class TransactionList extends TabBase {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            let tbody = $("#Tab_Asset_TransactionList").find("tbody:eq(0)");
            tbody.find("tr :visible").remove();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open().then(() => {
                this.loadTransactionList();
            });
        }

        private loadTransactionList = (): PromiseLike<any> => {
            let _transaction = this.db.transaction("Transaction", "readonly");
            let arrayTransaction = new Array<any>();
            let execute: () => PromiseLike<void>;
            _transaction.store("Transaction").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayTransaction.push(cursor.value);
                    cursor.continue();
                }
            };
            return _transaction.commit().then(() => {
                if (arrayTransaction.length <= 0) {
                    $("#Tab_Asset_TransactionList > h5").show();
                    return;
                }
                else {
                    $("#Tab_Asset_TransactionList > h5").hide();
                    let txArray = linq(arrayTransaction).orderByDescending(p => p.time).toArray();
                    console.log(txArray);
                    let result = Promise.resolve();
                    execute = function (): PromiseLike<void> {
                        for (let i = 0; i < txArray.length; i++) {
                            let tbody = $("#Tab_Asset_TransactionList").find("tbody:eq(0)");
                            let trTemp = tbody.find("tr:eq(0)");
                            let tr = trTemp.clone(true);
                            tr.removeAttr("style");

                            let tx = Core.Transaction.deserializeFrom(txArray[i].rawData.hexToBytes().buffer);
                            result = result.then(() => {
                                return tx.ensureHash();
                            }).then(() => {
                                return Global.Blockchain.getBlockCount();
                                }).then(currentHeight => {
                                    let txHeight: number = txArray[i].height;
                                    tr.find(".tx-time").text(new Date(parseInt(txArray[i].time) * 1000).toLocaleString());
                                    tr.find(".tx-id").text(tx.hash.toString());
                                    tr.find(".tx-confirm").text(currentHeight - txHeight);
                                    tr.find(".tx-type").text(Core.TransactionType[tx.type]);
                                    tbody.append(tr);
                                });
                        }
                        return result;
                    }
                }
            }).then(() => {
                execute();
            }).catch(e => {
                alert(e);
            });
        }

    }
}