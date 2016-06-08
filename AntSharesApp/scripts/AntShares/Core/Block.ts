/// <reference path="Transaction.ts"/>

namespace AntShares.Core
{
    export class Block
    {
        public version: number;
        public hash: Uint8Array; //UInt256
        
        public prevBlock: Uint8Array; //UInt256
        public merkleroot: Uint8Array; //UInt256
        public time: number;
        public height: number;
        public nonce: number;
        public nextminer: Uint8Array; //UInt160
        public script: Script;
        public transactions: Array<Transaction>;

        public static deserialize(json: BlockJson): Block
        {
            let r = new Block();
            r.version = json.version;
            r.hash = json.hash.hexToBytes().reverse();
            r.prevBlock = json.previousblockhash.hexToBytes().reverse();
            r.merkleroot = json.merkleroot.hexToBytes().reverse();
            r.time = json.time;
            r.height = json.height;
            r.nonce = json.nonce;
            r.nextminer = json.nextminer.hexToBytes().reverse();
            r.script = Script.deserialize(json.script);
            r.transactions = new Array<Transaction>();
            for (let i of json.tx)
            {
                r.transactions.push();//TODO:Transaction序列化
            }
            return r;
        }
    }

    class BlockJson
    {
        hash: string;
        version: number;
        previousblockhash: string;
        merkleroot: string;
        time: number;
        height: number;
        nonce: number;
        nextminer: string;
        script: ScriptJson;
        tx: string;
    }
}

