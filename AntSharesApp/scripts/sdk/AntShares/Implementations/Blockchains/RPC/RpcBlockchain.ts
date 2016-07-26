/// <reference path="../../../Core/Blockchain.ts"/>

namespace AntShares.Implementations.Blockchains.RPC
{
    export class RpcBlockchain extends Core.Blockchain
    {
        private map_block_index = new Map<number, Core.Block>();
        private map_block_hash = new Map<string, Core.Block>();
        private map_tx_hash = new Map<string, Core.Transaction>();

        constructor(private rpc: Network.RPC.RpcClient)
        {
            super();
        }

        public getBestBlockHash(): PromiseLike<Uint256>
        {
            return this.rpc.call("getbestblockhash", []).then(result =>
            {
                return new Uint256(result.hexToBytes().buffer);
            });
        }

        public getBlock(hash: Uint256): PromiseLike<Core.Block>;
        public getBlock(index: number): PromiseLike<Core.Block>;
        public getBlock(hashOrIndex: Uint256 | number): PromiseLike<Core.Block>
        {
            let key = typeof hashOrIndex === "number" ? hashOrIndex : hashOrIndex.toString();
            let map: Map<string | number, Core.Block> = typeof hashOrIndex === "number" ? this.map_block_index : this.map_block_hash;
            if (map.has(key)) return Promise.resolve(map.get(key));
            return this.rpc.call("getblock", [key, false]).then(result =>
            {
                if (map.has(key)) return map.get(key);
                let block = <Core.Block>result.hexToBytes().asSerializable(Core.Block);
                return block.ensureHash().then(result =>
                {
                    if (map.has(key)) return map.get(key);
                    this.map_block_index.set(block.height, block);
                    this.map_block_hash.set(block.hash.toString(), block);
                    return block;
                });
            });
        }

        public getBlockCount(): PromiseLike<number>
        {
            return this.rpc.call("getblockcount", []);
        }

        public getBlockHash(index: number): PromiseLike<Uint256>
        {
            if (this.map_block_index.has(index))
                return Promise.resolve(this.map_block_index.get(index).hash);
            return this.rpc.call("getblockhash", [index]).then(result =>
            {
                return new Uint256(result.hexToBytes().buffer);
            });
        }

        public getTransaction(hash: Uint256): PromiseLike<Core.Transaction>
        {
            let key = hash.toString();
            if (this.map_tx_hash.has(key)) return Promise.resolve(this.map_tx_hash.get(key));
            return this.rpc.call("getrawtransaction", [key, false]).then(result =>
            {
                if (this.map_tx_hash.has(key)) return this.map_tx_hash.get(key);
                let tx = Core.Transaction.deserializeFrom(result.hexToBytes().buffer);
                return tx.ensureHash().then(result =>
                {
                    if (this.map_tx_hash.has(key)) return this.map_tx_hash.get(key);
                    this.map_tx_hash.set(key, tx);
                    return tx;
                });
            });
        }
    }
}
