namespace AntShares.Implementations.Wallets.IndexedDB
{
    export class IndexedDBWallet extends AntShares.Wallets.Wallet
    {
        private db: WalletDataContext;

        constructor(name: string)
        {
            super();
            this.db = new WalletDataContext(name);
        }

        public addContract(contract: AntShares.Wallets.Contract): PromiseLike<void>
        {
            return super.addContract(contract).then(() =>
            {
                return DbContext.promise(this.db.transaction("Contract", "readwrite").store("Contract").put({
                    redeemScript: new Uint8Array(contract.redeemScript).toHexString(),
                    parameterList: contract.parameterList,
                    publicKeyHash: contract.publicKeyHash.toString(),
                    scriptHash: contract.scriptHash.toString()
                }));
            });
        }

        public static create(name: string, password: string): PromiseLike<IndexedDBWallet>
        {
            let wallet = new IndexedDBWallet(name);
            return wallet.init(name, password, true).then(() =>
            {
                return wallet.createAccount();
            }).then(() =>
            {
                return wallet;
            });
        }

        public createAccount(privateKey?: ArrayBuffer | Uint8Array): PromiseLike<AntShares.Wallets.Account>
        {
            let account: AntShares.Wallets.Account;
            return super.createAccount(privateKey).then(result =>
            {
                account = result;
                return this.onCreateAccount(account);
            }).then(() =>
            {
                return AntShares.Wallets.Contract.createSignatureContract(account.publicKey);
            }).then(result =>
            {
                return this.addContract(result);
            }).then(() =>
            {
                return account;
            });
        }

        public static delete(name: string): PromiseLike<void>
        {
            return DbContext.delete(name);
        }

