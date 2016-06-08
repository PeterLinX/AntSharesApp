namespace AntShares
{
    export class Database
    {
        private _version: number;
        get Version(): number
        {
            return this._version = 6;
        }

        constructor(private dbName: string, private db: IDBDatabase) { }

        public createObjectStore(name: string, key: string)
        {
            if (!this.db.objectStoreNames.contains(name))
                this.db.createObjectStore(name, { keyPath: key });
        }

        public addData(storeName: StoreName, data: Wallets.DBStore, callback)
        {
            try
            {
                if (this.db)
                {
                    let transaction = this.transaction(storeName, TransactionMode.READ_WRITE);
                    let store = transaction.objectStore(StoreName[storeName]);
                    let request = store.add(data);
                    request.onsuccess = (e: any) =>
                    {
                        console.log('add ' + StoreName[storeName] + ' success');
                        if (callback != null)
                            callback();
                    };
                    request.onerror = (e: any) =>
                    {
                        console.log("向" + StoreName[storeName] + "添加数据错误：" + e.currentTarget.error.toString());
                    };
                }
                else
                {
                    console.log('database.db = null');
                }
            }
            catch (e)
            {
                console.log(e);
            }
        }

        public closeDB()
        {
            try
            {
                if (this.db != null)
                {
                    this.db.close();
                }
                else
                {
                    console.log('db = null');
                }
            }
            catch (e)
            {
                console.log(e);
            }
        }

        public clearObjectStore(storeName: StoreName)
        {
            let transaction = this.transaction(storeName, TransactionMode.READ_WRITE);
            let store = transaction.objectStore(StoreName[storeName]);
            store.clear();
        }

        public deleteDataByKey(storeName: StoreName, key: string)
        {
            let transaction = this.transaction(storeName, TransactionMode.READ_WRITE);
            let store = transaction.objectStore(StoreName[storeName]);
            store.delete(key);
        }

        /**
         * 删除IndexdDB
         */
        public deleteIndexdDB()
        {
            try
            {
                let request = window.indexedDB.deleteDatabase(this.dbName);
                request.onsuccess = () =>
                {
                    console.log('Database deleted');
                    this.db = null;
                };
                request.onerror = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                };
            }
            catch (e)
            {
                console.log(e);
            }
        };

        /**
         * 根据key查询数据
         * @param storeName objectStore名称。
         * @param key 要查询的Key。
         * @param callback 查询结果的回调函数。
         */
        public getDataByKey(storeName: StoreName, key: string, callback: (key: Wallets.KeyStore) => any)
        {
            if (this.db)
            {
                let transaction = this.transaction(storeName, TransactionMode.READ_ONLY);
                let store = transaction.objectStore(StoreName[storeName]);
                let request = store.get(key);

                request.onsuccess = (e: any) =>
                {
                    callback(e.target.result);
                };
                request.onerror = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                };
            }
            else
            {
                console.log('在' + StoreName[storeName] + '中读取' + key + '错误，因为db=null');
            }
        }

        /**
         * 遍历钱包的objectStore
         * @param storeName objectStore名称。
         * @param callback 遍历完毕时执行的方法，参数是遍历的结果数组型。
         */
        public traversalData(storeName: StoreName, callback: (result: Array<any>) => any)
        {
            try
            {
                if (this.db)
                {
                    let array = new Array<Uint8Array>();
                    let transaction = this.transaction(storeName, TransactionMode.READ_WRITE);
                    let objectStore = transaction.objectStore(StoreName[storeName]);
                    let request = objectStore.openCursor();
                    request.onsuccess = (e: any) =>
                    {
                        let cursor = e.target.result;
                        if (cursor)
                        {
                            let key = cursor.key;
                            let rowData = cursor.value;
                            array.push(rowData);
                            cursor.continue();
                        }
                        else
                        {
                            callback(array);
                        }
                    }
                    request.onerror = (e: any) =>
                    {
                        console.log(e.currentTarget.error.toString());
                    }
                }
                else
                {
                    console.log('遍历' + StoreName[storeName] + '错误,因为db = null');
                }
            }
            catch (e)
            {
                console.log(e);
                callback(new Array<Uint8Array>());
            }
        }

        public transaction(storeName: StoreName, mode: TransactionMode): IDBTransaction
        {
            if (mode == TransactionMode.READ_ONLY)
            {
                let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_ONLY);
                transaction = this.db.transaction(StoreName[storeName], 'readonly');
                return transaction;
            }
            else
            {
                let transaction = this.db.transaction(StoreName[storeName], IDBTransaction.READ_WRITE);
                transaction = this.db.transaction(StoreName[storeName], 'readwrite');
                return transaction;
            }
        }

        /**
         * 更新数据库字段, 如果key存在，则更新，否则添加新的字段
         * @param storeName 表名称。
         * @param key 要更新的键。
         * @param object 更新的对象。
         */
        public updateDataByKey(storeName: StoreName, key: string, object: Wallets.DBStore, callback = null)
        {
            if (this.db)
            {
                let transaction = this.transaction(storeName, TransactionMode.READ_WRITE);
                let store = transaction.objectStore(StoreName[storeName]);
                let request = store.get(key);
                request.onsuccess = (e: any) =>
                {
                    let obj = e.target.result;
                    obj = object;
                    request = store.put(obj);
                    request.onsuccess = (e: any) =>
                    {
                        if (storeName == StoreName.Coin)
                            console.log("更新Coin成功");
                        if (callback)
                            callback();
                    };
                    request.onerror = (e: any) =>
                    {
                        console.log(e.currentTarget.error.toString());
                    }
                };
                request.onerror = (e: any) =>
                {
                    console.log(e.currentTarget.error.toString());
                }
            }
            else
            {
                console.log('更新' + StoreName[storeName] + '错误,因为db = null');
            }
        }

    }
}