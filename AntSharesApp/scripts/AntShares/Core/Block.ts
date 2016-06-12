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

    }  
}

