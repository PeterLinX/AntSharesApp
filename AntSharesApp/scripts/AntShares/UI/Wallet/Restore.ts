namespace AntShares.UI.Wallet
{
    export class Restore extends TabBase
    {
        protected oncreate(): void
        {
            //$(this.target).find("#files").change(this.RestoreAction);
            $(this.target).find("#files").on('change', this.RestoreAction);
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
                    $("#Tab_Wallet_Restore #form_restore").hide(); 
                    $("#Tab_Wallet_Restore #form_ios_restore").show();
                    let ul = $("#Tab_Wallet_Restore").find("ul:eq(0)");
                    ul.find("li.add").remove();
                    this.iOSLoad();
                }
            } else {
                //Mobile Web
                if (isMobileWeb.iOS()) {
                    $("#Tab_Wallet_Restore #div_restore_info").show();
                    $("#Tab_Wallet_Restore #form_restore").hide(); 
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

        private readFile(fileEntry: any)
        {
            fileEntry.file((file) => {
                let reader = new FileReader();
                reader.onloadend = function () {
                    Restore.Restore(JSON.parse(this.result)).then(() => {
                        $("footer").show();
                        $(".menu-progress").show();
                        $("#menu_wallet_start").hide();
                        TabBase.showTab("#Tab_Wallet_Open");
                    }, reason => {
                        alert(reason);
                    });
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
            noResume = true;
            let selectedFile = document.getElementById('files') as any;
            let file = selectedFile.files[0];
            let name = file.name;
            let size = file.size;
            //debugLog("文件名:" + name);
            //debugLog("文件大小:" + size);

            let reader = new FileReader();
            reader.readAsText(file);
            let json;
            reader.onload = function () {
                Restore.Restore(JSON.parse(this.result)).then(() => {
                    formReset("form_restore");
                    $("#menu_wallet_start").hide();
                    let backup: string = getCookie("hasBackup");
                    if (backup == "" || backup == "0") {
                        setCookie("hasBackup", "1", 365);
                    }
                    TabBase.showTab("#Tab_Wallet_Open");
                }, reason => {
                    formReset("form_restore");
                    alert(reason);
                });
            };
        }

        private static Restore = (pJsonArray: Array<JSON>): PromiseLike<void> => {
            let master: Wallets.Master;
            let db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;
            let _transaction: AntShares.Implementations.Wallets.IndexedDB.DbTransaction;

            let Wallet: Array<JSON>;
            let Key: Array<JSON>;
            let Contract: Array<JSON>;
            let Coin: Array<JSON>;
            let Account: Array<JSON>;
            let Transaction: Array<JSON>;

            return Promise.resolve(1).then(() => {
                return pJsonArray;
            }).then((array) => {
                for (let i = 0; i < array.length; i++)
                {
                    switch (array[i]["table"]) {
                        case "Wallet": Wallet = array[i]["content"];
                            break;
                        case "Key": Key = array[i]["content"];
                            break;
                        case "Contract": Contract = array[i]["content"];
                            break;
                        case "Coin": Coin = array[i]["content"];
                            break;
                        case "Account": Account = array[i]["content"];
                            break;
                        case "Transaction": Transaction = array[i]["content"];
                            break;
                        default:
                            throw new Error(Resources.global.walletJsonError);
                    }
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
                }).then(() =>
                {
                    _transaction = db.transaction(["Key", "Contract", "Coin", "Account", "Transaction"], "readwrite");
                    for (let i = 0; i < Key.length; i++)
                    {
                        _transaction.store("Key").put({
                            name: Key[i]["name"],
                            value: Key[i]["value"]
                        });
                    }
                    for (let i = 0; i < Contract.length; i++)
                    {
                        _transaction.store("Contract").put({
                            parameterList: Contract[i]["parameterList"],
                            publicKeyHash: Contract[i]["publicKeyHash"],
                            redeemScript: Contract[i]["redeemScript"],
                            scriptHash: Contract[i]["scriptHash"]
                        });
                    }
                    for (let i = 0; i < Coin.length; i++)
                    {
                        _transaction.store("Coin").put({
                            assetId: Coin[i]["assetId"],
                            index: Coin[i]["index"],
                            scriptHash: Coin[i]["scriptHash"],
                            state: Coin[i]["state"],
                            txid: Coin[i]["txid"],
                            "txid,index": Coin[i]["txid,index"],
                            value: Coin[i]["value"]
                        });
                    }
                    for (let i = 0; i < Account.length; i++)
                    {
                        _transaction.store("Account").put({
                            privateKeyEncrypted: Account[i]["privateKeyEncrypted"],
                            publicKeyHash: Account[i]["publicKeyHash"]
                        });
                    }
                    for (let i = 0; i < Transaction.length; i++)
                    {
                        _transaction.store("Transaction").put({
                            hash: Transaction[i]["hash"],
                            height: Transaction[i]["height"],
                            rawData: Transaction[i]["rawData"],
                            time: Transaction[i]["time"],
                            type: Transaction[i]["type"]
                        });
                    }
                    return _transaction.commit();
                });
        }
    }
}