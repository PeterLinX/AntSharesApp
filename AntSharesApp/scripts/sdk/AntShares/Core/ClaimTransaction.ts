namespace AntShares.Core
{
    export class ClaimTransaction extends Transaction
    {
        public claims: TransactionInput[];

        constructor()
        {
            super(TransactionType.ClaimTransaction);
        }

        protected deserializeExclusiveData(reader: IO.BinaryReader): void
        {
            this.claims = <TransactionInput[]>reader.readSerializableArray(TransactionInput);
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            let hashes = new Map<string, Uint160>();
            return super.getScriptHashesForVerifying().then(result =>
            {
                for (let i = 0; i < result.length; i++)
                    hashes.set(result[i].toString(), result[i]);
                let promises = new Array<PromiseLike<Transaction>>();
                for (let i = 0; i < this.claims.length; i++)
                    promises.push(Blockchain.Default.getTransaction(this.claims[i].prevHash));
                return Promise.all(promises);
            }).then(results =>
            {
                for (let i = 0; i < this.claims.length; i++)
                {
                    if (results[i] == null) throw new Error();
                    if (results[i].outputs.length <= this.claims[i].prevIndex) throw new Error();
                    hashes.set(results[i].outputs[this.claims[i].prevIndex].scriptHash.toString(), results[i].outputs[this.claims[i].prevIndex].scriptHash);
                }
                let array = new Array<Uint160>();
                hashes.forEach(hash =>
                {
                    array.push(hash);
                });
                return array.sort((a, b) => a.compareTo(b));
            });
        }

        protected serializeExclusiveData(writer: IO.BinaryWriter): void
        {
            writer.writeSerializableArray(this.claims);
        }
    }
}
