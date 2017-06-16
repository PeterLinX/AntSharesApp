/// <reference path="../../../sdk/AntShares/Implementations/Wallets/IndexedDB/DbContext.ts"/>
namespace AntShares.UI.Contacts {
    export class Contact extends Implementations.Wallets.IndexedDB.DbContext {
        private static singleton: Contact;

        constructor() {
            super("contacts");
        }

        public add(name: string, address: string): PromiseLike<void> {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Contacts", "readwrite").store("Contacts").put({ name: name, address: address }));
        }

        public clear(): PromiseLike<void> {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Contacts", "readwrite").store("Contacts").clear());
        }

        public delete(name: string): PromiseLike<void> {
            return Implementations.Wallets.IndexedDB.DbContext.promise(this.transaction("Contacts", "readwrite").store("Contacts").delete(name));
        }

        public get(): PromiseLike<string[]> {
            let array = new Array<string>();
            let transaction = this.transaction("Contacts", "readwrite");
            transaction.store("Contacts").openCursor().onsuccess = e => {
                let cursor = <IDBCursor>(<IDBRequest>e.target).result;
                if (cursor) {
                    array.push(cursor.key as any);
                    cursor.continue();
                }
            };
            return transaction.commit().then(() => {
                return array;
            });
        }

        public getContacts(): PromiseLike<any[]> {
            let array = new Array<any>();
            let transaction = this.transaction("Contacts", "readwrite");
            transaction.store("Contacts").openCursor().onsuccess = e => {
                let cursor = <IDBCursorWithValue>(<IDBRequest>e.target).result;
                if (cursor) {
                    array.push(cursor.value);
                    cursor.continue();
                }
            };
            return transaction.commit().then(() => {
                return array;
            });
        }

        public static instance(): PromiseLike<Contact> {
            if (Contact.singleton == null) {
                Contact.singleton = new Contact();
                return Contact.singleton.open().then(() => {
                    return Contact.singleton;
                });
            }
            else {
                return Promise.resolve(Contact.singleton);
            }
        }

        protected onModelCreating(db: IDBDatabase): void {
            db.createObjectStore("Contacts", { keyPath: "name" });
        }
    }
}
