namespace AntShares.Implementations.Wallets.IndexedDB
{
    export class DbTransaction
    {
        constructor(private transaction: IDBTransaction) { }

        public commit(): PromiseLike<void>
        {
            return new Promise<void>((resolve, reject) =>
            {
                this.transaction.oncomplete = () => resolve();
                this.transaction.onerror = () => reject(this.transaction.error);
            });
        }

        public store(name: string): IDBObjectStore
        {
            return this.transaction.objectStore(name);
        }
    }
}
