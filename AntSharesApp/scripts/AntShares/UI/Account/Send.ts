namespace AntShares.UI.Account
{
    export class Send extends TabBase
    {
        protected oncreate(): void
        {
            $("#Tab_Account_Send .btn-success").click(this.OnSendButtonClick);
        }

        private OnSendButtonClick = () =>
        {
            if (formIsValid("form_account_send"))
            {
                let address = $("#Tab_Account_Send .pay_address").val();
                let value = $("#Tab_Account_Send .pay_value").val();
 
                let tx: Core.ContractTransaction;
                let context: Core.SignatureContext;

                if ($("#Tab_Account_Send select>:selected").val() == 0)
                {
                    alert(Resources.global.pleaseChooseAsset);
                    return;
                }
                Promise.resolve(1).then(() =>
                {
                    return Wallets.Wallet.toScriptHash(address);
                }).then((result) =>
                {
                    tx = new Core.ContractTransaction();
                    tx.outputs = [new Core.TransactionOutput()];
                    tx.outputs[0].assetId = Uint256.parse($("#Tab_Account_Send select>:selected").val());
                    tx.outputs[0].scriptHash = result;
                    tx.outputs[0].value = Fixed8.parse(value);
                    if (Global.Wallet.makeTransaction(tx, Fixed8.Zero) == null)
                        throw new Error(Resources.global.insufficientFunds);
                    return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]);
                }, onrejected =>
                    {
                        throw new Error(Resources.global.addressError);
                    }).then(result =>
                    {
                        context = result;
                        return Global.Wallet.sign(context);
                    }).then(result =>
                    {
                        if (!result) throw new Error(Resources.global.canNotSign);
                        if (!context.isCompleted())
                            throw new Error(Resources.global.thisVersion1);
                        tx.scripts = context.getScripts();
                        return Global.Wallet.saveTransaction(tx);
                    }).then(result =>
                    {
                        if (!result) throw new Error(Resources.global.txError1);
                        return Global.Node.relay(tx);
                    }).then(result =>
                    {
                        TabBase.showTab("#Tab_Account_Index");
                        formReset("form_account_send");
                        alert(Resources.global.txId + tx.hash.toString());
                    }).catch(e =>
                    {
                        alert(e.message)
                    });
            }
        }

        protected onload(args: any[]): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(0);
            if (args[0])
            {
                $("#transfer_txout").val(args[0]);
            }
            let assets = linq(Global.Wallet.findUnspentCoins()).groupBy(p => p.assetId, (k, g) =>
            {
                return {
                    assetId: k,
                    amount: Send.sumf(g.select(p => p.value))
                };
            }).toArray();
            Promise.all(linq(assets).select(p => Core.Blockchain.Default.getTransaction(p.assetId)).toArray()).then(results =>
            {
                let select = $("#Tab_Account_Send select");
                select.html("");
                select.append("<option value=0>" + Resources.global.pleaseChoose + "</option>");
                select.change(() =>
                {
                    var amount = $("#transfer_asset").find("option:selected").data("amount");
                    $(".asset-amount").text(amount ? amount : 0);
                });
                for (let i = 0; i < results.length; i++)
                {
                    let asset = <Core.RegisterTransaction>results[i];
                    let option = document.createElement("option");
                    option.text = asset.getName();
                    option.value = asset.hash.toString();
                    option.dataset["amount"] = assets[i].amount.toString();
                    select.append(option);
                }
                select.change();
            });
        }

        private static sumf(values: Linq.Enumerator<Fixed8>): Fixed8
        {
            let sum = Fixed8.Zero;
            while (values.next())
                sum = sum.add(values.value());
            return sum;
        }
    }
}
