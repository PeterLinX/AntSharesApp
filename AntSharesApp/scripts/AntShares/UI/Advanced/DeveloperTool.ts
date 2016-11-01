namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
            $(this.target).find("#set_height").click(this.OnSetHeightButtonClick);

        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open();
            formReset("form_dev_tool");
        }

        //删除所有钱包，测试用
        private OnDeleteButtonClick = () => {
            let master: Wallets.Master;
            Wallets.Master.instance().then(result => {
                console.log("删除中...");
                master = result;
                if (Global.Wallet != null) {
                    return Global.Wallet.close();
                }
            }).then(() => {
                Global.Wallet = null;
                return master.get();
                }).then(result => {
                    let promises = new Array<PromiseLike<void>>();
                    for (let i = 0; i < result.length; i++) {
                        setTimeout(() => { promises.push(Implementations.Wallets.IndexedDB.IndexedDBWallet.delete(result[i])); }, 1500);
                    }
                    return Promise.all(promises);
                }).then(() => {
                    master.close();
                    return Implementations.Wallets.IndexedDB.DbContext.delete("master");
                }).then(() => {
                    console.log("删除中，进度：100%");
                    alert("已经删除所有钱包文件！");
                    setTimeout(() => { location.reload(); }, 1000);
                }).catch(reason => {
                    alert(reason);
                });
        }

        private OnSetHeightButtonClick = () => {
            let height: number = $("#Tab_Advanced_DeveloperTool #input_curent_height").val();
            console.log(height);
            Global.Blockchain.getBlockCount().then(result => {
                let currentHeight: number = result - 1;
                console.log(currentHeight);
                let value = new Uint32Array([height]).buffer;
                if (height < 0 || height > currentHeight) {
                    alert("输入值有误！");
                } else {
                    let _transaction = this.db.transaction("Key", "readwrite");
                    _transaction.store("Key").put({
                        name: "Height",
                        value: new Uint8Array(value).toHexString()
                    });
                    return _transaction.commit();
                }
            }).then(() => {
                location.reload()
                TabBase.showTab("#Tab_Account_Index");
            }).catch(e => {
                alert(e);
            });


        }
    }
}