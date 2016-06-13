namespace AntShares.Core
{
    export abstract class Transaction implements Signable, Serializable
    {
        public transactionId: string;
        public transactionType: TransactionType;
        public transactionAttribute: Array<TransactionAttribute>;
        public transactionInput: Array<TransactionInput>;
        public transactionOutput: Array<TransactionOutput>;
        public scripts: Array<Script>;

        public systemFee = Fixed8.zero;

        public constructor(type: TransactionType)
        {
            this.transactionType = type;
        }

        public sign(account: Wallets.AccountItem, callback: (signed: Uint8Array) => any)
        {
            let key = new Cryptography.ECDsaCryptoKey(account.PublicKeyPoint);
            let ecdsa = new Cryptography.ECDsa(key);
            //可签名对象序列化后的Hash
            window.crypto.subtle.digest(
                {
                    name: "SHA-256",
                },
                this.serialize()
            )
                .then(hash =>
                {
                    let signed = ecdsa.sign(hash);
                    if (callback)
                        callback(signed as Uint8Array);
                })
        }

        public serialize(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array[this.transactionType]);
            array.push(this.serializeExclusiveData());
            for (let i of this.transactionAttribute)
            {
                array.push(i.serialize());
            }
            for (let i of this.transactionInput)
            {
                array.push(i.serialize());
            }
            return ToUint8Array(array);
        }

        abstract serializeExclusiveData(): Uint8Array
    }
}

