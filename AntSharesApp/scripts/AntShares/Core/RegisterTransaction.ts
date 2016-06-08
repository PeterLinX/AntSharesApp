/// <reference path="Transaction.ts"/>

namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        /*资产类型*/
        public assetType: AssetType;

        /*资产名称*/
        public name: string;

        /**
         * 发行总量，共有2种模式：
         * 1. 限量模式：当Amount为正数时，表示当前资产的最大总量为Amount，且不可修改（股权在未来可能会支持扩股或增发，会考虑需要公司签名或一定比例的股东签名认可）。
         * 2. 不限量模式：当Amount等于-satoshi时，表示当前资产可以由创建者无限量发行。这种模式的自由度最大，但是公信力最低，不建议使用。
         * 在使用过程中，根据资产类型的不同，能够使用的总量模式也不同，具体规则如下：
         * 1. 对于股权，只能使用限量模式；
         * 2. 对于货币，只能使用不限量模式；
         * 3. 对于点券，可以使用任意模式；
         */
        public amount: Fixed8;

        /*发行者的公钥 PublicKeyPoint*/
        public issuer: Cryptography.ECPoint;

        /*管理员的地址 合约中的ScriptHash，160位的byte数组 */
        public admin: Uint8Array;

        public systemFee = this.assetType == AssetType.AntShare || this.assetType == AssetType.AntCoin ? Fixed8.zero : Fixed8.fromString("10000");

        constructor()
        {
            super(TransactionType.RegisterTransaction);
        }

        public serializeExclusiveData(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array([this.type]));
            let name = this.name;
            array.push(name.serialize()); 
            array.push(this.amount.serialize());
            array.push(this.issuer.serialize());
            array.push(this.admin);
            return ToUint8Array(array);
        }
    }
}