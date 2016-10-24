namespace AntShares.UI.Contract
{
    export class CreateMultiSig extends TabBase
    {
        private publicKeys = new Array<AntShares.Cryptography.ECPoint>();

        protected oncreate(): void
        {
            $(this.target).find("#add_public").click(this.OnAddPublicKeyButtonClick);
            $(this.target).find("#create_multisig_contract").click(this.OnCreateButtonClick);
        }

        protected onload(args: any[]): void
        {
        }

        private add(publickey: string)
        {
            if (typeof publickey === "string")
            {
                this.publicKeys.push(AntShares.Cryptography.ECPoint.decodePoint(publickey.hexToBytes(), AntShares.Cryptography.ECCurve.secp256r1));
            }
        }

        private OnCreateButtonClick = () =>
        {
            let _m = $("#input_m").val();
            let m: number = Number(_m.split(",").join(""));
            let promises = new Array<PromiseLike<Uint160>>();
            try {
                let publicItems = $(".publickeyitem");
                for (let i = 0; i < publicItems.length; i++) {
                    if ($(publicItems[i]).val() != "") {
                        this.add($(publicItems[i]).val());
                    }
                }
                for (let i = 0; i < this.publicKeys.length; i++) {
                    promises.push(this.publicKeys[i].encodePoint(true).toScriptHash());
                }
            } catch(e){
                alert(e);
            }

            Promise.all(promises).then(results =>
            {
                for (let i = 0; i < results.length; i++)
                    if (Global.Wallet.containsAccount(results[i]))
                        return results[i];
                throw new Error();
            }).then(result =>
            {
                return Wallets.Contract.createMultiSigContract(result, m, this.publicKeys);
            }).then(result =>
            {
                return Global.Wallet.addContract(result);
            }).then(() =>
            {
                $("#Tab_Contract_CreateMultiSig .add_new").remove();
                $("#Tab_Contract_CreateMultiSig #publickeyitem").val("");
                $("#input_m").val("");
                this.publicKeys.length = 0;

                alert(Resources.global.createMultiContractSuccess);
                //创建成功后跳转到合约管理页面
                TabBase.showTab("#Tab_Contract_Index");
            }, reason => alert(reason)).catch(reason => {
                    alert(reason);
            });
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddPublicKeyButtonClick = () =>
        {
            let parent = $("#Tab_Contract_CreateMultiSig #div_publickeys");

            let inputElement = $("#Tab_Contract_CreateMultiSig #public_tpl").clone(true);
            inputElement.show();
            inputElement.addClass("add_new");
            inputElement.removeAttr("id");

            parent.append(inputElement); 
        }

    }
}
