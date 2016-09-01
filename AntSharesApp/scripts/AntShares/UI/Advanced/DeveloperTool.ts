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
            console.log(123);
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