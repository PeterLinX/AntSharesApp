namespace AntShares.UI.Wallet
{
    export class Backup extends TabBase
    {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#backup_web").click(this.OnWebBackupClick);
            $(this.target).find("#backup_app").click(this.OnAppBackupClick);
            $(this.target).find("#hasBackup").click(this.OnHasBackupClick);
        }

        protected onload(args: any[]): void
        {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(0);
            let back = $("#Tab_Wallet_Backup #back_div");
            if (Global.Wallet == null)
            {
                back.hide();
                return;
            }
            else
                back.show();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open();

            if (isMobileApp.App()) {
                //App
                $("#Tab_Wallet_Backup #div_web").hide();
                $("#callout_web").hide();
            } else {
                //Mobile Web
                if (isMobileWeb.iOS()) {
                    $("#Tab_Wallet_Backup #div_backup_info").show();
                    $("#Tab_Wallet_Backup #div_web").hide();
                }
                //PC Web
                $("#Tab_Wallet_Backup #div_app").hide();
                $("#callout_app").hide();
            }
            //$("#Tab_Wallet_Backup #div_web").show();
            $("#hasbackup_div").hide();
        }
        
        private OnWebBackupClick = () => {
            try {
                this.loadFile().then((array) => {
                    let strDb: string = JSON.stringify(array);
                    let db = [strDb];
                    let blob = new Blob(db, { "type": "application/octet-binary" });
                    if (navigator.msSaveBlob) {
                        try {
                            navigator.msSaveBlob(blob, "antshares_backup");
                        }
                        catch (e) {
                            alert("msSaveBlob failed: " + e.message + "\r\n" + e.stack);
                        }
                    }
                    else {
                        try {
                            let url = URL.createObjectURL(blob);
                            var a = $('#Tab_Wallet_Backup #blob');
                            a.attr('href', url);
                            a[0].click();
                        }
                        catch (e) {
                            alert("download failed: " + e.message + "\r\n" + e.stack);
                        }
                    }
                    noResume = true;
                    this.showHasBackup();
                }).catch(e => {
                    console.log(e)
                });
            }
            catch (e) {
                console.log(e);
            }

        }

        private OnAppBackupClick = () => {
            try {
                this.loadFile().then((array) => {
                    noResume = true;
                    let strDb: string = JSON.stringify(array);
                    let dataUrl = "data:text/json;base64," + window.btoa(strDb);
                    let db = [strDb];
                    let blob = new Blob(db, { "type": "text/json" });
                    let url = URL.createObjectURL(blob);
                    (<any>window).plugins.socialsharing.share('wallet file', 'Your wallet', dataUrl)
                    this.showHasBackup();
                }).catch(e => {
                    console.log(e)
                });

            }
            catch (e) {
                console.log(e);
            }
        }

        private showHasBackup()
        {
            let backup: string = getCookie("hasBackup");
            if (backup == "" || backup == "0") {
                setTimeout(() => { $("#hasbackup_div").show('fast'); }, 1000);
            }
        }

        private OnHasBackupClick = () => {
            let backup: string = getCookie("hasBackup");
            if (backup == "" || backup == "0") {
                setCookie("hasBackup", "1", 365);
                $("#hasbackup_div").hide();
                alert(Resources.global.showReceiveAddress);
            }
        }

        private loadFile = (): PromiseLike<any> =>
        {
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

            wallet.content = { name: Global.Wallet.dbPath };

            let _transaction = this.db.transaction(["Key", "Contract", "Coin", "Account", "Transaction"], "readonly");

            let arrayKey = new Array<any>();
            _transaction.store("Key").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    arrayKey.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayContract = new Array<any>();
            _transaction.store("Contract").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    arrayContract.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayCoin = new Array<any>();
            _transaction.store("Coin").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    arrayCoin.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayAccount = new Array<any>();
            _transaction.store("Account").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    arrayAccount.push(cursor.value);
                    cursor.continue();
                }
            };

            let arrayTransaction = new Array<any>();
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