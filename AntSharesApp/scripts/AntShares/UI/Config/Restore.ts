namespace AntShares.UI.Config {
    export class Restore extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#import").click(this.OnRestoreClick);
            $(this.target).find("#files").change(this.Restore);
        }

        protected onload(args: any[]): void {
            
        }

        private OnRestoreClick = () => {
            $("#files").click();
        }

        private loadDb = (json: JSON): PromiseLike<void> => {
            console.log(json);

            return Promise.resolve(null);
        }

        private Restore = () => {
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
            let objDb: PromiseLike<JSON>;
            reader.onload = function () {
                console.log(this.result);
                objDb = Promise.resolve(JSON.parse(this.result));
                objDb.then((json) => {
                    let count = 0;
                    for (let obj in json)
                    {
                        switch (json[count]["table"]) {
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
                                throw new Error("钱包格式有误！");
                        }
                        count++;
                    }
                }).then(() => {
                    return Wallets.Master.instance();

                    }).then(result => {
                        master = result;
                        return master.get();
                    }).then(result => {
                        if (result.indexOf(Wallet["name"]) >= 0)
                            throw new Error("已经存在重名的钱包文件！");
                        master.add(Wallet["name"]);
                        db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Wallet["name"]);
                        return db.open();
                    }).then(() => {
                        _transaction = db.transaction(["Key", "Contract", "Coin", "Account", "Transaction"], "readwrite");
                        let count = 0;
                        for (let key in Key) {
                            console.log(Key[count]);
                            _transaction.store("Key").put({
                                name: Key[count]["name"],
                                value: Key[count]["value"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let contract in Contract) {
                            _transaction.store("Contract").put({
                                parameterList: Contract[count]["parameterList"],
                                publicKeyHash: Contract[count]["publicKeyHash"],
                                redeemScript: Contract[count]["redeemScript"],
                                scriptHash: Contract[count]["scriptHash"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let coin in Coin) {
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
                        for (let account in Account) {
                            _transaction.store("Account").put({
                                privateKeyEncrypted: Account[count]["privateKeyEncrypted"],
                                publicKeyHash: Account[count]["publicKeyHash"]
                            });
                            count++;
                        }
                        count = 0;
                        for (let tx in Transaction) {
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
                    }).then(() => {
                        TabBase.showTab("#Tab_Account_Index");
                    }, reason => alert(reason));
            };
        }
        
    }

}