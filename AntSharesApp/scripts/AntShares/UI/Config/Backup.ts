namespace AntShares.UI.Config
{
    export class Backup extends TabBase
    {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#backup").click(this.OnBackupClick);
            $(this.target).find("#import").click(this.OnRestoreClick);
            $(this.target).find("#files").change(this.Restore);
        }

        protected onload(args: any[]): void
        {
            $("#backup_reset").trigger("click");
            var back = $("#Tab_Config_Backup #back_div");
            if (Global.Wallet == null)
            {
                back.hide();
                return;
            }
            else
                back.show();
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open();
        }

        private OnBackupClick = () =>
        {
            try
            {
                this.loadFile().then((array) =>
                {
                    let strDb: string = JSON.stringify(array);
                    let db = [strDb];
                    let blob = new Blob(db, { "type": "application/octet-binary" });
                    let url = URL.createObjectURL(blob);
                    $('#Tab_Config_Backup #blob').attr('href', url);
                    let ev = document.createEvent('MouseEvents');
                    ev.initEvent('click', false, true);
                    document.getElementById('blob').dispatchEvent(ev);
                }).catch(e =>
                {
                    console.log(e)
                });
            }
            catch (e)
            {
                console.log(e);
                //alert(e);
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

        private OnRestoreClick = () =>
        {
            $("#files").click();
        }

        private Restore = () =>
        {
            let master: Wallets.Master;
            let db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;
            let _transaction: AntShares.Implementations.Wallets.IndexedDB.DbTransaction;

            let Wallet: JSON;
            let Key: JSON;
            let Contract: JSON;
            let Coin: JSON;
            let Account: JSON;
            let Transaction: JSON;

            let selectedFile = document.getElementById('files') as any;
            let file = selectedFile.files[0];
            let name = file.name;
            let size = file.size;
            console.log("文件名:" + name);
            console.log("文件大小:" + size);

            let reader = new FileReader();
            reader.readAsText(file);
            let json;
            reader.onload = function ()
            {
                Promise.resolve(1).then(() =>
                {
                    return JSON.parse(this.result);
                }).then((json) =>
                {
                    let count = 0;
                    for (let obj in json)
                    {
                        switch (json[count]["table"])
                        {
                            case "Wallet": Wallet = json[count]["content"];
                                break;
                            case "Key": Key = json[count]["content"];
                                break;
                            case "Contract": Contract = json[count]["content"];
                                break;
                            case "Coin": Coin = json[count]["content"];
                                break;
                            case "Account": Account = json[count]["content"];
                                break;
                            case "Transaction": Transaction = json[count]["content"];
                                break;
                            default:
                                throw new Error(Resources.global.walletJsonError);
                        }
                        count++;
                    }
                }, onreject =>
                    {
                        throw new Error(Resources.global.walletJsonError);
                    }).then(() =>
                    {
                        return Wallets.Master.instance();
                    }).then(result =>
                    {
                        master = result;
                        return master.get();
                    }).then(result =>
                    {
                        if (result.indexOf(Wallet["name"]) >= 0)
                            throw new Error(Resources.global.sameWalletName1);
                        master.add(Wallet["name"]);
                        db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Wallet["name"]);
                        return db.open();
                    }).then(() =>
                    {
                        _transaction = db.transaction(["Key", "Contract", "Coin", "Account", "Transaction"], "readwrite");
                        let count = 0;
                        for (let key in Key)
                        {
                            _transaction.store("Key").put({
                                name: Key[count]["name"],
                                value: Key[count]["value"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let contract in Contract)
                        {
                            _transaction.store("Contract").put({
                                parameterList: Contract[count]["parameterList"],
                                publicKeyHash: Contract[count]["publicKeyHash"],
                                redeemScript: Contract[count]["redeemScript"],
                                scriptHash: Contract[count]["scriptHash"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let coin in Coin)
                        {
                            _transaction.store("Coin").put({
                                assetId: Coin[count]["assetId"],
                                index: Coin[count]["index"],
                                scriptHash: Coin[count]["scriptHash"],
                                state: Coin[count]["state"],
                                txid: Coin[count]["txid"],
                                "txid,index": Coin[count]["txid,index"],
                                value: Coin[count]["value"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let account in Account)
                        {
                            _transaction.store("Account").put({
                                privateKeyEncrypted: Account[count]["privateKeyEncrypted"],
                                publicKeyHash: Account[count]["publicKeyHash"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let tx in Transaction)
                        {
                            _transaction.store("Transaction").put({
                                hash: Transaction[count]["hash"],
                                height: Transaction[count]["height"],
                                rawData: Transaction[count]["rawData"],
                                time: Transaction[count]["time"],
                                type: Transaction[count]["type"]
                            });
                            count++;
                        }
                        return _transaction.commit();
                    }).then(() =>
                    {
                        $("#backup_reset").trigger("click");
                        TabBase.showTab("#Tab_Wallet_Open");
                    }, reason =>
                    {
                        $("#backup_reset").trigger("click");
                        alert(reason)
                    });
            };
        }

    }



}