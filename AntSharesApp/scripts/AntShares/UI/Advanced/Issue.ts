namespace AntShares.UI.Advanced {
    export class Issue extends TabBase {

        protected oncreate(): void {
            $(this.target).find("#add_input").click(this.OnAddInputClick);
            $(this.target).find("#issue").click(this.OnIssueButtonClick);
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
            let parent = $("#div_inputs");
            let x = Math.round(Math.random() * 10000);
            let divId = "div_input" + x.toString();
            let div = $("<div id=\"" + divId + "\"/>");

            let inputElement = $("#div_input").clone(true);
            inputElement.find("#delete_div").removeAttr("style");
            inputElement.find("#delete").click(() => {
                this.removeInput(parent, divId);
            });

            div.append(inputElement);
            parent.append(div); 

        }

        private OnIssueButtonClick = () => {
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