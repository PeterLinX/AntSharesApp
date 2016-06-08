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

        }

        private OnRelayButtonClick = () =>
        {
            let strRelayData: string = $("#relay_data").val();
            console.log(strRelayData);
            let objRelayData = JSON.parse(strRelayData); //由字符串转换为JSON对象
            
        }

    }
}