namespace AntShares.Core
{
    export class BlockJson
    {
        private hash: string;
        private version: number;
        private previousblockhash: string;
        private merkleroot: string;
        private time: number;
        private height: number;
        private nonce: number;
        private nextminer: string;
        private script: ScriptJson;
        public tx: TransactionJson[];

        public deserialize(): Block
        {
            let r = new Block();
            r.version = this.version;
            r.hash = this.hash.hexToBytes().reverse();
            r.prevBlock = this.previousblockhash.hexToBytes().reverse();
            r.merkleroot = this.merkleroot.hexToBytes().reverse();
            r.time = this.time;
            r.height = this.height;
            r.nonce = this.nonce;
            r.nextminer = this.nextminer.hexToBytes().reverse();
            r.script = this.script.deserialize();
            r.transactions = new Array<Transaction>();
            for (let tx of this.tx)
            {
                r.transactions.push(tx.deserialize());
            }
            return r;
        }
    }
}