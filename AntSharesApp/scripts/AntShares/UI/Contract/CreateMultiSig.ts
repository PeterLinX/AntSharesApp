namespace AntShares.UI.Contract
{
    export class CreateMultiSig extends TabBase
    {
        private static publicKeys = new Array<AntShares.Cryptography.ECPoint>();

        protected oncreate(): void
        {
            $(this.target).find("#btn_add_publickey").click(this.OnAddPublicKeyButtonClick);
            $(this.target).find("#create_multisig_contract").click(this.OnCreateButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#contract_multisig_name").focus();
        }

        public static add(publickey: string)
        {
            if (typeof publickey === "string")
            {
                CreateMultiSig.publicKeys.push(AntShares.Cryptography.ECPoint.decodePoint(publickey.hexToBytes(), AntShares.Cryptography.ECCurve.secp256r1));
            }
        }

        private OnCreateButtonClick = () =>
        {
            let _m = $("#input_m").val();
            let m: number = Number(_m.split(",").join(""));

            //TODO:需要添加对输入（公钥）的校验
            let publicItems = $(".publickeyitem");
            for (let i = 0; i < publicItems.length; i++)
            {
                if ($(publicItems[i]).val()!="")
                {
                    CreateMultiSig.add($(publicItems[i]).val());
                }
            }

            let promises = new Array<PromiseLike<Uint160>>();
            for (let i = 0; i < CreateMultiSig.publicKeys.length; i++)
            {
                promises.push(CreateMultiSig.publicKeys[i].encodePoint(true).toScriptHash());
            }
            Promise.all(promises).then(results =>
            {
                for (let i = 0; i < results.length; i++)
                    if (Global.Wallet.containsAccount(results[i]))
                        return results[i];
                throw new Error("无法添加智能合约，因为当前钱包中不包含签署该合约的私钥。");
            }).then(result =>
            {
                return Wallets.Contract.createMultiSigContract(result, m, CreateMultiSig.publicKeys);
            }).then(result =>
            {
                return Global.Wallet.addContract(result);
            }).then(() =>
            {
                alert("智能合约创建成功");
                //创建成功后跳转到合约管理页面
                TabBase.showTab("#Tab_Contract_Index");
            }, reason => alert(reason));
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddPublicKeyButtonClick = () =>
        {
            let parent = $("#div_publickeys");
            let x = Math.round(Math.random() * 10000);
            let divId = "div_publickey" + x.toString();
            let div = $("<div id=\"" + divId + "\"/>");

            let inputElement = $("#div_publickey").clone(true);
            inputElement.find("#delete_publickey").removeAttr("style");
            inputElement.find("#delete").click(() => {
                this.removeInput(parent, divId);
            });

            div.append(inputElement);
            parent.append(div); 
        }

        private clear()
        {
            $("#contract_multisig_name").val("");
        }
    }
}
