namespace AntShares.UI.Advanced {
    export class Vote extends TabBase {
        protected oncreate(): void {
            $(this.target).find("#vote").click(this.OnVoteButtonClick);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddInputClick = () => {
            let parent = $("#Tab_Advanced_Vote #candidates");
            let x = Math.round(Math.random() * 10000);
            let divId = "candidate" + x.toString();
            let div = $("<div id=\"" + divId + "\"/>");

            let inputElement = $("#Tab_Advanced_Vote #candidate").clone(true);
            inputElement.find("#Tab_Advanced_Vote #div_candidate_delete").removeAttr("style");
            inputElement.find("#Tab_Advanced_Vote #candidate_delete").click(() => {
                this.removeInput(parent, divId);
            });

            div.append(inputElement);
            parent.append(div);
        }

        private OnVoteButtonClick = () => {
            let _candidates = $("#Tab_Advanced_Vote .candidate");
            let candidates: Uint256[] = new Array<Uint256>();
            try{
                for (let i = 0; i < _candidates.length; i++) {
                    if ($(_candidates[i]).val() == "") {
                        continue;
                    } else {
                        candidates.push($(_candidates[i]).val());
                    }
                }

                let tx: Core.VotingTransaction = new Core.VotingTransaction();
                tx.enrollments = candidates;
                tx.outputs = [new Core.TransactionOutput()];
                tx.outputs[0].assetId = Core.Blockchain.AntShare.hash;
                tx.outputs[0].value = Global.Wallet.getAvailable(Core.Blockchain.AntShare.hash);
                tx.outputs[0].scriptHash = Global.Wallet.getChangeAddress();

                let _tx = Global.Wallet.makeTransaction(tx, Fixed8.Zero);
                return this.SignAndShowInformation(_tx);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    alert(Resources.globel.dataFormatError);
                }
                else {
                    alert(e);
                }
            }
        }

        private SignAndShowInformation = (tx: Core.Transaction) => {
            let context: Core.SignatureContext;
            if (tx == null) {
                throw new Error(Resources.globel.insufficientFunds);
            }
            return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]).then(ct => {
                context = ct;
                return Global.Wallet.sign(ct);
            }).then(result => {
                if (!result) throw new Error(Resources.globel.canNotSign);
                if (!context.isCompleted())
                    throw new Error(Resources.globel.thisVersion1);
                tx.scripts = context.getScripts();
                return Global.Wallet.saveTransaction(tx);
            }).then(result => {
                if (!result) throw new Error(Resources.globel.txError1);
                return Global.Node.relay(tx);
            }).then(result => {
                TabBase.showTab("#Tab_Asset_Index");
                alert(Resources.globel.voteInfo);
            }).catch(reason => {
                alert(reason);
            });
        }

    }
}