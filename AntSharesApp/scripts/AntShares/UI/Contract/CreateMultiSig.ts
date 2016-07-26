namespace AntShares.UI.Contract
{
    export class CreateMultiSig extends TabBase
    {
        private static publicKeys = new Array<AntShares.Cryptography.ECPoint>();

        protected oncreate(): void
        {
            $(this.target).find("#btn_add_publickey").click(this.OnAddPublicKeyButtonClick);
            $(this.target).find("#create_contract_multisig_action").click(this.OnCreateButtonClick);
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
            let x = $(".publickeyitem");
            let m: number = x.length;
            for (let i = 0; i < x.length; i++)
            {
                CreateMultiSig.add(x[i].innerHTML);
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

        private OnAddPublicKeyButtonClick = () =>
        {
            //if (inputIsValid("#input_publickey"))

            let publicKeyList = document.getElementById("publicKeyList");

            //TODO:需要添加对此输入（公钥）的校验
            let publicKeyValue = $("#input_publickey").val();

            if (publicKeyValue != null)
            {
                var html = "<div class='row' style= 'padding: 5px 20px; '><div class='col-xs-7'><label class='col-sm-4 control-label publickeyitem'>" + publicKeyValue + "</label>&nbsp;&nbsp;&nbsp;";
                html += "<div class='col-xs-3'><button class='btn circle' type= 'button' style= 'background-color: #e91e63; color: white; font-size: 28px; padding: 0 10px; position: relative; left: 28px; top: -22px;' onclick='deletePublicKey()'>-</button></div><br/>";

                publicKeyList.innerHTML += html;
            }
        }

        private clear()
        {
            $("#contract_multisig_name").val("");
        }
    }
}

function deletePublicKey()
{
    let temp = document.getElementById("publicKeyList").innerHTML;

    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));
    temp = temp.substring(0, temp.lastIndexOf("<"));

    document.getElementById("publicKeyList").innerHTML = temp;
}