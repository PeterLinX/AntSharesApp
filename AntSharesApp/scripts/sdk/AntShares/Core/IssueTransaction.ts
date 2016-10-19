namespace AntShares.Core
{
    export class IssueTransaction extends Transaction
    {
        public get systemFee()
        {
            for (let i = 0; i < this.outputs.length; i++)
                if (!this.outputs[i].assetId.equals(Blockchain.AntShare.hash) && !this.outputs[i].assetId.equals(Blockchain.AntCoin.hash))
                    return Fixed8.fromNumber(500);
            return Fixed8.Zero;
        }

        constructor()
        {
            super(TransactionType.IssueTransaction);
        }

        public getScriptHashesForVerifying(): PromiseLike<Uint160[]>
        {
            let hashes = new Map<string, Uint160>();
            return super.getScriptHashesForVerifying().then(result =>
            {
                for (let i = 0; i < result.length; i++)
                    hashes.set(result[i].toString(), result[i]);
                return this.getReferences();
            }).then(result =>
            {
                if (result == null) throw new Error();
                let assets = new Map<string, { assetId: Uint256, amount: Fixed8 }>();
                for (let i = 0; i < this.outputs.length; i++)
                {
                    let key = this.outputs[i].assetId.toString();
                    if (assets.has(key))
                    {
                        let asset = assets.get(key);
                        asset.amount = asset.amount.add(this.outputs[i].value);
                    }
                    else
                    {
                        assets.set(key, { assetId: this.outputs[i].assetId, amount: this.outputs[i].value });
                    }
                }
                result.forEach(reference =>
                {
                    let key = reference.assetId.toString();
                    if (assets.has(key))
                    {
                        let asset = assets.get(key);
                        if (asset.amount.compareTo(reference.value) > 0)
                            asset.amount = asset.amount.subtract(reference.value);
                        else
                            assets.delete(key);
                    }
                });
                let promises = new Array<PromiseLike<Transaction>>();
                assets.forEach(asset =>
                {
                    promises.push(Blockchain.Default.getTransaction(asset.assetId));
                });
                return Promise.all(promises);
            }).then(results =>
            {
                for (let i = 0; i < results.length; i++)
                {
                    let tx = <RegisterTransaction>results[i];
                    if (tx == null) throw new Error();
                    hashes.set(tx.admin.toString(), tx.admin);
                }
                let array = new Array<Uint160>();
                hashes.forEach(hash =>
                {
                    array.push(hash);
                });
                return array.sort((a, b) => a.compareTo(b));
            });
        }
    }
}
