namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
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
                    return Global.Wallet.close();
            }).then(() =>
            {
                Global.Wallet = null;
                try
                {
                    return master.get();
                }
                catch (e)
                {
                    alert("没有要删除的钱包文件（已经删光了）");
                }
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
            })
        }

    }
}