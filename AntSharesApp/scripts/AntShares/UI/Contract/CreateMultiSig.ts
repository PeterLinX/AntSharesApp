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
            let m:number = x.length;
            for (let i = 0; i < x.length; i++)
            {
                CreateMultiSig.add(x[i].innerHTML);
            }

            let wallet = GlobalWallet.getCurrentWallet();
            let contract: AntShares.Wallets.MultiSigContract = this.getContract(wallet, 0, m, (contract: AntShares.Wallets.MultiSigContract) =>
            {
                if (contract == null)
                {
                    alert("无法添加智能合约，因为当前钱包中不包含签署该合约的私钥。");
                    return;
                }
                ToScriptHash(contract.RedeemScript, (pScriptHash: Uint8Array) =>
                {
                    let contractStore = new Wallets.ContractStore(pScriptHash, contract, contract.PublicKeyHash, contract.Type);
                    wallet.addContract(contractStore);
                    wallet.loadSomething(() =>
                    {
                        alert("智能合约创建成功");
                        //创建成功后跳转到合约管理页面
                        TabBase.showTab("#Tab_Contract_Index");
                    });
                })
            });
        }

        private getContract(wallet: AntShares.Wallets.Wallet, i: number, m: number, callback): AntShares.Wallets.MultiSigContract
        {
            if (i >= CreateMultiSig.publicKeys.length)
            {
                callback();
                return;
            }
            ToScriptHash(CreateMultiSig.publicKeys[i].encodePoint(true),
                (publicKeyHash: Uint8Array) =>
                {
                    for (let account of wallet.accounts)
                    {
                        if (publicKeyHash.toString() == account.PublicKeyHash.toString())
                        {
                            return callback(AntShares.Wallets.MultiSigContract.Create(account.PublicKeyHash, m, CreateMultiSig.publicKeys));
                        }
                    }
                    this.getContract(wallet, ++i, m, callback);
                });
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