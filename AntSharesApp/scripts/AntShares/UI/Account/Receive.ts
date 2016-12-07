namespace AntShares.UI.Account
{
    export class Receive extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#copy-addr").click(this.OnCopyAddress);
            $(this.target).find("#receiver_backup").click(this.OnBackup);
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(0);

            let backup: string = getCookie("hasBackup");
            if (backup == "" || backup == "0") {
                $("#receiver_address").hide();
                $("#receiver_info").show();
                $("#receiver_backup").show();
            } else {
                $("#receiver_address").show();
                $("#receiver_info").hide();
                $("#receiver_backup").hide();
            }
            Global.Wallet.getContracts()[0].getAddress().then(result => {
                $("#receiver").text(result);
            });
        }

        protected OnCopyAddress(): void {

        }

        private OnBackup(): void {
            TabBase.showTab("#Tab_Wallet_Backup");
        }
    }
}
