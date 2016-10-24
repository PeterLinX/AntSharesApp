namespace AntShares.UI.Advanced {
    export class Issue extends TabBase {

        private rtx = new Core.RegisterTransaction();

        protected oncreate(): void {
            $(this.target).find("#add_input").click(this.OnAddInputClick);
            $(this.target).find("#issue").click(this.OnIssueButtonClick);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }

            $("#Tab_Advanced_Issue .issue_info").hide();
            $("#Tab_Advanced_Issue #select_issue_assets").empty();
            $("#Tab_Advanced_Issue #select_issue_assets").change(this.OnIssueAssetChanged);

            Global.Wallet.getTransactions(Core.TransactionType.RegisterTransaction).then(issueAssets => {
                $("#Tab_Advanced_Issue #select_issue_assets").append("<option value=0>请选择</option>");
                for (let i = 0; i < issueAssets.length; i++) {
                    let tx = <Core.RegisterTransaction>issueAssets[i];
                    $("#Tab_Advanced_Issue #select_issue_assets").append("<option value=" + (i + 1) + ">" + tx.getName() + "</option>");
                }
            });
        }


        private OnIssueAssetChanged = () => {
            let assetName = $("#Tab_Advanced_Issue #select_issue_assets").find("option[value=0]").text();
            Global.Wallet.getTransactions(Core.TransactionType.RegisterTransaction).then(issueAssets => {
                let assetName = $("#Tab_Advanced_Issue #select_issue_assets").find("option:selected").text();
                for (let i = 0; i < issueAssets.length; i++) {
                    let tx = <Core.RegisterTransaction>issueAssets[i];
                    if (assetName == tx.getName()) {
                        this.rtx = tx;
                        $("#Tab_Advanced_Issue .issue_info").show();
                        let parent = $("#Tab_Advanced_Issue #issue_infos");
                        parent.empty();
                        let div = new Array();
                        div.push($("<div>" + Resources.global.publisher + "：" + tx.issuer + "</div>"));
                        div.push($("<div>" + Resources.global.admin + "：" + tx.admin + "</div>"));
                        let tAmount: string = tx.amount.equals(Fixed8.MaxValue) ? "∞" : tx.amount.toString();
                        div.push($("<div>" + Resources.global.amount + "：" + tAmount + "</div>"));
                        //div.push($("<div>已发行：" + Core.Blockchain + "</div>"));
                        div.forEach(() => { parent.append(div) });
                    }
                }
            });
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddInputClick() {
            let parent = $("#Tab_Advanced_Issue #issue_outputs");

            let inputElement = $("#Tab_Advanced_Issue #issue_tpl").clone(true);
            inputElement.show();
            inputElement.removeAttr("id");

            parent.append(inputElement);
        }

        private OnIssueButtonClick = () => {
            let itx: Core.IssueTransaction = new Core.IssueTransaction();

            //TODO:需要对地址校验
            let outputs = new Array<Core.TransactionOutput>();
            let promises = new Array<PromiseLike<{ address: Uint160, value: Fixed8, assetid: Uint256 }>>();
            let issueOutputs = $("#Tab_Advanced_Issue .issue_output");
            for (let i = 0; i < issueOutputs.length; i = i + 2) {
                if ($(issueOutputs[i]).val() == "" || $(issueOutputs[i + 1]).val() == "") {
                    continue;
                } else {
                    promises.push(Wallets.Wallet.toScriptHash($(issueOutputs[i]).val()).then(result => {
                        return { address: result, value: Fixed8.fromNumber($(issueOutputs[i + 1]).val()), assetid: this.rtx.hash };
                    }));
                }
            }
            Promise.all(promises).then(results => {
                results.forEach(result => {
                    let _output = new Core.TransactionOutput();
                    _output.assetId = result.assetid;
                    _output.scriptHash = result.address;
                    _output.value = result.value;
                    outputs.push(_output);
                })
                itx.outputs = outputs;
                let _tx = Global.Wallet.makeTransaction(itx, Fixed8.Zero);
                return this.SignAndShowInformation(_tx);
            }).catch(reason => {
                alert(reason);
            });
        }

        private SignAndShowInformation = (tx: Core.Transaction) => {
            let context: Core.SignatureContext;
            if (tx == null) {
                throw new Error(Resources.global.insufficientFunds);
            }
            return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]).then(ct => {
                context = ct;
                return Global.Wallet.sign(ct);
            }).then(result => {
                if (!result) throw new Error(Resources.global.canNotSign);
                if (!context.isCompleted())
                    throw new Error(Resources.global.thisVersion1);
                tx.scripts = context.getScripts();
                return Global.Wallet.saveTransaction(tx);
            }).then(result => {
                if (!result) throw new Error(Resources.global.txError1);
                return Global.Node.relay(tx);
            }).then(result => {
                TabBase.showTab("#Tab_Asset_Index");
                alert(Resources.global.issueInfo);
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}