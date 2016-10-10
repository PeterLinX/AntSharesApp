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
            let ul = $("#Tab_Asset_TransactionList").find("ul:eq(0)");
            ul.find("li :visible").remove();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbName);
            this.db.open().then(() => {
                this.loadTransactionList();
            });
        }

        private loadTransactionList = (): PromiseLike<any> => {
            let _transaction = this.db.transaction("Transaction", "readonly");
            let arrayTransaction = new Array<any>();
            _transaction.store("Transaction").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayTransaction.push(cursor.value);
                    cursor.continue();
                }
            };
            return _transaction.commit().then(() => {
                if (arrayTransaction.length <= 0) {
                    $("#Tab_Asset_TransactionList h5").show();
                    return;
                }
                else {
                    $("#Tab_Asset_TransactionList h5").hide();
                    arrayTransaction.forEach(result => {
                        let ul = $("#Tab_Asset_TransactionList").find("ul:eq(0)");
                        let liTemplet = ul.find("li:eq(0)");
                        let li = liTemplet.clone(true);
                        li.removeAttr("style");
                        li.find(".txlist").text(result.rawData);
                        ul.append(li);

                        let tx = Core.Transaction.deserializeFrom(result.rawData.hexToBytes().buffer);
                        return tx.ensureHash().then(result => {
                            console.log(tx);
                            //return tx;
                        });
                    });
                }


            });
        }




    }
}