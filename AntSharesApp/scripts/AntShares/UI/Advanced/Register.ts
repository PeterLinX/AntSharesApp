namespace AntShares.UI.Advanced {
    export class Register extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#register").click(this.OnRegisterButtonClick);
            $("#select_register_asset").append("<option value=0>请选择</option>");
            $("#select_register_asset").append("<option value=1>" + Core.AssetType[Core.AssetType.Share] + "</option>");
            $("#select_register_asset").append("<option value=2>" + Core.AssetType[Core.AssetType.Token] + "</option>");
            $("#select_register_asset").change(this.OnRegisterAssetChanged);
            $("#check_limit").change(this.OnCheckLimitChanged);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#Tab_Advanced_Register #select_issuer").empty();
            $("#Tab_Advanced_Register #select_admin").empty();
            $("#Tab_Advanced_Register #input_amount").val("");
            $("#Tab_Advanced_Register #input_asset_name").val("");

            let issuerArray = linq(Global.Wallet.getAccounts()).select(p => p.publicKey).toArray();
            Promise.all(linq(Global.Wallet.getContracts()).select(p => p.getAddress()).toArray()).then(adminArray => {
                for (let i = 0; i < issuerArray.length; i++) {
                    $("#Tab_Advanced_Register #select_issuer").append("<option value=" + i + ">" + issuerArray[i] + "</option>");
                }
                for (let i = 0; i < adminArray.length; i++) {
                    $("#Tab_Advanced_Register #select_admin").append("<option value=" + i + ">" + adminArray[i] + "</option>");
                }
            });
        }

        private OnCheckLimitChanged = () => {
            if ($("#Tab_Advanced_Register #check_limit").prop('checked') == true) {
                $("#Tab_Advanced_Register #input_amount").prop('disabled', false);
            } else {
                $("#Tab_Advanced_Register #input_amount").prop('disabled', true);
            }
        }

        private OnRegisterAssetChanged = () => {
            let assetType = $("#Tab_Advanced_Register #select_register_asset").val();
            if (assetType == 1) {
                //Share
                $("#Tab_Advanced_Register #input_asset_name").prop('disabled', true);
                $("#Tab_Advanced_Register #check_limit").prop('checked', true);
                $("#Tab_Advanced_Register #check_limit").prop('disabled', true);
                $("#Tab_Advanced_Register #input_amount").prop('disabled', false);
            } else {
                //Token
                $("#Tab_Advanced_Register #input_asset_name").prop('disabled', false);
                $("#Tab_Advanced_Register #check_limit").prop('checked', true);
                $("#Tab_Advanced_Register #check_limit").prop('disabled', false);
            }
        }

        private OnRegisterButtonClick = () => {
            let _assetTotalAmount = $("#Tab_Advanced_Register #input_amount").val();
            let assetTotalAmount: number = Number(_assetTotalAmount.split(",").join(""));
            let _assetName = $("#Tab_Advanced_Register #input_asset_name").val();
            let assetName = '[{ "lang": "zh-CN", "name": " ' + _assetName + ' "}]';
            let assetType = $("#Tab_Advanced_Register #select_register_asset").find("option:selected").text();
            let issuer = $("#Tab_Advanced_Register #select_issuer").find("option:selected").text();
            let admin = $("#Tab_Advanced_Register #select_admin").find("option:selected").text();

            try
            {
                let tx: Core.RegisterTransaction = new Core.RegisterTransaction();
                
                tx.assetType = Core.AssetType[assetType];
                if (tx.assetType == null)
                {
                    throw Error("请选择资产类型");
                }
                if (Core.AssetType[assetType] == Core.AssetType.Share) assetName = "";
                tx.name = assetName;
                tx.amount = $("#Tab_Advanced_Register #check_limit").prop('checked') == true ? Fixed8.fromNumber(assetTotalAmount) : Fixed8.MaxValue;
                tx.outputs = new Array<Core.TransactionOutput>(0);
                Wallets.Wallet.toScriptHash(admin).then(result => {
                    tx.issuer = Cryptography.ECPoint.decodePoint(issuer.hexToBytes(), Cryptography.ECCurve.secp256r1);
                    tx.admin = result;
                    let _tx = Global.Wallet.makeTransaction(tx, Fixed8.Zero);
                    return this.SignAndShowInformation(_tx);
                }).catch(reason => {
                    alert(reason);
                });
            } catch (e) {
                alert(e);
            }
            
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
                alert("注册资产交易已经发送，等待区块确认，txid:"+tx.hash.toString());
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}