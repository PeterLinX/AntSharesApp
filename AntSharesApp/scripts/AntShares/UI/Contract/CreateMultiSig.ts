namespace AntShares.UI.Contract
{
    export class CreateMultiSig extends TabBase
    {
        private static publicKeys = new Array<AntShares.Cryptography.ECPoint>();

        protected oncreate(): void
        {
            $(this.target).find("#add_public").click(this.OnAddPublicKeyButtonClick);
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
            let parent = $("#Tab_Contract_CreateMultiSig #div_publickeys");

            let inputElement = $("#Tab_Contract_CreateMultiSig #public_tpl").clone(true);
            inputElement.show();
            inputElement.removeAttr("id");

            parent.append(inputElement); 
        }

        private clear()
        {
            $("#contract_multisig_name").val("");
        }
    }
}
