namespace AntShares.UI.Advanced
{
    export class Sign extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#sign").click(this.OnSignButtonClick);
            $(this.target).find("#sign_relay").click(this.OnSignRelayButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#sign_data").focus();
        }

        private OnSignButtonClick = () =>
        {

        }

        private OnSignRelayButtonClick = () =>
        {

        }

    }
}