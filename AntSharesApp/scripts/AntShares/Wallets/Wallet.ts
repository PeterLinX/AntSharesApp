/// <reference path="../Core/Transaction.ts"/>

namespace AntShares.Wallets
{
    export class Wallet
    {
        public accounts = new Array<AccountItem>();
        public contracts = new Array<Contract>();
        public coins = new Array<CoinItem>();
        public database: Database;
        public walletName: string;

        /**
         * 打开钱包数据库
         * @param callback 查询结果的回调函数。
         */
        public openDB = (walletName: string, callback) =>
        {
            if (!window.indexedDB)
            {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                //在config.xml中设置目标平台为Windows8.1时，在Windows10 mobile的手机中无法运行IndexedDB
                return;
            }
            try
            {
                let request = window.indexedDB.open(walletName);
                request.onsuccess = (e: any) =>
                {
                    this.walletName = walletName;
                    this.database = new Database(walletName, e.target.result);
                    callback();
                    return;
                };
                request.onerror = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                    return;
                };
                request.onupgradeneeded = (e: any) =>
                {
                    let db = this.database = new Database(walletName, e.target.result);
                    db.createObjectStore('Account', "ID");
                    db.createObjectStore('Contract', "Name");
                    db.createObjectStore('Key', "Name");
                    db.createObjectStore('Coin', "Name");
                    db.createObjectStore('Transaction', "Hash");
                    console.log('IDB already rebuild');
                };
                request.onblocked = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                    return;
                };
            }
            catch (e)
            {
                console.log("打开IDB wallet异常： " + e);
            }
        }

        /**
         * 创建钱包数据库
         * @param passwordKey 钱包密码。
         * @param callback 查询结果的回调函数。
         */
        public createWallet(passwordKey: Uint8Array, callback: () => any)
        {
            let IV = new Uint8Array(16);;
            window.crypto.getRandomValues(IV);
            Key.IV = IV;
            this.addKey(new KeyStore("IV", IV));
            let masterKey = new Uint8Array(32);
            window.crypto.getRandomValues(masterKey);
            Key.MasterKey = masterKey;

            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                passwordKey
            )
                .then(hash =>
                {
                    let passwordHash = new Uint8Array(hash);
                    Key.PasswordHash = passwordHash;
                    this.addKey(new KeyStore("PasswordHash", passwordHash));
                })
                .catch(err =>
                {
                    console.error(err);
                });

            window.crypto.subtle.importKey(
                "raw",
                passwordKey,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(keyImport =>
                {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: IV
                        },
                        keyImport,
                        masterKey
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(q =>
                {
                    masterKey = new Uint8Array(q);
                    this.addKey(new KeyStore("MasterKey", masterKey));

                    let versionArray = new Uint8Array(1);
                    versionArray[0] = this.database.Version;
                    this.addKey(new KeyStore("Version", versionArray));

                    callback(); //执行创建钱包后的回调函数
                })
        }

        /**
         * 向钱包中添加Account
         */
        public addAccount(account: AccountStore, callback = null)
        {
            this.database.addData(StoreName.Account, account, callback);
        }

        /**
         * 向钱包中添加Coin
         */
        public addCoin(coin: CoinStore, callback = null)
        {
            this.database.addData(StoreName.Coin, coin, callback);
        }

        /**
         * 向钱包中添加Contract
         */
        public addContract(contract: ContractStore, callback = null)
        {
            this.database.addData(StoreName.Contract, contract, callback);
        }

        /**
         * 向钱包中添加Key
         */
        public addKey(key: KeyStore, callback = null)
        {
            this.database.addData(StoreName.Key, key, callback);
        }

        /**
         * 向钱包中添加Transaction
         */
        public addTransaction(tx: TransactionStore, callback = null)
        {
            this.database.addData(StoreName.Transaction, tx, callback);
        }


        /**
         * 以事务的方式更新钱包密码
         * @param newPasswordKeyHash 新的钱包密码的Hash
         * @param newMasterKey 新的加密过的MasterKey
         * @param callback 同时修改PasswordKeyHash和MasterKey成功后的回调函数
         */
        private updatePassword(newPasswordKeyHash: Uint8Array, newMasterKey: Uint8Array, callback)
        {
            let transaction = this.database.transaction(StoreName.Key, TransactionMode.READ_WRITE);
            let store = transaction.objectStore("Key");
            let pwdhRquest = store.get("PasswordHash");

            pwdhRquest.onsuccess = (e: any) =>
            {
                let obj = e.target.result;
                obj.Value = newPasswordKeyHash;
                pwdhRquest = store.put(obj);
                pwdhRquest.onsuccess = () =>
                {
                    console.log("1.修改PasswordHash成功");
                };
            };

            let mkRquest = store.get("MasterKey");
            mkRquest.onsuccess = (e: any) =>
            {
                let obj = e.target.result;
                obj.Value = newMasterKey;
                mkRquest = store.put(obj);
                mkRquest.onsuccess = () =>
                {
                    console.log("2.修改MasterKey成功");
                };
            };
            transaction.oncomplete = () =>
            {
                console.log("3.修改PasswordHash和修改MasterKey成功");
                callback();
            }
        }

        /**
         * 验证钱包密码是否正确
         * @param password 用户输入的钱包密码。
         * @param verifySuccess 验证成功时调用的回调函数。
         * @param verifyFaild 验证失败时调用的回调函数。
         */
        public verifyPassword(password: Uint8Array, verifySuccess, verifyFaild)
        {
            this.database.getDataByKey(StoreName.Key, "PasswordHash",
                (key) =>
                {
                    Key.PasswordHash = key.Value;
                    ToPasswordKey(password,
                        (passwordKey) =>
                        {
                            window.crypto.subtle.digest(
                                {
                                    name: "SHA-256",
                                },
                                new Uint8Array(passwordKey)
                            )
                                .then(hash =>
                                {
                                    let currentPasswordHash = new Uint8Array(hash);
                                    if (Equals(Key.PasswordHash, currentPasswordHash))
                                    {
                                        Key.PasswordKey = passwordKey;
                                        verifySuccess();    //调用验证成功的回调函数
                                    }
                                    else
                                    {
                                        verifyFaild();      //调用验证失败的回调函数
                                    }
                                })
                                .catch(err =>
                                {
                                    console.error(err);
                                });
                        }
                    );//ToPasswordKey
                }
            );//GetDataByKey
        }//VerifyPassword

        /**
         * 修改钱包密码（替换PasswordKeyHash, 修改MasterKey）
         * @param oldPassword 旧的钱包密码
         * @param newPassword 新的钱包密码
         * @param callback 成功后执行的方法
         */
        public changePassword(oldPassword: Uint8Array, newPassword: Uint8Array, callback)
        {
            let firstStep = false;
            //1、用旧的PasswordKey对MasterKey解密，再用新的PasswordKey对MasterKey重新加密
            this.database.getDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) =>
                {
                    Key.IV = iv.Value;
                    this.database.getDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) =>
                        {
                            //1.1 解密过程
                            ToPasswordKey(oldPassword,
                                (passwordKey) =>
                                {
                                    window.crypto.subtle.importKey(
                                        "raw",
                                        passwordKey, //旧的PasswordKey,用来解密MasterKey
                                        "AES-CBC",
                                        false,
                                        ["encrypt", "decrypt"]
                                    )
                                        .then(keyImport =>
                                        {
                                            return window.crypto.subtle.decrypt(
                                                {
                                                    name: "AES-CBC",
                                                    iv: Key.IV
                                                },
                                                keyImport,
                                                masterkey.Value //待解密的MasterKey
                                            )
                                        }, err =>
                                        {
                                            console.error(err);
                                        })
                                        .then(q =>
                                        {
                                            let masterKey = new Uint8Array(q); //解密后的masterKey
                                            //1.2 加密过程
                                            ToPasswordKey(newPassword,
                                                (passwordKey) =>
                                                {
                                                    window.crypto.subtle.importKey(
                                                        "raw",
                                                        passwordKey,  //新的PasswordKey,用来加密MasterKey
                                                        "AES-CBC",
                                                        false,
                                                        ["encrypt", "decrypt"]
                                                    )
                                                        .then(keyImport =>
                                                        {
                                                            return window.crypto.subtle.encrypt(
                                                                {
                                                                    name: "AES-CBC",
                                                                    iv: Key.IV
                                                                },
                                                                keyImport,
                                                                masterKey //待加密的masterKey
                                                            )
                                                        }, err =>
                                                        {
                                                            console.error(err);
                                                        })
                                                        .then(q =>
                                                        {
                                                            let newMasterKey = new Uint8Array(q); //重新加密后的masterKey
                                                            Key.PasswordKey = passwordKey;
                                                            //2、替换PasswordKeyHash
                                                            ToPasswordKey(newPassword,
                                                                (passwordKey) =>
                                                                {
                                                                    window.crypto.subtle.digest(
                                                                        {
                                                                            name: "SHA-256",
                                                                        },
                                                                        passwordKey
                                                                    )
                                                                        .then(hash =>
                                                                        {
                                                                            let passwordHash = new Uint8Array(hash);
                                                                            Key.PasswordHash = passwordHash;

                                                                            this.updatePassword(Key.PasswordHash, newMasterKey, callback);
                                                                        })
                                                                        .catch(err =>
                                                                        {
                                                                            console.error(err);
                                                                        });
                                                                }
                                                            );//ToPasswordKey
                                                        })
                                                }
                                            ); //ToPasswordKey
                                        })
                                }
                            ); //ToPasswordKey
                        }
                    ); //GetDataByKey
                }
            ); //GetDataByKey
        }

        /**
         * 打开钱包并解密私钥
         * @param callback 成功后执行的方法
         */
        public loadAccounts = (callback) =>
        {
            this.database.getDataByKey(StoreName.Key, "IV",
                (iv: KeyStore) =>
                {
                    Key.IV = iv.Value;
                    this.database.getDataByKey(StoreName.Key, "MasterKey",
                        (masterkey: KeyStore) =>
                        {
                            Key.MasterKey = masterkey.Value;
                            window.crypto.subtle.importKey(
                                "raw",
                                Key.PasswordKey,
                                "AES-CBC",
                                false,
                                ["encrypt", "decrypt"]
                            )
                                .then(keyImport =>
                                {
                                    return window.crypto.subtle.decrypt(
                                        {
                                            name: "AES-CBC",
                                            iv: Key.IV
                                        },
                                        keyImport,
                                        Key.MasterKey
                                    )
                                }, err =>
                                {
                                    console.error(err);
                                })
                                .then(q =>
                                {
                                    Key.MasterKey = new Uint8Array(q);
                                    this.database.traversalData(StoreName.Account,
                                        (rawDataArray: Array<AccountStore>) =>
                                        {
                                            this.accounts = new Array<AccountItem>();
                                            //以下函数相当于一个for循环,所有异步执行完毕才进入回调函数。
                                            this.decPriKey(rawDataArray, 0, callback);
                                        }
                                    );
                                }, err =>
                                {
                                    console.log("解密MasterKey失败");
                                });
                        }
                    );//GetDataByKey
                }
            );//GetDataByKey
        }//OpenWalletAndDecryptPrivateKey

        /**
         * 从数据库中读取合约存到contracts变量中
         */
        public loadContracts = (callback) =>
        {
            this.database.traversalData(StoreName.Contract, (rawData: Array<ContractStore>) =>
            {
                this.contracts = new Array<Contract>();
                this.addToContracts(rawData, 0, callback);
            })
        }

        private addToContracts(rawData: Array<ContractStore>, i: number, callback)
        {
            if (i >= rawData.length)
            {
                callback();
                return;
            }
            toAddress(rawData[i].ScriptHash, (addr: string) =>
            {
                if (rawData[i].Type == "SignatureContract" || rawData[i].Type == "MultiSigContract")
                {
                    let item = rawData[i].RawData as Contract;
                    item.Address = addr;
                    item.ScriptHash = rawData[i].ScriptHash;
                    this.contracts.push(item);
                }
                this.addToContracts(rawData, ++i, callback);
            });
        }

        /**
         * 从数据库中读取合约存到coins变量中
         */
        public loadCoins = (callback) =>
        {
            this.database.traversalData(StoreName.Coin, (rawData: Array<CoinStore>) =>
            {
                this.coins = new Array<CoinItem>();
                this.addToCoins(rawData, 0, callback);
            })
        }

        private addToCoins(rawData: Array<CoinStore>, i: number, callback)
        {
            if (i >= rawData.length)
            {
                callback();
                return;
            }
            let item = new CoinItem(rawData[i].Input, rawData[i].Address, rawData[i].State, rawData[i].AssetId, rawData[i].Value);
            this.coins.push(item);
            this.addToCoins(rawData, ++i, callback);
        }

        public setHeight(height: number, callback)
        {
            this.database.updateDataByKey(StoreName.Key, "Height", new Wallets.KeyStore("Height", height), () =>
            {
                if (callback)
                    callback();
            })
        }

        public encriptPrivateKeyAndSave = (privateKey, publicKey, publicKeyHash, accountName, callback) =>
        {
            let encryptedPrivateKey = new Uint8Array(96);
            encryptedPrivateKey.set(privateKey, 0);
            encryptedPrivateKey.set(publicKey, 32);
            window.crypto.subtle.importKey(
                "raw",
                Key.MasterKey,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(importKey =>
                {
                    return window.crypto.subtle.encrypt(
                        {
                            name: "AES-CBC",
                            iv: Key.IV
                        },
                        importKey,
                        encryptedPrivateKey
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(result =>
                {
                    let account = new AccountStore(accountName, publicKeyHash, new Uint8Array(result));
                    this.addAccount(account);
                    if (typeof callback === "function")
                    {
                        callback();
                    }
                }, err =>
                {
                    console.error(err);
                })
        }

        /**
         * 对加密过的privateKeyEncrypted进行解密
         * @param rawData 从数据库中读出的account字段
         */
        private decPriKey = (rawDataArray: Array<AccountStore>, i: number, callback) =>
        {
            if (i >= rawDataArray.length)
            {
                callback();
                return;
            }
            window.crypto.subtle.importKey(
                "raw",
                Key.MasterKey, //解密过的MasterKey
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
                .then(keyImport =>
                {
                    return window.crypto.subtle.decrypt(
                        {
                            name: "AES-CBC",
                            iv: Key.IV
                        },
                        keyImport,
                        rawDataArray[i].PrivateKeyEncrypted //AES加密后的私钥和公钥
                    )
                }, err =>
                {
                    console.error(err);
                })
                .then(q =>
                {
                    let privateKeyEncrypted = new Uint8Array(q);
                    let privateKey = privateKeyEncrypted.subarray(0, 32);
                    let publicKey = privateKeyEncrypted.subarray(32, 96);
                    let publicECPoint = Cryptography.ECPoint.fromUint8Array(publicKey, Cryptography.ECCurve.secp256r1);
                    let item = new AccountItem(rawDataArray[i].Name, rawDataArray[i].PublicKeyHash, privateKey, publicECPoint);
                    this.accounts.push(item);
                    this.decPriKey(rawDataArray, ++i, callback);
                }, err =>
                {
                    console.log("解密私钥失败");
                });
        }

        public sign(context: Core.SignatureContext, callback: (fSuccess: boolean) => any)
        {
            this.signLoop(false, context, 0, callback);
        }

        private signLoop(fSuccess: boolean, context: Core.SignatureContext, i: number, callback: (fSuccess: boolean) => any)
        {
            if (i > context.scriptHashes.length)
            {
                callback(fSuccess);
                return;
            }
            let scriptHash = context.scriptHashes[i];
            let contract = this.getContract(scriptHash);
            if (contract == null) this.signLoop(fSuccess, context, ++i, callback);
            let account = this.getAccountByScriptHash(scriptHash);
            if (account == null) this.signLoop(fSuccess, context, ++i, callback);
            context.signable.sign(account, (signed) =>
            {
                fSuccess = fSuccess || context.Add(contract, account.PublicKeyPoint, signed);
                this.signLoop(fSuccess, context, ++i, callback);
            });
        }

        private getAccountByScriptHash(scriptHash: Uint8Array): AccountItem
        {
            for (let c of this.contracts)
            {
                if (c.ScriptHash == scriptHash)
                {
                    for (let a of this.accounts)
                    {
                        if (a.PublicKeyHash == c.PublicKeyHash)
                        {
                            return a;
                        }
                    }
                }
            }
            return null;
        }

        private getContract(scriptHash: Uint8Array): Contract
        {
            for (let c of this.contracts)
            {
                if (c.ScriptHash == scriptHash)
                {
                    return c;
                }
            }
            return null;
        }

        public createECDSAKey = (pAccountName: string, pAccount: Wallets.Account, callback: (account: Wallets.Account) => any) =>
        {
            window.crypto.subtle.generateKey(
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["sign", "verify"]
            )
                .then(p =>
                {
                    return window.crypto.subtle.exportKey("jwk", p.privateKey); //以jwk格式导出私钥
                }, err =>
                {
                    console.error(err);
                })
                .then(p =>
                {
                    pAccount.privateKey = p.d.base64UrlDecode();
                    let publicKey = new Uint8Array(64);
                    publicKey.set(p.x.base64UrlDecode(), 0);
                    publicKey.set(p.y.base64UrlDecode(), 32);
                    pAccount.publicECPoint = Cryptography.ECPoint.fromUint8Array(publicKey, Cryptography.ECCurve.secp256r1);
                    pAccount.publicKey = pAccount.publicECPoint.encodePoint(false).subarray(1, 65);

                    ToScriptHash(pAccount.publicECPoint.encodePoint(true),
                        (publicKeyHash: Uint8Array) =>
                        {
                            pAccount.PublicKeyHash = publicKeyHash;
                            GlobalWallet.getCurrentWallet().encriptPrivateKeyAndSave(
                                pAccount.privateKey,
                                pAccount.publicKey,
                                publicKeyHash,
                                pAccountName,
                                null
                            );
                            callback(pAccount);
                        }
                    );
                });
        }

        public createContract = (pPublicKeyHash: Uint8Array, pPublicECPoint: AntShares.Cryptography.ECPoint, callback: any) =>
        {
            let sc = new Wallets.SignatureContract(pPublicKeyHash, pPublicECPoint);
            ToScriptHash(sc.RedeemScript, (pScriptHash: Uint8Array) =>
            {
                let contract = new Wallets.ContractStore(pScriptHash, sc, sc.PublicKeyHash, sc.Type);
                let wallet = GlobalWallet.getCurrentWallet();
                wallet.addContract(contract);
                callback(wallet);
            })
        }

        public loadSomething(callback)
        {
            this.loadAccounts(() =>
            {
                this.loadContracts(() =>
                {
                    this.loadCoins(() =>
                    {
                        if (callback)
                            callback();
                    })
                });
            });
        }

        public makeTransaction(tx: Core.Transaction, fee: Fixed8): Core.Transaction
        {
            if (tx.vout == null)
                throw new Error();
            if (tx.attributes == null) tx.attributes = new Core.TransactionAttribute[0];
            fee.add(tx.systemFee);
            //481
            let pay_total = (tx.type == Core.TransactionType.IssueTransaction ? new Core.TransactionOutput[0] : tx.vout) as Core.TransactionOutput[];

            let group = new Array<AssetItem>();
            for (let i = 0; i < pay_total.length; i++)
            {
                let assetItem = new AssetItem(pay_total[i].assetId, pay_total[i].value);
                let index = group.indexOf(assetItem);
                if (index < 0)
                {
                    group.push(assetItem);
                }
                else
                {
                    group[index].value = group[index].value.add(pay_total[i].value);
                }
            }


            return tx;
        }

    }
    /**
     * 计算pay_total分组排序用的
     */
    class AssetItem
    {
        constructor(public assetId: Uint8Array, public value: Fixed8) { }
    }
}