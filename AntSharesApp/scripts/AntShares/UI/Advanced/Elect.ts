namespace AntShares.UI.Advanced
{
    export class Elect extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#elect").click(this.OnElectButtonClick);
        }

        protected onload(args: any[]): void
        {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }

            $("#Tab_Advanced_Elect #select_validator").empty();

            let validatorArray = linq(Global.Wallet.getAccounts()).select(p => p.publicKey).toArray();
            for (let i = 0; i < validatorArray.length; i++) {
                $("#Tab_Advanced_Elect #select_validator").append("<option value=" + i + ">" + validatorArray[i] + "</option>");
            }
        }
        
        private OnElectButtonClick = () =>
        {
            let value: string = $("#Tab_Advanced_Elect #input_antcoin").val();
            let validator: string = $("#Tab_Advanced_Elect #select_validator").find("option:selected").text();
            try
            {
                let publicKey: Cryptography.ECPoint = Cryptography.ECPoint.decodePoint(validator.hexToBytes(), Cryptography.ECCurve.secp256r1);
                let scriptHash: Uint160 = new Uint160(Wallets.Contract.createSignatureRedeemScript(publicKey));

                let tx: Core.EnrollmentTransaction = new Core.EnrollmentTransaction();
                tx.publicKey = publicKey;
                tx.outputs = [new Core.TransactionOutput()];
                tx.outputs[0].assetId = Core.Blockchain.AntCoin.hash;
                tx.outputs[0].value = Fixed8.parse(value);
                tx.outputs[0].scriptHash = scriptHash;
                
                let _tx = Global.Wallet.makeTransaction(tx, Fixed8.Zero);
                return this.SignAndShowInformation(_tx);

            } catch (e) {
                if (e instanceof SyntaxError) {
                    alert(Resources.globel.dataFormatError);
                }
                else {
                    alert(e);
                }
            }
        }

        private SignAndShowInformation = (tx: Core.Transaction) => {
            let context: Core.SignatureContext;
            if (tx == null)
            {
                throw new Error(Resources.globel.insufficientFunds);
            }
            return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]).then(ct =>
            {
                context = ct;
                return Global.Wallet.sign(ct);
            }).then(result =>
            {
                if (!result) throw new Error(Resources.globel.canNotSign);
                if (!context.isCompleted())
                    throw new Error(Resources.globel.thisVersion1);
                tx.scripts = context.getScripts();
                return Global.Wallet.saveTransaction(tx);
                }).then(result =>
                {
                    if (!result) throw new Error(Resources.globel.txError1);
                return Global.Node.relay(tx);
            }).then(result => {
                TabBase.showTab("#Tab_Asset_Index");
                alert(Resources.globel.electionInfo);
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}
