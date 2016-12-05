namespace AntShares.UI.Wallet
{
    export class Restore extends TabBase
    {


        protected oncreate(): void
        {
            $(this.target).find("#files").change(this.RestoreAction);
        }

        protected onload(args: any[]): void
        {
            setTitle(0);
            if (args[0])
                $("#danger").show();
            if (isMobileApp.App()) {
                //App
                if (isMobileApp.iOS())
                {
                    $("#Tab_Wallet_Restore #form_restore").css('display', 'none'); 
                    $("#Tab_Wallet_Restore #form_ios_restore").show();
                    let ul = $("#Tab_Wallet_Restore").find("ul:eq(0)");
                    ul.find("li.add").remove();
                    this.iOSLoad();
                }
            } else {
                //Mobile Web
                if (isMobileWeb.Web() && isMobileWeb.iOS()) {
                    $("#Tab_Wallet_Restore #div_restore_info").show();
                    $("#Tab_Wallet_Restore #form_restore").css('display', 'none');
                }
                //PC Web
            }
        }

        private iOSLoad = () => {
            window.requestFileSystem(window.PERSISTENT, 0, fs => {
                let directoryReader = fs.root.createReader();
                directoryReader.readEntries((entries) => {
                    let cntFiles: number = 0;
                    for (let i = 0; i < entries.length; i++) {
                        let row = entries[i];
                        if (row.isFile) {
                            let ul = $("#Tab_Wallet_Restore").find("ul:eq(0)");
                            let liTemp = ul.find("li:eq(0)");
                            let li = liTemp.clone(true);
                            li.removeAttr("style");
                            li.click(() => {
                                $("#restore_name_selected").val(row.name);
                                $("#Tab_Wallet_Restore li").removeClass("info");
                                $("#Tab_Wallet_Restore .restore-action").hide();
                                li.addClass("info");
                                li.find(".restore-action").show();
                            });
                            li.find(".btn-restore").click(this.OnRestoreClick);
                            li.addClass("add");
                            li.find(".restore-name").text(row.name);
                            ul.append(li);
                            cntFiles++;
                        }
                    }
                    if (cntFiles == 0) {
                        $("#Tab_Wallet_Restore #restore_info").show();
                    } else {
                        $("#Tab_Wallet_Restore #restore_info").hide();
                    }
                }, fileError => {
                    alert(cordovaFileError(fileError.code));
                });
            }, fileError => {
                alert(cordovaFileError(fileError.code));
            });
        }

        private readFile(fileEntry)
        {
            fileEntry.file((file) => {
                let reader = new FileReader();
                reader.onloadend = function () {
                    Restore.Restore(JSON.parse(this.result));
                };
                reader.readAsText(file);
            }, (fileError) => {
                alert(fileError.code);
            });
        }

        private OnRestoreClick = () => {
            let name = $("#Tab_Wallet_Restore #restore_name_selected").val();
            window.resolveLocalFileSystemURI('cdvfile://localhost/persistent/' + name, fileEntry => {
                this.readFile(fileEntry);
            }, fileError => {
                alert(cordovaFileError(fileError.code));
            });
        }

        private RestoreAction = () =>
        {
            let selectedFile = document.getElementById('files') as any;
            let file = selectedFile.files[0];
            let name = file.name;
            let size = file.size;
            console.log("文件名:" + name);
            console.log("文件大小:" + size);

            let reader = new FileReader();
            reader.readAsText(file);
            let json;
            reader.onload = function () {
                console.log(this.result);
                console.log(JSON.parse(this.result));
                Restore.Restore(JSON.parse(this.result));
            };
        }

        private static Restore = (pJson: JSON) => {
            let master: Wallets.Master;
            let db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;
            let _transaction: AntShares.Implementations.Wallets.IndexedDB.DbTransaction;

            let Wallet: JSON;
            let Key: JSON;
            let Contract: JSON;
            let Coin: JSON;
            let Account: JSON;
            let Transaction: JSON;

            Promise.resolve(1).then(() => {
                return pJson;
            }).then((json) => {
                let count = 0;
                for (let obj in json) {
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
                            throw new Error(Resources.global.walletJsonError);
                    }
                    count++;
                }
            }, onreject => {
                    throw new Error(Resources.global.walletJsonError);
                }).then(() => {
                    return Wallets.Master.instance();
                }).then(result => {
                    master = result;
                    return master.get();
                }).then(result => {
                    if (result.indexOf(Wallet["name"]) >= 0)
                        throw new Error(Resources.global.sameWalletName1);
                    master.add(Wallet["name"]);
                    db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Wallet["name"]);
                    return db.open();
                }).then(() => {
                    _transaction = db.transaction(["Key", "Contract", "Coin", "Account", "Transaction"], "readwrite");
                    let count = 0;
                    for (let key in Key) {
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
                    formReset("form_restore");
                    $("footer").show();
                    $("#menu_wallet_start").hide();
                    TabBase.showTab("#Tab_Wallet_Open");
                }, reason => {
                    formReset("form_restore");
                    alert(reason)
                });
        }
    }
}