namespace AntShares.UI.Config {
    export class Backup extends TabBase {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
            $(this.target).find("#backup").click(this.OnBackupClick);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbName);
            this.db.open();
        }

        private OnBackupClick = () => {
            this.loadFile().then((array) => {
                let strDb: string = JSON.stringify(array);
                let db = [strDb];

                let blob = new Blob(db, { "type": "application/octet-binary" });
                let url = URL.createObjectURL(blob);
                console.log(url);
                $('#Tab_Config_Backup #blob').attr('href', url);

            });
            
        }

        private loadFile = (): PromiseLike<any> => {
            let wallet =
                {
                    table: "Wallet",
                    content: {},
                };
            let key =
                {
                    table: "Key",
                    content: []
                };
            let contract =
                {
                    table: "Contract",
                    content: []
                };
            let coin =
                {
                    table: "Coin",
                    content: []
                };
            let account =
                {
                    table: "Account",
                    content: []
                };
            let transaction =
                {
                    table: "Transaction",
                    content: []
                };

            wallet.content = { name: Global.Wallet.dbName };

            let _transaction = this.db.transaction(["Key", "Contract", "Coin", "Account","Transaction"], "readonly");

            let arrayKey = new Array<any>();
            _transaction.store("Key").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayKey.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayContract = new Array<any>();
            _transaction.store("Contract").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayContract.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayCoin = new Array<any>();
            _transaction.store("Coin").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayCoin.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayAccount = new Array<any>();
            _transaction.store("Account").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayAccount.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayTransaction = new Array<any>();
            _transaction.store("Transaction").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    arrayTransaction.push(cursor.value);
                    cursor.continue();
                }
            };
            
            return _transaction.commit().then(() => {

                key.content = arrayKey;
                contract.content = arrayContract;
                coin.content = arrayCoin;
                account.content = arrayAccount;
                transaction.content = arrayTransaction;

                let arrayAll: Array<any> = new Array();
                arrayAll.push(wallet);
                arrayAll.push(key);
                arrayAll.push(contract);
                arrayAll.push(coin);
                arrayAll.push(account);
                arrayAll.push(transaction);
                return arrayAll;
            });
        }

        
    }

    

}