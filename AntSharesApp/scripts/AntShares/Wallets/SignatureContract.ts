namespace AntShares.Wallets
{
    export class SignatureContract extends Wallets.Contract
    {
        public RedeemScript: Uint8Array;

        constructor(public PublicKeyHash: Uint8Array, private publicKey: Cryptography.ECPoint)
        {
            super();
            this.Type = "SignatureContract";
            this.RedeemScript = this.CreateSignatureRedeemScript(publicKey);
        }

        public CreateSignatureRedeemScript(publicKey: Cryptography.ECPoint): Uint8Array
        {
            let sb = new Core.Scripts.ScriptBuilder();
            sb.push(publicKey.encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }

        public IsCompleted(publicKeys: Array<Cryptography.ECPoint>): boolean
        {
            for (let i of publicKeys)
            {
                if (i === this.publicKey)
                {
                    return true;
                }
            }
            return false;
        }
    }
}