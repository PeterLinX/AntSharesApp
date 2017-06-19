namespace AntShares.UI.Account
{
    export class Receive extends TabBase
    {
        protected oncreate(): void {
            $(this.target).find("#show_prikey").click(this.showPrivateKey);
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
                $("#qrcode").hide();
                $("#receiver_info").show();
            } else {
                $("#receiver_address").show();
                $("#qrcode").show();
                $("#receiver_info").hide();
            }
            Global.Wallet.getContracts()[0].getAddress().then(result => {
                $("#receiver").text(result);

                let img = $("#qrcode").find("img");
                if (img.length == 0) $("#btnQRcode").click();
            });
        }

        private showPrivateKey() {
            Global.Wallet.getAccounts()[0].export().then(result => {
                alert(result);
            });
        }
    }
}
