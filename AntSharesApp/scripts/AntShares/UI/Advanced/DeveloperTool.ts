namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#convert").click(this.OnConvertButtonClick);
            $(this.target).find("#relay").click(this.OnRelayButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#relay_data").focus();
        }

        private OnConvertButtonClick = () =>
        {
            //SignatureContext context = SignatureContext.Parse(textBox1.Text);
            //context.Signable.Scripts = context.GetScripts();
            //InformationBox.Show(context.Signable.ToArray().ToHexString(), "原始数据：");

            let strRelayData: string = $("#relay_data").val();
            let objRelayData = JSON.parse(strRelayData); //由字符串转换为JSON对象
            Core.SignatureContext.Parse(objRelayData).then(context => {
                context.signable.scripts = context.getScripts();
                let ms = new IO.MemoryStream();
                let writer = new IO.BinaryWriter(ms);
                context.signable.serialize(writer);
                let output: Uint8Array = new Uint8Array(ms.toArray(), 0);
                $("#Tab_Advanced_DeveloperTool #convert_section").removeAttr("style");
                $("#Tab_Advanced_DeveloperTool #convert_data").text(output.toHexString());
            });
        }

        private OnRelayButtonClick = () =>
        {
            let strRelayData: string = $("#relay_data").val();
            let objRelayData = JSON.parse(strRelayData); //由字符串转换为JSON对象

            let inventory: Network.Inventory;
            Core.SignatureContext.Parse(objRelayData).then(context =>
            {
                context.signable.scripts = context.getScripts();
                //inventory = new Network.Inventory();
                inventory = <Network.Inventory>context.signable;
                return Global.Node.relay(inventory);
            }).then(success => {
                if (success)
                {
                    alert("数据广播成功！");
                } else
                {
                    alert("数据广播失败！");
                }
            }).catch(reason => {
                alert(reason);
            });

        }

    }
}