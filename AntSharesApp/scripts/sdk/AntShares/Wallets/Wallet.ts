namespace AntShares.Wallets
{
    export abstract class Wallet
    {
        public balanceChanged = new __event(this);

        private path: string;
        private iv: Uint8Array;
        private masterKey: Uint8Array;
        private accounts = new Map<string, Account>();
        private contracts = new Map<string, Contract>();
        private coins: IO.Caching.TrackableCollection<string, Coin>;
        private current_height: number;
        private isrunning = true;
        private isclosed = false;

        public static get CoinVersion() { return 0x17; }
        public get dbPath() { return this.path; }
        protected get walletHeight() { return this.current_height; }

        public addContract(contract: Contract): PromiseLike<void>
        {
            if (!this.accounts.has(contract.publicKeyHash.toString()))
                throw new RangeError();
            this.contracts.set(contract.scriptHash.toString(), contract);
            return Promise.resolve(null);
        }

        protected buildDatabase(): PromiseLike<void>
        {
            return Promise.resolve(void 0);
        }

        public changePassword(password_old: string, password_new: string): PromiseLike<boolean>
        {
            return Promise.all([
                this.loadStoredData("PasswordHash"),
                password_old.toAesKey().then(result =>
                {
                    return window.crypto.subtle.digest("SHA-256", result);
                })
            ]).then(results =>
            {
                if (results[0].byteLength != results[1].byteLength)
                    throw new Error();
                let x = new Uint8Array(results[0]), y = new Uint8Array(results[1]);
                for (let i = 0; i < x.length; i++)
                    if (x[i] != y[i])
                        throw new Error();
                return password_new.toAesKey();
            }).then(result =>
            {
                return window.crypto.subtle.importKey("jwk", <any>{ kty: "oct", k: (new Uint8Array(result)).base64UrlEncode(), alg: "A256CBC", ext: true }, "AES-CBC", false, ["encrypt"]);
            }).then(result =>
            {
                return window.crypto.subtle.encrypt({ name: "AES-CBC", iv: this.iv }, result, this.masterKey);
            }).then(result =>
            {
                return this.saveStoredData("MasterKey", result);
            }).then(() => true, () => false);
        }

        public close(): PromiseLike<void>
        {
            this.isrunning = false;
            return new Promise<void>((resolve, reject) =>
            {
                let f = () =>
                {
                    if (this.isclosed) resolve();
                    else setTimeout(f, 1000);
                };
                f();
            });
        }

        public containsAccount(publicKey: Cryptography.ECPoint): PromiseLike<boolean>;
        public containsAccount(publicKeyHash: Uint160): boolean;
        public containsAccount(): PromiseLike<boolean> | boolean
        {
            if (arguments[0] instanceof Cryptography.ECPoint)
            {
                return arguments[0].encodePoint(true).toScriptHash().then(result =>
                {
                    return this.containsAccount(result);
                });
            }
            else
            {
                return this.accounts.has(arguments[0].toString());
            }
        }

        public containsAddress(scriptHash: Uint160): boolean
        {
            return this.contracts.has(scriptHash.toString());
        }

        public createAccount(privateKey?: ArrayBuffer | Uint8Array): PromiseLike<Account>
        {
            return Account.create(privateKey).then(result =>
            {
                this.accounts.set(result.publicKeyHash.toString(), result);
                return result;
            });
        }

        protected decryptPrivateKey(encryptedPrivateKey: Uint8Array): PromiseLike<Uint8Array>
        {
            if (encryptedPrivateKey == null) throw new RangeError();
            if (encryptedPrivateKey.byteLength != 112) throw new RangeError();
            return window.crypto.subtle.importKey("jwk", <any>{ kty: "oct", k: this.masterKey.base64UrlEncode(), alg: "A256CBC", ext: true }, "AES-CBC", false, ["decrypt"]).then(result =>
            {
                return window.crypto.subtle.decrypt({ name: "AES-CBC", iv: this.iv }, result, encryptedPrivateKey);
            }).then(result =>
            {
                return new Uint8Array(result);
            });
        }

        public deleteAccount(publicKeyHash: Uint160): PromiseLike<boolean>
        {
            let promises = new Array<PromiseLike<boolean>>();
            this.contracts.forEach(contract =>
            {
                if (contract.publicKeyHash.equals(publicKeyHash))
                    promises.push(this.deleteContract(contract.scriptHash));
            });
            return Promise.all(promises).then(() =>
            {
                return this.accounts.delete(publicKeyHash.toString());
            });
        }

        public deleteContract(scriptHash: Uint160): PromiseLike<boolean>
        {
            this.coins.forEach((coin, key) =>
            {
                if (coin.scriptHash.equals(scriptHash))
                    this.coins.remove(key);
            });
            this.coins.commit();
            return Promise.resolve(this.contracts.delete(scriptHash.toString()));
        }

        protected encryptPrivateKey(decryptedPrivateKey: Uint8Array): PromiseLike<Uint8Array>
        {
            return window.crypto.subtle.importKey("jwk", <any>{ kty: "oct", k: this.masterKey.base64UrlEncode(), alg: "A256CBC", ext: true }, "AES-CBC", false, ["encrypt"]).then(result =>
            {
                return window.crypto.subtle.encrypt({ name: "AES-CBC", iv: this.iv }, result, decryptedPrivateKey);
            }).then(result =>
            {
                return new Uint8Array(result);
            });
        }

        public findCoins(): Coin[]
        {
            let array = new Array<Coin>();
            this.coins.forEach(coin =>
            {
                if (coin.state == CoinState.Unconfirmed || coin.state == CoinState.Unspent)
                    array.push(coin);
            });
            return array;
        }

        public findUnspentCoins(asset_id?: Uint256, amount?: Fixed8): Coin[]
        {
            let array = new Array<Coin>();
            this.coins.forEach(coin =>
            {
                if (coin.state == CoinState.Unspent)
                    array.push(coin);
            });
            if (arguments.length == 0) return array;
            return Wallet.findUnspentCoins(array, asset_id, amount);
        }

        protected static findUnspentCoins(unspents: Coin[], asset_id: Uint256, amount: Fixed8): Coin[]
        {
            let array = new Array<Coin>();
            for (let i = 0; i < unspents.length; i++)
                if (unspents[i].assetId.equals(asset_id))
                    array.push(unspents[i]);
            unspents = array;
            for (let i = 0; i < unspents.length; i++)
                if (unspents[i].value.equals(amount))
                    return [unspents[i]];
            unspents.sort((a, b) => a.value.compareTo(b.value));
            for (let i = 0; i < unspents.length; i++)
                if (unspents[i].value.compareTo(amount) > 0)
                    return [unspents[i]];
            let sum = Fixed8.Zero;
            for (let i = 0; i < unspents.length; i++)
                sum = sum.add(unspents[i].value);
            if (sum.compareTo(amount) < 0) return null;
            if (sum.equals(amount)) return unspents;
            array = new Array<Coin>();
            for (let i = unspents.length - 1; i >= 0; i--)
            {
                if (amount.equals(Fixed8.Zero)) break;
                amount = amount.subtract(Fixed8.min(amount, unspents[i].value));
            }
            return array;
        }

        public getAccount(publicKey: Cryptography.ECPoint): PromiseLike<Account>;
        public getAccount(publicKeyHash: Uint160): Account;
        public getAccount()
        {
            if (arguments[0] instanceof Cryptography.ECPoint)
            {
                return arguments[0].encodePoint(true).toScriptHash().then(result =>
                {
                    return this.getAccount(result);
                });
            }
            else
            {
                let key = arguments[0].toString();
                if (!this.accounts.has(key)) return null;
                return this.accounts.get(key);
            }
        }

        public getAccountByScriptHash(scriptHash: Uint160): Account
        {
            let key = scriptHash.toString();
            if (!this.contracts.has(key)) return null;
            return this.accounts.get(this.contracts.get(key).publicKeyHash.toString());
        }

        public getAccounts(): Account[]
        {
            let array = new Array<Account>();
            this.accounts.forEach(account =>
            {
                array.push(account);
            });
            return array;
        }

        public getAddresses(): Uint160[]
        {
            let array = new Array<Uint160>();
            this.contracts.forEach(contract =>
            {
                array.push(contract.scriptHash);
            });
            return array;
        }

        public getAvailable(asset_id: Uint256): Fixed8
        {
            let sum = Fixed8.Zero;
            this.coins.forEach(coin =>
            {
                if (coin.state == CoinState.Unspent && coin.assetId.equals(asset_id))
                    sum = sum.add(coin.value);
            });
            return sum;
        }

        public getBalance(asset_id: Uint256): Fixed8
        {
            let sum = Fixed8.Zero;
            this.coins.forEach(coin =>
            {
                if ((coin.state == CoinState.Unconfirmed || coin.state == CoinState.Unspent) && coin.assetId.equals(asset_id))
                    sum = sum.add(coin.value);
            });
            return sum;
        }

        public getChangeAddress(): Uint160
        {
            let array = this.getContracts();
            for (let i = 0; i < array.length; i++)
                if (array[i].isStandard())
                    return array[i].scriptHash;
            return array[0].scriptHash;
        }

        public getContract(scriptHash: Uint160): Contract
        {
            let key = scriptHash.toString();
            if (!this.contracts.has(key)) return null;
            return this.contracts.get(key);
        }

        public getContracts(publicKeyHash?: Uint160): Contract[]
        {
            let array = new Array<Contract>();
            this.contracts.forEach(contract =>
            {
                if (publicKeyHash == null || publicKeyHash.equals(contract.publicKeyHash))
                    array.push(contract);
            });
            return array;
        }

        public static getPrivateKeyFromWIF(wif: string): PromiseLike<ArrayBuffer>
        {
            if (wif == null) throw new RangeError();
            let data = wif.base58Decode();
            if (data.length != 38 || data[0] != 0x80 || data[33] != 0x01)
                throw new RangeError();
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, data.length - 4)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                let array = new Uint8Array(result);
                for (let i = 0; i < 4; i++)
                    if (data[data.length - 4 + i] != array[i])
                        throw new RangeError();
                let privateKey = new Uint8Array(32);
                Array.copy(data, 1, privateKey, 0, privateKey.length);
                return privateKey.buffer;
            });
        }

        public getUnclaimedCoins(): Coin[]
        {
            let array = new Array<Coin>();
            this.coins.forEach(coin =>
            {
                if (coin.state == CoinState.Spent && coin.assetId.equals(Core.Blockchain.AntShare.hash))
                    array.push(coin);
            });
            return array;
        }

        public import(wif: string): PromiseLike<Account>
        {
            return Wallet.getPrivateKeyFromWIF(wif).then(result =>
            {
                return this.createAccount(new Uint8Array(result));
            });
        }

        protected init(path: string, password: string | ArrayBuffer, create: boolean): PromiseLike<void>
        {
            this.path = path;
            let passwordKey: Uint8Array, passwordKeyHash: Uint8Array, aesKey: any;
            let current_version = new Uint8Array([0, 7, 0, 0]);
            return Promise.resolve(typeof password === "string" ? password.toAesKey() : password).then(result =>
            {
                passwordKey = new Uint8Array(result);
                return Promise.all<any>([
                    window.crypto.subtle.digest("SHA-256", passwordKey),
                    window.crypto.subtle.importKey("jwk", <any>{ kty: "oct", k: passwordKey.base64UrlEncode(), alg: "A256CBC", ext: true }, "AES-CBC", false, ["encrypt", "decrypt"])
                ]);
            }).then(results =>
            {
                passwordKeyHash = new Uint8Array(results[0]);
                aesKey = results[1];
                if (create)
                {
                    this.iv = new Uint8Array(16);
                    this.masterKey = new Uint8Array(32);
                    this.coins = new IO.Caching.TrackableCollection<string, Coin>();
                    return Promise.resolve(Core.Blockchain.Default == null ? 0 : Core.Blockchain.Default.getBlockCount()).then(result =>
                    {
                        this.current_height = result;
                        window.crypto.getRandomValues(this.iv);
                        window.crypto.getRandomValues(this.masterKey);
                        return Promise.all<any>([
                            this.buildDatabase(),
                            window.crypto.subtle.encrypt({ name: "AES-CBC", iv: this.iv }, aesKey, this.masterKey)
                        ]);
                    }).then(results =>
                    {
                        return <any>Promise.all([
                            this.saveStoredData("PasswordHash", passwordKeyHash),
                            this.saveStoredData("IV", this.iv.buffer),
                            this.saveStoredData("MasterKey", results[1]),
                            this.saveStoredData("Version", current_version.buffer),
                            this.saveStoredData("Height", new Uint32Array([this.current_height]).buffer)
                        ]);
                    });
                }
                else
                {
                    return Promise.all([
                        this.loadStoredData("PasswordHash"),
                        this.loadStoredData("IV")
                    ]).then(results =>
                    {
                        let passwordHash = new Uint8Array(results[0]);
                        if (passwordHash.length != passwordKeyHash.length)
                            throw new Error();
                        for (let i = 0; i < passwordHash.length; i++)
                            if (passwordHash[i] != passwordKeyHash[i])
                                throw new Error();
                        this.iv = new Uint8Array(results[1]);
                        return this.loadStoredData("MasterKey");
                    }).then(result =>
                    {
                        return window.crypto.subtle.decrypt({ name: "AES-CBC", iv: this.iv }, aesKey, <any>result);
                    }).then(result =>
                    {
                        this.masterKey = new Uint8Array(result);
                        return Promise.all<any>([
                            this.loadAccounts(),
                            this.loadContracts(),
                            this.loadCoins(),
                            this.loadStoredData("Height"),
                        ]);
                    }).then(results =>
                    {
                        for (let i = 0; i < results[0].length; i++)
                            this.accounts.set(results[0][i].publicKeyHash.toString(), results[0][i]);
                        for (let i = 0; i < results[1].length; i++)
                            this.contracts.set(results[1][i].scriptHash.toString(), results[1][i]);
                        this.coins = new IO.Caching.TrackableCollection<string, Coin>(results[2]);
                        this.current_height = (new Uint32Array(results[3]))[0];
                    });
                }
            }).then(() =>
            {
                setTimeout(this.processBlocks.bind(this), Core.Blockchain.SecondsPerBlock * 1000);
            });
        }

        protected abstract loadAccounts(): PromiseLike<Account[]>;

        protected abstract loadCoins(): PromiseLike<Coin[]>;

        protected abstract loadContracts(): PromiseLike<Contract[]>;

        protected abstract loadStoredData(name: string): PromiseLike<ArrayBuffer>;

        public makeTransaction<T extends Core.Transaction>(tx: T, fee: Fixed8): T
        {
            if (tx.outputs == null) throw new RangeError();
            if (tx.attributes == null) tx.attributes = new Array<Core.TransactionAttribute>();
            fee = fee.add(tx.systemFee);
            let outputs = tx instanceof Core.IssueTransaction ? new Array<Core.TransactionOutput>() : tx.outputs;
            let pay_total = new Map<string, { assetId: Uint256, value: Fixed8 }>();
            for (let i = 0; i < outputs.length; i++)
            {
                let key = outputs[i].assetId.toString();
                if (pay_total.has(key))
                {
                    let item = pay_total.get(key);
                    item.value = item.value.add(outputs[i].value);
                }
                else
                {
                    pay_total.set(key, { assetId: outputs[i].assetId, value: outputs[i].value });
                }
            }
            if (fee.compareTo(Fixed8.Zero) > 0)
            {
                let key = Core.Blockchain.AntCoin.hash.toString();
                if (pay_total.has(key))
                {
                    let item = pay_total.get(key);
                    item.value = item.value.add(fee);
                }
                else
                {
                    pay_total.set(key, { assetId: Core.Blockchain.AntCoin.hash, value: fee });
                }
            }
            let pay_coins = new Array<Core.TransactionInput>(), input_sum = new Array<{ assetId: Uint256, value: Fixed8 }>(), insufficient = false;
            pay_total.forEach(item =>
            {
                let unspents = this.findUnspentCoins(item.assetId, item.value);
                if (unspents == null)
                {
                    insufficient = true;
                    return;
                }
                let sum = Fixed8.Zero;
                for (let i = 0; i < unspents.length; i++)
                {
                    sum = sum.add(unspents[i].value);
                    pay_coins.push(unspents[i].input);
                }
                input_sum.push({ assetId: item.assetId, value: sum });
            });
            if (insufficient) return null;
            let change_address = this.getChangeAddress();
            for (let i = 0; i < input_sum.length; i++)
            {
                let key = input_sum[i].assetId.toString();
                if (input_sum[i].value.compareTo(pay_total.get(key).value) > 0)
                {
                    let output = new Core.TransactionOutput();
                    output.assetId = input_sum[i].assetId;
                    output.value = input_sum[i].value.subtract(pay_total.get(key).value);
                    output.scriptHash = change_address;
                    tx.outputs.push(output);
                }
            }
            tx.inputs = pay_coins;
            return tx;
        }

        protected abstract onProcessNewBlock(block: Core.Block, transactions: Core.Transaction[], added: Coin[], changed: Coin[], deleted: Coin[]): PromiseLike<void>;

        protected abstract onSendTransaction(tx: Core.Transaction, added: Coin[], changed: Coin[]): PromiseLike<void>;

        private processBlocks(): void
        {
            if (!this.isrunning)
            {
                this.isclosed = true;
                return;
            }
            Promise.resolve(Core.Blockchain.Default == null ? 0 : Core.Blockchain.Default.getBlockCount()).then(result =>
            {
                let block_height = result;
                if (this.current_height >= block_height)
                    return Core.Blockchain.SecondsPerBlock;
                return Core.Blockchain.Default.getBlock(this.current_height).then(result =>
                {
                    if (result == null) return 0;
                    return this.processNewBlock(result).then(() =>
                    {
                        return this.current_height < block_height ? 0 : Core.Blockchain.SecondsPerBlock;
                    });
                });
            }).then(result =>
            {
                if (this.isrunning)
                    setTimeout(this.processBlocks.bind(this), result * 1000);
                else
                    this.isclosed = true;
            });
        }

        private processNewBlock(block: Core.Block): PromiseLike<void>
        {
            let promises = new Array<PromiseLike<Uint160>>();
            promises.push(block.ensureHash());
            for (let i = 0; i < block.transactions.length; i++)
                promises.push(block.transactions[i].ensureHash());
            return Promise.all(promises).then(() =>
            {
                let map = new Map<string, Core.Transaction>();
                for (let i = 0; i < block.transactions.length; i++)
                {
                    let tx = block.transactions[i];
                    for (let index = 0; index < tx.outputs.length; index++)
                    {
                        let output = tx.outputs[index];
                        if (this.contracts.has(output.scriptHash.toString()))
                        {
                            let input = new Core.TransactionInput();
                            input.prevHash = tx.hash;
                            input.prevIndex = index;
                            if (this.coins.has(input.toString()))
                            {
                                this.coins.get(input.toString()).state = CoinState.Unspent;
                            }
                            else
                            {
                                let coin = new Coin();
                                coin.input = input;
                                coin.assetId = output.assetId;
                                coin.value = output.value;
                                coin.scriptHash = output.scriptHash;
                                coin.state = CoinState.Unspent;
                                this.coins.add(coin);
                            }
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                for (let i = 0; i < block.transactions.length; i++)
                {
                    let tx = block.transactions[i];
                    let inputs = tx.getAllInputs();
                    for (let j = 0; j < inputs.length; j++)
                    {
                        let inputKey = inputs[j].toString();
                        if (this.coins.has(inputKey))
                        {
                            if (this.coins.get(inputKey).assetId.equals(Core.Blockchain.AntShare.hash))
                                this.coins.get(inputKey).state = CoinState.Spent;
                            else
                                this.coins.remove(inputKey);
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                for (let i = 0; i < block.transactions.length; i++)
                {
                    if (block.transactions[i].type != Core.TransactionType.ClaimTransaction)
                        continue;
                    let tx = <Core.ClaimTransaction>block.transactions[i];
                    for (let j = 0; j < tx.claims.length; j++)
                    {
                        let claimKey = tx.claims[j].toString();
                        if (this.coins.has(claimKey))
                        {
                            this.coins.remove(claimKey);
                            map.set(tx.hash.toString(), tx);
                        }
                    }
                }
                this.current_height++;
                let changeset = this.coins.getChangeSet();
                let transactions = new Array<Core.Transaction>();
                map.forEach(tx => transactions.push(tx));
                let added = new Array<Coin>(), changed = new Array<Coin>(), deleted = new Array<Coin>();
                for (let i = 0; i < changeset.length; i++)
                {
                    if (changeset[i].trackState == IO.Caching.TrackState.Added)
                        added.push(changeset[i]);
                    else if (changeset[i].trackState == IO.Caching.TrackState.Changed)
                        changed.push(changeset[i]);
                    else if (changeset[i].trackState == IO.Caching.TrackState.Deleted)
                        deleted.push(changeset[i]);
                }
                return this.onProcessNewBlock(block, transactions, added, changed, deleted).then(() =>
                {
                    this.coins.commit();
                    this.balanceChanged.dispatchEvent(null);
                });
            });
        }

        public rebuild(): PromiseLike<void>
        {
            this.coins.clear();
            this.coins.commit();
            this.current_height = 0;
            return Promise.resolve(null);
        }

        protected abstract saveStoredData(name: string, value: ArrayBuffer): PromiseLike<void>;

        public sendTransaction(tx: Core.Transaction): PromiseLike<boolean>
        {
            let inputs = tx.getAllInputs();
            for (let i = 0; i < inputs.length; i++)
            {
                let key = inputs[i].toString();
                if (!this.coins.has(key) || this.coins.get(key).state != CoinState.Unspent)
                    return Promise.resolve(false);
            }
            return tx.ensureHash().then(() =>
            {
                for (let i = 0; i < inputs.length; i++)
                    this.coins.get(inputs[i].toString()).state = CoinState.Spending;
                for (let i = 0; i < tx.outputs.length; i++)
                {
                    if (this.contracts.has(tx.outputs[i].scriptHash.toString()))
                    {
                        let coin = new Coin();
                        coin.input = new Core.TransactionInput();
                        coin.input.prevHash = tx.hash;
                        coin.input.prevIndex = i;
                        coin.assetId = tx.outputs[i].assetId;
                        coin.value = tx.outputs[i].value;
                        coin.scriptHash = tx.outputs[i].scriptHash;
                        coin.state = CoinState.Unconfirmed;
                        this.coins.add(coin);
                    }
                }
                let changeset = this.coins.getChangeSet();
                if (changeset.length == 0) return true;
                let added = new Array<Coin>(), changed = new Array<Coin>();
                for (let i = 0; i < changeset.length; i++)
                {
                    if (changeset[i].trackState == IO.Caching.TrackState.Added)
                        added.push(changeset[i]);
                    else if (changeset[i].trackState == IO.Caching.TrackState.Changed)
                        changed.push(changeset[i]);
                }
                return this.onSendTransaction(tx, added, changed).then(() =>
                {
                    this.coins.commit();
                    this.balanceChanged.dispatchEvent(null);
                    return true;
                });
            });
        }

        public sign(context: Core.SignatureContext): PromiseLike<boolean>
        {
            let promises = new Array<PromiseLike<{ contract: Contract, account: Account, signature: ArrayBuffer }>>();
            for (let i = 0; i < context.scriptHashes.length; i++)
            {
                let contract = this.getContract(context.scriptHashes[i]);
                if (contract == null) continue;
                let account = this.getAccountByScriptHash(context.scriptHashes[i]);
                if (account == null) continue;
                promises.push(this.signInternal(context.signable, account).then(result =>
                {
                    return { contract: contract, account: account, signature: result };
                }));
            }
            return Promise.all(promises).then(results =>
            {
                let fSuccess = false;
                for (let i = 0; i < results.length; i++)
                {
                    fSuccess = fSuccess || context.add(results[i].contract, results[i].account.publicKey, results[i].signature);
                }
                return fSuccess;
            });
        }

        private signInternal(signable: Core.ISignable, account: Account): PromiseLike<ArrayBuffer>
        {
            let pubkey = account.publicKey.encodePoint(false);
            let d = new Uint8Array(account.privateKey).base64UrlEncode();
            let x = pubkey.subarray(1, 33).base64UrlEncode();
            let y = pubkey.subarray(33, 65).base64UrlEncode();
            let ms = new IO.MemoryStream();
            let writer = new IO.BinaryWriter(ms);
            signable.serializeUnsigned(writer);
            return Promise.all<any>([
                window.crypto.subtle.importKey("jwk", <any>{ kty: "EC", crv: "P-256", d: d, x: x, y: y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]),
                window.crypto.subtle.digest("SHA-256", ms.toArray())
            ]).then(results =>
            {
                return window.crypto.subtle.sign({ name: "ECDSA", hash: { name: "SHA-256" } }, results[0], results[1]);
            });
        }

        public static toAddress(scriptHash: Uint160): PromiseLike<string>
        {
            let data = new Uint8Array(25);
            data[0] = Wallet.CoinVersion;
            Array.copy(new Uint8Array(scriptHash.bits.buffer), 0, data, 1, 20);
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, 21)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                Array.copy(new Uint8Array(result), 0, data, 21, 4);
                return data.base58Encode();
            });
        }

        public static toScriptHash(address: string): PromiseLike<Uint160>
        {
            let data = address.base58Decode();
            if (data.length != 25) throw new RangeError();
            if (data[0] != Wallet.CoinVersion) throw new RangeError();
            return window.crypto.subtle.digest("SHA-256", new Uint8Array(data.buffer, 0, data.length - 4)).then(result =>
            {
                return window.crypto.subtle.digest("SHA-256", result);
            }).then(result =>
            {
                let array = new Uint8Array(result);
                for (let i = 0; i < 4; i++)
                    if (array[i] != data[data.length - 4 + i])
                        throw new RangeError();
                array = new Uint8Array(20);
                Array.copy(data, 1, array, 0, 20);
                return new Uint160(array.buffer);
            });
        }
    }
}