        public deleteAccount(publicKeyHash: Uint160): PromiseLike<boolean>
        {
            let transaction = this.db.transaction(["Account", "Contract", "Coin"], "readwrite");
            transaction.store("Contract").index("publicKeyHash").openCursor(IDBKeyRange.only(publicKeyHash.toString())).onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    transaction.store("Coin").index("scriptHash").openCursor(IDBKeyRange.only(cursor.value.scriptHash)).onsuccess = e =>
                    {
                        let cursor = <IDBCursor>(<IDBRequest>e.target).result;
                        if (cursor)
                        {
                            cursor.delete();
                            cursor.continue();
                        }
                    };
                    cursor.delete();
                    cursor.continue();
                }
            };
            transaction.store("Account").delete(publicKeyHash.toString());
            return transaction.commit().then(() =>
            {
                return super.deleteAccount(publicKeyHash);
            });
        }

        public deleteContract(scriptHash: Uint160): PromiseLike<boolean>
        {
            return super.deleteContract(scriptHash).then(result =>
            {
                if (!result) return false;
                let transaction = this.db.transaction(["Contract", "Coin"], "readwrite");
                transaction.store("Coin").index("scriptHash").openCursor(IDBKeyRange.only(scriptHash.toString())).onsuccess = e =>
                {
                    let cursor = <IDBCursor>(<IDBRequest>e.target).result;
                    if (cursor)
                    {
                        cursor.delete();
                        cursor.continue();
                    }
                };
                transaction.store("Contract").delete(scriptHash.toString());
                return transaction.commit().then(() => true);
            });
        }

        protected loadAccounts(): PromiseLike<AntShares.Wallets.Account[]>
        {
            let promises = new Array<PromiseLike<AntShares.Wallets.Account>>();
            let transaction = this.db.transaction("Account", "readonly");
            transaction.store("Account").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    promises.push(this.decryptPrivateKey(cursor.value.privateKeyEncrypted.hexToBytes()).then(result =>
                    {
                        return AntShares.Wallets.Account.create(result);
                    }));
                    cursor.continue();
                }
            };
            return transaction.commit().then(() =>
            {
                return Promise.all(promises);
            });
        }

        protected loadCoins(): PromiseLike<AntShares.Wallets.Coin[]>
        {
            let array = new Array<AntShares.Wallets.Coin>();
            let transaction = this.db.transaction("Coin", "readonly");
            transaction.store("Coin").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    let coin = new AntShares.Wallets.Coin();
                    coin.input = new Core.TransactionInput();
                    coin.input.prevHash = Uint256.parse(cursor.value.txid);
                    coin.input.prevIndex = cursor.value.index;
                    coin.assetId = Uint256.parse(cursor.value.assetId);
                    coin.value = Fixed8.parse(cursor.value.value);
                    coin.scriptHash = Uint160.parse(cursor.value.scriptHash);
                    coin.state = cursor.value.state;
                    array.push(coin);
                    cursor.continue();
                }
            };
            return transaction.commit().then(() =>
            {
                return array;
            });
        }

        protected loadContracts(): PromiseLike<AntShares.Wallets.Contract[]>
        {
            let array = new Array<AntShares.Wallets.Contract>();
            let transaction = this.db.transaction("Contract", "readonly");
            transaction.store("Contract").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    let contract = new AntShares.Wallets.Contract();
                    contract.redeemScript = cursor.value.redeemScript.hexToBytes().buffer;
                    contract.parameterList = cursor.value.parameterList;
                    contract.publicKeyHash = Uint160.parse(cursor.value.publicKeyHash);
                    contract.scriptHash = Uint160.parse(cursor.value.scriptHash);
                    array.push(contract);
                    cursor.continue();
                }
            };
            return transaction.commit().then(() =>
            {
                return array;
            });
        }

        protected loadStoredData(name: string): PromiseLike<ArrayBuffer>
        {
            return DbContext.promise<ArrayBuffer>(this.db.transaction("Key", "readonly").store("Key").get(name));
        }

        private onCoinsChanged(transaction: DbTransaction, added: AntShares.Wallets.Coin[], changed: AntShares.Wallets.Coin[], deleted: AntShares.Wallets.Coin[]): void
        {
            for (let i = 0; i < added.length; i++)
            {
                transaction.store("Coin").add({
                    txid: added[i].input.prevHash.toString(),
                    index: added[i].input.prevIndex,
                    assetId: added[i].assetId.toString(),
                    value: added[i].value.toString(),
                    scriptHash: added[i].scriptHash.toString(),
                    state: AntShares.Wallets.CoinState.Unspent
                });
            }
            for (let i = 0; i < changed.length; i++)
            {
                transaction.store("Coin").put({
                    txid: changed[i].input.prevHash.toString(),
                    index: changed[i].input.prevIndex,
                    assetId: changed[i].assetId.toString(),
                    value: changed[i].value.toString(),
                    scriptHash: changed[i].scriptHash.toString(),
                    state: changed[i].state
                });
            }
            for (let i = 0; i < deleted.length; i++)
            {
                transaction.store("Coin").delete([deleted[i].input.prevHash.toString(), deleted[i].input.prevIndex]);
            }
        }

        private onCreateAccount(account: AntShares.Wallets.Account): PromiseLike<void>
        {
            let decryptedPrivateKey = new Uint8Array(96);
            Array.copy(account.publicKey.encodePoint(false), 1, decryptedPrivateKey, 0, 64);
            Array.copy(new Uint8Array(account.privateKey), 0, decryptedPrivateKey, 64, 32);
            return this.encryptPrivateKey(decryptedPrivateKey).then(result =>
            {
                return DbContext.promise(this.db.transaction("Account", "readwrite").store("Account").put({
                    privateKeyEncrypted: result.toHexString(),
                    publicKeyHash: account.publicKeyHash.toString()
                }));
            });
        }

        protected onProcessNewBlock(block: Core.Block, transactions: Core.Transaction[], added: AntShares.Wallets.Coin[], changed: AntShares.Wallets.Coin[], deleted: AntShares.Wallets.Coin[]): PromiseLike<void>
        {
            let transaction = this.db.transaction(["Coin", "Key", "Transaction"], "readwrite");
            transaction.store("Transaction").index("height").openCursor(IDBKeyRange.only(null)).onsuccess = e =>
            {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    for (let i = 0; i < block.transactions.length; i++)
                        if (cursor.value.hash == block.transactions[i].hash.toString())
                        {
                            cursor.value.height = block.height;
                            cursor.update(cursor.value);
                            break;
                        }
                    cursor.continue();
                }
            };
            for (let i = 0; i < transactions.length; i++)
            {
                transaction.store("Transaction").put({
                    hash: transactions[i].hash.toString(),
                    type: transactions[i].type,
                    rawData: Uint8Array.fromSerializable(transactions[i]).toHexString(),
                    height: block.height,
                    time: block.timestamp
                });
            }
            this.onCoinsChanged(transaction, added, changed, deleted);
            IndexedDBWallet.saveStoredData(transaction, "Height", new Uint32Array([this.walletHeight]).buffer);
            return transaction.commit();
        }

        protected onSendTransaction(tx: Core.Transaction, added: AntShares.Wallets.Coin[], changed: AntShares.Wallets.Coin[]): PromiseLike<void>
        {
            let transaction = this.db.transaction(["Coin", "Transaction"], "readwrite");
            transaction.store("Transaction").add({
                hash: tx.hash.toString(),
                type: tx.type,
                rawData: Uint8Array.fromSerializable(tx).toHexString(),
                height: null,
                time: Date.now() / 1000
            });
            this.onCoinsChanged(transaction, added, changed, []);
            return transaction.commit();
        }

        public static open(name: string, password: string): PromiseLike<IndexedDBWallet>
        {
            let wallet = new IndexedDBWallet(name);
            return wallet.init(name, password, false).then(() =>
            {
                return wallet;
            });
        }

        public rebuild(): PromiseLike<void>
        {
            return super.rebuild().then(() =>
            {
                let transaction = this.db.transaction(["Coin", "Key", "Transaction"], "readwrite");
                IndexedDBWallet.saveStoredData(transaction, "Height", new ArrayBuffer(4));
                transaction.store("Transaction").clear();
                transaction.store("Coin").clear();
                return transaction.commit();
            });
        }

        protected saveStoredData(name: string, value: ArrayBuffer): PromiseLike<void>
        {
            let transaction = this.db.transaction("Key", "readwrite");
            IndexedDBWallet.saveStoredData(transaction, name, value);
            return transaction.commit();
        }

        private static saveStoredData(transaction: DbTransaction, name: string, value: ArrayBuffer): void
        {
            transaction.store("Key").put({
                name: name,
                value: new Uint8Array(value).toHexString()
            });
        }
    }
}
