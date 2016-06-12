namespace AntShares.Core
{
    export class ScriptJson
    {
        stack: string;
        redeem: string;

        public deserialize(): Script
        {
            let r = new Script();
            r.stackScript = this.stack.hexToBytes();
            r.redeemScript = this.redeem.hexToBytes();
            return r;
        }
    }
}