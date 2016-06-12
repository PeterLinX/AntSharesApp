namespace AntShares.UI
{
    import CoinItem = AntShares.Wallets.CoinItem;
    import CoinStore = AntShares.Wallets.CoinStore;

    export class Sync
    {
        static started = false;
        static resetHeight = false;
        static stop = true;
        public getblockcount = () =>
        {
            let rpc = new RpcClient("http://seed1.antshares.org:20332/");

            rpc.call("getblockcount", [],
                (count) =>
                {
                    let height = count - 1;
                    $("#remote_height").text(height);
                    setTimeout(this.getblockcount, 5000);
                },
                (error) =>
                {
                    setTimeout(this.getblockcount, 5000);
                }
            );
        }

        /**
         * 在线更新钱包中的未花费的币
         * 打开钱包后调用
         */
        public startSyncWallet = () =>
        {
            let a = 11;
            if (!Sync.started)
            {
                Sync.started = true;
                this.syncWallet();
                $('#testbutton1').show();
                //测试用，重新设置钱包本地同步的高度
                $('#testbutton1').click(() => { Sync.resetHeight = true; });
            }
        }
        public stopSyncWallet = () =>
        {
            if (Sync.started)
            {
                $('#testbutton1').hide();
                $("#local_height").text(0);
                Sync.started = false;
            }
        }

        private syncWallet = () =>
        {
            let wallet = GlobalWallet.getCurrentWallet();
            if (Sync.resetHeight)
            {
                wallet.setHeight(113415, () =>  //108678  113415   113480
                {
                    //wallet.ClearObjectStore(StoreName.Coin);
                    //wallet.coins = new Array<CoinItem>();
                    wallet.database.getDataByKey(StoreName.Key, "Height",
                        (height: Wallets.KeyStore) =>
                        {
                            console.log("已从高度" + height.Value + "重建钱包");
                            $("#local_height").text(height.Value);
                            Sync.resetHeight = false;
                        });
                });
            }
            if (!Sync.started)
            {
                console.log("钱包同步已停止");
                return;
            }
            wallet.database.getDataByKey(StoreName.Key, "Height",
                (height: Wallets.KeyStore) =>
                {
                    $("#local_height").text(height.Value);
                    let remote_height = $("#remote_height").text();
                    let rpc = new RpcClient("http://seed1.antshares.org:20332/");
                    //根据指定的高度（索引），返回对应区块的散列值
                    rpc.call("getblockhash", [height.Value],
                        (hash) =>
                        {
                            //根据指定的散列值，返回对应的区块信息
                            rpc.call("getblock", [hash],
                                (block: Core.BlockJson) =>
                                {
                                    if (block.tx.length <= 1)
                                    {
                                        if (height.Value as any < $("#remote_height").text())
                                        {
                                            wallet.setHeight(++height.Value, this.syncWallet);
                                        }
                                        else
                                        {
                                            setTimeout(this.syncWallet, 5000);
                                        }
                                    }
                                    else
                                    {
                                        this.processNewBlock(block, () =>
                                        {
                                            if (height.Value as any < $("#remote_height").text())
                                            {
                                                wallet.setHeight(++height.Value, this.syncWallet);
                                            }
                                            else
                                            {
                                                setTimeout(this.syncWallet, 5000);
                                            }
                                        });
                                    }
                                },
                                (err) =>
                                {
                                    Sync.started = false;
                                    console.log(err.message);
                                }
                            );
                        },
                        (err) =>
                        {
                            Sync.started = false;
                            console.log(err.message);
                            setTimeout(this.syncWallet, 5000);
                        }
                    );
                });
        }

        /**
         * 参考项目中的 Wallet.cs 中的 ProcessNewBlock()
         */
        private processNewBlock = (blockjson: Core.BlockJson, callback) =>
        {
            let block = blockjson.deserialize();
            let wallet = GlobalWallet.getCurrentWallet();
            for (let tx of block.transactions) //547
            {
                for (let index = 0; index < tx.transactionOutput.length; index++) //549
                {
                    let out = tx.transactionOutput[index];
                    let input = new Core.TransactionInput(tx.transactionId, index);
                    let contains = false;
                    for (let c of wallet.contracts) //552
                    {
                        if (c.Address == out.address)
                        {
                            contains = true;
                            break;
                        }
                    }
                    if (contains)
                    {
                        let c = CoinsIndexof(wallet.coins, input);
                        if (c > 0)
                        {
                            //将更新后的Coin的State写入数据库
                            wallet.database.updateDataByKey(StoreName.Coin, wallet.coins[c].toKey(),
                                new CoinStore(wallet.coins[c].Input, wallet.coins[c].AssetId, wallet.coins[c].Value, wallet.coins[c].Address, Core.CoinState.Unspent));
                            wallet.coins[c].State = Core.CoinState.Unspent;
                        }
                        else
                        {
                            wallet.coins.push(new CoinItem(input, out.address, Core.CoinState.Unspent, out.assetId, out.value));
                            wallet.addCoin(new CoinStore(input, out.assetId, out.value, out.address, Core.CoinState.Unspent));
                        }
                    }
                }
            }
            let allInputs = new Array<Core.TransactionInput>(); //573
            for (let i = 0; i < block.transactions.length; i++)
            {
                allInputs = allInputs.concat(block.transactions[i].transactionInput);
            }
            for (let input of allInputs)
            {
                let i = CoinsIndexof(wallet.coins, input);
                if (i >= 0) //575
                {
                    if (Equals(wallet.coins[i].AssetId, Core.AntShare.AssetId))
                    {
                        //将更新后的Coin的State写入数据库
                        wallet.database.updateDataByKey(StoreName.Coin, wallet.coins[i].toKey(),
                            new CoinStore(wallet.coins[i].Input, wallet.coins[i].AssetId, wallet.coins[i].Value, wallet.coins[i].Address, Core.CoinState.Spent));
                        wallet.coins[i].State = Core.CoinState.Spent;
                    }
                    else
                    {
                        wallet.coins.splice(i);
                        wallet.database.deleteDataByKey(StoreName.Coin, wallet.coins[i].toKey());
                    }
                }
            }
            let claims = new Array<Core.TransactionInput>(); //583
            for (let i = 0; i < block.transactions.length; i++)
            {
                if (block.transactions[i].transactionType == Core.TransactionType.ClaimTransaction)
                    claims = claims.concat(block.transactions[i].transactionInput);
            }
            for (let claim of claims)
            {
                let i = CoinsIndexof(wallet.coins, claim);
                if (i > 0) //585
                {
                    wallet.coins.splice(i);
                    wallet.database.deleteDataByKey(StoreName.Coin, wallet.coins[i].toKey());
                }
            }

            callback();
        }
    }
}