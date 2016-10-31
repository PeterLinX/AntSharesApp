namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
            $(this.target).find("#set_height").click(this.OnSetHeightButtonClick);
            
        }

        protected onload(args: any[]): void
        {
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

        private OnSetHeightButtonClick = () =>
        {
            Global.Wallet.setHeight($("#input_curent_height").val());
        }
    }
}