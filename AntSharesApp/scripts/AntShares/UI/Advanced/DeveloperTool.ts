namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
            $(this.target).find("#set_height").click(this.OnSetHeightClick);
        }

        protected onload(args: any[]): void
        {
            this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
            this.db.open();
        }

        //删除所有钱包，测试用
        private OnDeleteButtonClick = () =>
        {
            let master: Wallets.Master;
            Wallets.Master.instance().then(result =>
            {
                master = result;
                if (Global.Wallet != null)
                {
                    return Global.Wallet.close();
                }
            }).then(() =>
            {
                Global.Wallet = null;
                return master.get();
            }).then(result =>
            {
                let promises = new Array<PromiseLike<void>>();
                for (let i = 0; i < result.length; i++)
                {
                    promises.push(Implementations.Wallets.IndexedDB.IndexedDBWallet.delete(result[i]));
                }
                return Promise.all(promises);
            }).then(() =>
            {
                master.close();
                return Implementations.Wallets.IndexedDB.DbContext.delete("master");
            }).then(() =>
            {
                alert("已经删除所有钱包文件！");
                setTimeout(() => { location.reload() }, 1000);
            })
        }

        private OnSetHeightClick = () =>
        {
            let height: number = $("#Tab_Advanced_DeveloperTool #height").val();
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
            }).then(() =>{
                TabBase.showTab("#Tab_Account_Index");
                alert("高度设定完成");
                }).catch(e => {
                    alert(e);
                });
            
            
        }
    }
}