namespace AntShares.UI.Advanced {
    export class Register extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#register").click(this.OnRegisterButtonClick);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }

            $("#select_register_asset").append("<option value=1>" + Core.AssetType[Core.AssetType.Share] +"</option>"); 
            $("#select_register_asset").append("<option value=2>" + Core.AssetType[Core.AssetType.Token] + "</option>");
            $("#select_register_asset").change(this.OnRegisterAssetChanged);
            $("#check_limit").change(this.OnCheckLimitChanged);
            $("#select_register_asset").find("option[value=1]").prop('selected', true);
            $("#input_asset_name").prop('disabled', true);
            $("#check_limit").prop('checked', true);
            $("#check_limit").prop('disabled', true);

            let issuerArray = linq(Global.Wallet.getAccounts()).select(p => p.publicKey).toArray();
            Promise.all(linq(Global.Wallet.getContracts()).select(p => p.getAddress()).toArray()).then(adminArray => {
                for (let i = 0; i < issuerArray.length; i++) {
                    $("#select_issuer").append("<option value=" + i + ">" + issuerArray[i] + "</option>");
                }
                for (let i = 0; i < adminArray.length; i++) {
                    $("#select_admin").append("<option value=" + i + ">" + adminArray[i] + "</option>");
                }
            });
        }

        private OnCheckLimitChanged = () => {
            if ($("#check_limit").prop('checked') == true) {
                $("#input_amount").prop('disabled', false);
            } else {
                $("#input_amount").prop('disabled', true);
            }
        }

        private OnRegisterAssetChanged = () => {
            let assetType = $("#select_register_asset").val();
            if (assetType == 1) {
                //Share
                $("#input_asset_name").prop('disabled', true);
                $("#check_limit").prop('checked', true);
                $("#check_limit").prop('disabled', true);
            } else {
                //Token
                $("#input_asset_name").prop('disabled', false);
                $("#check_limit").prop('checked', true);
                $("#check_limit").prop('disabled', false);
            }
        }

        private OnRegisterButtonClick = () => {
            let _assetTotalAmount = $("#input_amount").val();
            let assetTotalAmount: number = Number(_assetTotalAmount.split(",").join(""));
            let _assetName = $("#input_asset_name").val();
            let assetName = "[{ 'lang': 'zh-CN', 'name': '" + _assetName + "' }]";
            let assetType = $("#select_register_asset").find("option:selected").text();
            let issuer = $("#select_issuer").find("option:selected").text();
            let admin = $("#select_admin").find("option:selected").text();

            let tx: Core.RegisterTransaction = new Core.RegisterTransaction();
            tx.assetType = Core.AssetType[assetType];
            if (Core.AssetType[assetType] == Core.AssetType.Share) assetName = "";
            tx.name = assetName;
            tx.amount = Fixed8.fromNumber(assetTotalAmount);
            tx.outputs = new Array<Core.TransactionOutput>(0);
            Wallets.Wallet.toScriptHash(admin).then(result => {
                tx.issuer = Cryptography.ECPoint.decodePoint(issuer.hexToBytes(), Cryptography.ECCurve.secp256r1);
                tx.admin = result;
                let _tx = Global.Wallet.makeTransaction(tx, Fixed8.Zero);
                return this.SignAndShowInformation(_tx);
            }).catch(reason => {
                alert(reason);
            });
        }

        private SignAndShowInformation = (tx: Core.Transaction) => {
            let context: Core.SignatureContext;
            if (tx == null) {
                throw new Error("余额不足");
            }
            return Core.SignatureContext.create(tx).then(ct => {
                context = ct;
                return Global.Wallet.sign(ct);
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
                alert("注册资产交易已经发送，等待区块确认");
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}