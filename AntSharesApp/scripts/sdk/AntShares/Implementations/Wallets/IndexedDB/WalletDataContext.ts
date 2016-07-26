namespace AntShares.Implementations.Wallets.IndexedDB
{
    export class WalletDataContext extends DbContext
    {
        protected onModelCreating(db: IDBDatabase): void
        {
            let objectStore = db.createObjectStore("Account", { keyPath: "publicKeyHash" });

            objectStore = db.createObjectStore("Contract", { keyPath: "scriptHash" });
            objectStore.createIndex("publicKeyHash", "publicKeyHash", { unique: false });

            objectStore = db.createObjectStore("Key", { keyPath: "name" });

            objectStore = db.createObjectStore("Transaction", { keyPath: "hash" });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("height", "height", { unique: false });

            objectStore = db.createObjectStore("Coin", { keyPath: ["txid", "index"] });
            objectStore.createIndex("assetId", "assetId", { unique: false });
            objectStore.createIndex("scriptHash", "scriptHash", { unique: false });
        }
    }
}
