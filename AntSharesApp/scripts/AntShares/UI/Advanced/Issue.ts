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
            Global.Wallet.getAssets(Core.TransactionType.RegisterTransaction).then(issueAssets => {
                for (let i = 0; i < issueAssets.length; i++) {
                    Global.Blockchain.getTransaction(issueAssets[i].hash).then(result => {
                        let tx = <Core.RegisterTransaction>result;
                        $("#Tab_Advanced_Issue #select_issue_assets").append("<option value=" + i + ">" + tx.getName() + "</option>");
                    });
                }
            }).then(() => {
                return this.OnIssueAssetChanged();
            });

        }


        private OnIssueAssetChanged = () => {
            let assetName = $("#Tab_Advanced_Issue #select_issue_assets").find("option[value=0]").text();
            Global.Wallet.getAssets(Core.TransactionType.RegisterTransaction).then(issueAssets => {
                let assetName = $("#Tab_Advanced_Issue #select_issue_assets").find("option:selected").text();
                issueAssets.forEach(p => {
                    let i = 0;
                    Global.Blockchain.getTransaction(p.hash).then(result => {
                        let tx = <Core.RegisterTransaction>result;
                        if (assetName == tx.getName()) {
                            this.rtx = tx;
                            $("#Tab_Advanced_Issue .issue_info").show();
                            let parent = $("#Tab_Advanced_Issue #issue_infos");
                            parent.empty();
                            let div = new Array();
                            div.push($("<div>发行者：" + tx.issuer + "</div>"));
                            div.push($("<div>管理员：" + tx.admin + "</div>"));
                            div.push($("<div>总量：" + tx.amount + "</div>"));
                            //div.push($("<div>已发行：" + Core.Blockchain + "</div>"));
                            div.forEach(() => { parent.append(div) });
                        }
                    });
                })
            });
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddInputClick = () => {
            let parent = $("#Tab_Advanced_Issue #issue_outputs");
            let x = Math.round(Math.random() * 10000);
            let divId = "issue_output" + x.toString();
            let div = $("<div id=\"" + divId + "\"/>");

            let inputElement = $("#Tab_Advanced_Issue #issue_output").clone(true);
            inputElement.find("#Tab_Advanced_Issue #div_output_delete").removeAttr("style");
            inputElement.find("#Tab_Advanced_Issue #output_delete").click(() => {
                this.removeInput(parent, divId);
            });

            div.append(inputElement);
            parent.append(div); 
        }

        private OnIssueButtonClick = () => {
            let itx: Core.IssueTransaction = new Core.IssueTransaction();
            let n = Math.random() * 99999999 + 1;
            itx.nonce = parseInt(n.toString(), 10);

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