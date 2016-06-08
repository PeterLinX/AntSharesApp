namespace AntShares.Core
{
    export class Script
    {
        public stackScript: Uint8Array;
        public redeemScript: Uint8Array;

        public static deserialize(json: ScriptJson): Script
        {
            let r = new Script();
            r.stackScript = json.stack.hexToBytes();
            r.redeemScript = json.redeem.hexToBytes();
            return r;
        }
    }

    export class ScriptJson
    {
        stack: string;
        redeem: string;
    }
}