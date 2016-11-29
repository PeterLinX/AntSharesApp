namespace AntShares.UI.Wallet
{
    export class Restore extends TabBase
    {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#files").change(this.Restore);
        }

        protected onload(args: any[]): void
        {
            setTitle(0);
            if (args[0])
                $("#danger").show();
            formReset("form_backup");
            var back = $("#Tab_Wallet_Backup #back_div");
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
                        formReset("form_backup");
                        $("footer").show();
                        $(".menu-progress").show();
                        $("#menu_wallet_start").hide();
                        TabBase.showTab("#Tab_Wallet_Open");
                    }, reason =>
                    {
                        formReset("form_backup");
                        alert(reason)
                    });
            };
        }

    }
}