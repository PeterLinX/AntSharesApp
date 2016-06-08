namespace AntShares.Wallets
{

    export class Master
    {
        private static SingletonMaster: Master;
        public db: IDBDatabase;
        public dbName = "master";
        private ObjectStore = "Wallet";
        private version = 2;
        constructor()
        {
        }

        /**
        * Master的单例静态方法
        */
        public static GetInstance(): Master
        {
            if (this.SingletonMaster == null)
            {
                this.SingletonMaster = new Master();
                return this.SingletonMaster;
            }
            else
            {
                return this.SingletonMaster;
            }
        }

        public OpenDB = (callback) =>
        {
            if (!window.indexedDB)
            {
                alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
                return;
            }
            try
            {
                let request = window.indexedDB.open(this.dbName, this.version);

                request.onsuccess = (e: any) =>
                {
                    this.db = e.target.result;
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
                    this.db = e.target.result;
                    if (!this.db.objectStoreNames.contains(this.ObjectStore))
                    {
                        let objectStore = this.db.createObjectStore(this.ObjectStore, { keyPath: "Name" });
                    }
                    console.log('IDB master version changed to ' + this.version);
                };
            }
            catch (e)
            {
                console.log("打开IDB master异常： " + e);
            }
        }
        /**
         * 向master数据库中添加钱包名称
         * @param name 要添加的钱包名称。
         */
        public AddWalletName(name: WalletStore)
        {
            try
            {
                if (this.db)
                {
                    let transaction = this.db.transaction(this.ObjectStore, IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction(this.ObjectStore, 'readwrite');
                    let store = transaction.objectStore(this.ObjectStore);
                    let request = store.add(name);
                    request.onsuccess = (e: any) =>
                    {
                        console.log('add wallet name ' + name.Name + ' to master success');
                    };
                    request.onerror = (e: any) =>
                    {
                        console.log(e.currentTarget.error.toString());
                    };
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
        /**
         * 删除钱包名称
         * @param callback 遍历完毕时执行的方法，参数是遍历的结果数组型。
         */
        public DeleteWalletName(key: string)
        {
            let transaction = this.db.transaction(this.ObjectStore, IDBTransaction.READ_WRITE);
            transaction = this.db.transaction(this.ObjectStore, 'readwrite');
            let store = transaction.objectStore(this.ObjectStore);
            store.delete(key);
        }
        /**
         * 遍历master数据库Wallet表中的钱包名称
         * @param callback 遍历完毕时执行的方法，参数是遍历的结果数组型。
         */
        public GetWalletNameList(callback: (result: Array<any>) => any)
        {
            try
            {
                if (this.db)
                {
                    let array = new Array<Uint8Array>();
                    let transaction = this.db.transaction(this.ObjectStore, IDBTransaction.READ_WRITE);
                    transaction = this.db.transaction(this.ObjectStore, 'readwrite');
                    let objectStore = transaction.objectStore(this.ObjectStore);
                    let request = objectStore.openCursor();
                    request.onsuccess = (e: any) =>
                    {
                        let cursor = e.target.result;
                        if (cursor)
                        {
                            let key = cursor.key;
                            let rowData = cursor.value;
                            array.push(rowData.Name);
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
                    console.log('db = null');
                }
            }
            catch (e)
            {
                console.log(e);
            }
        }
    }
}