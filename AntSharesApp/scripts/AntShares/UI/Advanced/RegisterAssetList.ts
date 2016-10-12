namespace AntShares.UI.Advanced {
    export class RegisterAssetList extends TabBase {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            let ul = $("#Tab_Advanced_RegisterAssetList").find("ul:eq(0)");
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbName);
            this.db.open().then(() => {
                this.loadRegisterAssetList();
            });

        }


        private loadRegisterAssetList = (): PromiseLike<any> => {
            let _transaction = this.db.transaction("Transaction", "readonly");
            let arrayRegisterAsset = new Array<any>();
            _transaction.store("Transaction").index("type").openCursor(IDBKeyRange.only(Core.TransactionType.RegisterTransaction)).onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayRegisterAsset.push(cursor.value);
                    cursor.continue();
                }
            };
            return _transaction.commit().then(() => {
                if (arrayRegisterAsset.length <= 0) {
                    $("#Tab_Advanced_RegisterAssetList .no_asset").show();
                    return;
                }
                else
                {
                    $("#Tab_Advanced_RegisterAssetList .no_asset").hide();
                    arrayRegisterAsset.forEach(result => {
                        let tbody = $("#Tab_Advanced_RegisterAssetList").find("tbody");
                        let trTemplet = tbody.find("tr:eq(0)");
                        let tr = trTemplet.clone(true);
                        tr.removeAttr("style");
                        
                        let tx = Core.Transaction.deserializeFrom(result.rawData.hexToBytes().buffer);
                        return tx.ensureHash().then(result =>
                        {
                            var asset = tx as Core.RegisterTransaction;
                            tr.find(".asset_name").text(asset.getName());
                            tr.find(".asset_amount").text(asset.amount.toString());
                            tr.find(".asset_issuer").text(asset.issuer.toString());
                            tbody.append(tr);
                        });


                    });
                }

            });
        }
    }
}