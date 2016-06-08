namespace AntShares.UI.Wallet
{
    export class Create extends TabBase
    {
        private account: Wallets.Account;
        private CurrentHeight: number;

        protected oncreate(): void
        {
            $(this.target).find("#create_wallet").click(this.OnCreateButtonClick);
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
        }

        protected onload(): void
        {
            let rpc = new AntShares.Network.RPC.RpcClient("http://seed1.antshares.org:20332/");
            rpc.call("getblockcount", [], (height) => { this.CurrentHeight = height - 1; })
            $("#wallet_name").focus();
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_wallet"))
            {
                let master = Wallets.Master.GetInstance();
                master.OpenDB(() =>
                {
                    master.GetWalletNameList(this.createWallet);
                });
            }
        }

        //删除当前所有钱包，测试用
        private OnDeleteButtonClick = () =>
        {
            console.clear();
            let sync = new AntShares.UI.Sync();
            sync.stopSyncWallet();
            let master = Wallets.Master.GetInstance();
            master.OpenDB(() =>
            {
                master.GetWalletNameList(
                    (walletNameList: Array<string>) =>
                    {
                        if (walletNameList.length == 0)
                        {
                            alert("当前没有钱包数据库");
                        }
                        else
                        {
                            let wallet = GlobalWallet.getCurrentWallet();
                            if (wallet.database)
                                wallet.database.closeDB();
                            for (let i = 0; i < walletNameList.length; i++)
                            {
                                this.deleteWallet(walletNameList[i]);
                                master.DeleteWalletName(walletNameList[i]);

                                alert("delete current wallet success.");
                            }
                        }
                    })
            });
        }

        private deleteWallet(waletName: string)
        {
            let wallet = new Wallets.Wallet();
            wallet.openDB(waletName, () =>
            {
                wallet.database.clearObjectStore(StoreName.Key);
                wallet.database.clearObjectStore(StoreName.Contract);
                wallet.database.clearObjectStore(StoreName.Account);
                wallet.database.clearObjectStore(StoreName.Coin);
                wallet.database.deleteIndexdDB();
                wallet.database.closeDB();
            });
        }

        private createWallet = (walletNameList: Array<string>) =>
        {
            if (walletNameList.indexOf($("#wallet_name").val().trim()) >= 0)
            {
                alert("已经存在重名的钱包文件，你可以打开钱包或者创建新的钱包。");
            }
            else
            {
                let wallet = GlobalWallet.getCurrentWallet();
                let walletName = $("#wallet_name").val().trim();
                Wallets.Master.GetInstance().AddWalletName(new Wallets.WalletStore(walletName));
                wallet.openDB(walletName, () =>
                {
                    ToPasswordKey($("#create_password").val().toUint8Array(), (passwordKey) =>
                        {
                            Wallets.Key.PasswordKey = passwordKey;
                            wallet.createWallet(passwordKey, () =>
                            {
                                wallet.createECDSAKey("我的账户", new Wallets.Account(), (pAccount) =>
                                {
                                    wallet.createContract(pAccount.PublicKeyHash, pAccount.publicECPoint, (pWallet) =>
                                    {
                                        wallet.addKey(new Wallets.KeyStore("Height", this.CurrentHeight));
                                        pWallet.loadSomething(() =>
                                        {
                                            alert("打开钱包成功");
                                            this.clear();
                                            //打开成功后跳转账户管理页面
                                            TabBase.showTab("#Tab_Account_Index");
                                            let sync = new AntShares.UI.Sync();
                                            sync.startSyncWallet();
                                        });
                                    });
                                });//createECDSAKey
                            });
                        });//ToPasswordKey
                });//openDB
            }
        }

        private clear()
        {
            $("#wallet_name").val("");
            $("#create_password").val("");
            $("#create_password_confirm").val("");
        }
    }
}
