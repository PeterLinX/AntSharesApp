/// <reference path="../../sdk/AntShares/Implementations/Wallets/IndexedDB/DbContext.ts"/>
namespace AntShares.Wallets
{
    export class Master extends Implementations.Wallets.IndexedDB.DbContext
    {
        private static singleton: Master;

        constructor()
        {
            super("master");
        }

        public add(name: string): PromiseLike<void>
        {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Wallet", "readwrite").store("Wallet").put({ name: name }));
        }

        public clear(): PromiseLike<void>
        {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Wallet", "readwrite").store("Wallet").clear());
        }

        public delete(name: string): PromiseLike<void>
        {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Wallet", "readwrite").store("Wallet").delete(name));
        }

        public get(): PromiseLike<string[]>
        {
            let array = new Array<string>();
            let transaction = this.transaction("Wallet", "readwrite");
            transaction.store("Wallet").openCursor().onsuccess = e =>
            {
                let cursor = <IDBCursor>(<IDBRequest>e.target).result;
                if (cursor)
                {
                    array.push(cursor.key as any);
                    cursor.continue();
                }
            };
            return transaction.commit().then(() =>
            {
                return array;
            });
        }

        public static instance(): PromiseLike<Master>
        {
            if (Master.singleton == null)
            {
                Master.singleton = new Master();
                return Master.singleton.open().then(() =>
                {
                    return Master.singleton;
                });
            }
            else
            {
                return Promise.resolve(Master.singleton);
            }
        }

        protected onModelCreating(db: IDBDatabase): void
        {
            db.createObjectStore("Wallet", { keyPath: "name" });
        }
    }
}
