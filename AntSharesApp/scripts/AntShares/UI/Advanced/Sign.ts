namespace AntShares.UI.Advanced
{
    export class Sign extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#sign").click(this.onSignButtonClick);
            $(this.target).find("#sign_relay").click(this.onSignRelayButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#Tab_Advanced_Sign input_data").focus();

        }

        private onSignButtonClick = () =>
        {
            let inputData: string = $("#Tab_Advanced_Sign #input_data").val();
            let context: Core.SignatureContext;
            Core.SignatureContext.Parse(JSON.parse(inputData)).then(result =>
            {
                context = result;
                console.log(context);
                return Global.Wallet.sign(result);
            }).then(success =>
            {
                if (success) {
                    console.log(context);
                    $("#Tab_Advanced_Sign #output_data").text(context.toString());
                    alert("完成签名！");
                }
                else {
                    alert("没有足够的私钥对数据进行签名！");
                }
            }).catch(reason =>
            {
                alert(reason);
            });
        }

        private onSignRelayButtonClick = () =>
        {
            let inputData: string = $("#Tab_Advanced_Sign #input_data").val();
            let inventory: Network.Inventory;
            let context: Core.SignatureContext;
            Core.SignatureContext.Parse(JSON.parse(inputData)).then(result => {
                context = result;
                return Global.Wallet.sign(result);
            }).then(success => {
                if (success) {
                    $("#Tab_Advanced_Sign #output_data").text(JSON.stringify(context));
                    context.signable.scripts = context.getScripts();
                    inventory = <Network.Inventory>context.signable;
                    return Global.Node.relay(inventory);
                }
                else {
                    alert("没有足够的私钥对数据进行签名！");
                }
            }).then(result => {
                TabBase.showTab("#Tab_Asset_Index");
                alert("数据广播成功！");
            }).catch(reason => {
                alert(reason);
            });
        }

        

    }
}