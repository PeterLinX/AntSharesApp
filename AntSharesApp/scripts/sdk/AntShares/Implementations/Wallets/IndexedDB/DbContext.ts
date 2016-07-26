namespace AntShares.Implementations.Wallets.IndexedDB
{
    export abstract class DbContext
    {
        private db: IDBDatabase;

        constructor(private name: string) { }

        public static delete(name: string): PromiseLike<void>
        {
            let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            let request = indexedDB.deleteDatabase(name);
            return new Promise<void>((resolve, reject) =>
            {
                request.onsuccess = () =>
                {
                    resolve();
                };
                request.onerror = () =>
                {
                    reject(request.error);
                };
            });
        }

        protected onModelCreating(db: IDBDatabase): void { }

        public open(version = 1): PromiseLike<void>
        {
            if (this.db != null) return Promise.resolve();
            let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            let request = indexedDB.open(this.name, version);
            return new Promise<void>((resolve, reject) =>
            {
                request.onsuccess = () =>
                {
                    this.db = request.result;
                    resolve();
                };
                request.onupgradeneeded = () =>
                {
                    this.onModelCreating(request.result);
                };
                request.onerror = () =>
                {
                    reject(request.error);
                };
            });
        }

        public static promise(request: IDBRequest): PromiseLike<void>
        public static promise<T>(request: IDBRequest): PromiseLike<T>
        public static promise<T>(request: IDBRequest): PromiseLike<T>
        {
            return new Promise((resolve, reject) =>
            {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        public transaction(storeNames: string | string[], mode = "readonly"): DbTransaction
        {
            return new DbTransaction(this.db.transaction(storeNames, mode));
        }
    }
}
