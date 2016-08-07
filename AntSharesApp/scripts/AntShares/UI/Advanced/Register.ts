namespace AntShares.UI.Advanced {
    export class Register extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#register").click(this.OnRegisterButtonClick);
        }

        protected onload(args: any[]): void {
        }

        private OnRegisterButtonClick = () => {
            console.log(123);

            let assetType = Core.AssetType.Token;
            let assetName = "大魔王麻辣烫优惠券";
            let assetTotalAmount = Fixed8.fromNumber(1000000);
            let issuer = "03768ad696d7fff97ba391817762b02bb24a95f5cc895d4bb753a3fc537c43ff5d";
            let admin = "AbaWnqfyTcCoMpnaYgwjtVTYyKssW8L2ez";

            let tx: Core.RegisterTransaction = new Core.RegisterTransaction();
            tx.assetType = assetType;
            tx.name = assetName;
            tx.amount = assetTotalAmount;
            tx.outputs = new Array<Core.TransactionOutput>(0);
            Wallets.Wallet.toScriptHash(admin).then(result => {
                tx.issuer = Cryptography.ECPoint.decodePoint(issuer.hexToBytes(), Cryptography.ECCurve.secp256r1);
                tx.admin = result;
                let _tx = Global.Wallet.makeTransaction(tx, Fixed8.Zero);
                this.SignAndShowInformation(_tx);
            });
            
        }

        private SignAndShowInformation = (tx: Core.Transaction) => {
            if (tx == null) {
                throw new Error("余额不足");
            }
            let context = Core.SignatureContext.create(tx).then(ct => {
                return Global.Wallet.sign(ct)
            }).then(result => {
                if (!result) throw new Error("无法签名");
                if (!context.isCompleted())
                    throw new Error("当前版本APP不支持多方签名或接收方签名的交易");
                tx.scripts = context.getScripts();
                return Global.Wallet.sendTransaction(tx);
            }).then(result => {
                if (!result) throw new Error("钱包金额已发生变化，交易无法完成");
                return Global.Node.relay(tx);
            }).then(result => {
                TabBase.showTab("#Tab_Asset_Index");
                alert("交易已经发送，等待区块确认");
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}