namespace AntShares.UI.Account
{
    export class Receive extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#copy-addr").click(this.OnCopyAddress);
            $(this.target).find("#camera").click(this.OnCamera);
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
            } else {
                $("#receiver_address").show();
                $("#receiver_info").hide();
            }
            Global.Wallet.getContracts()[0].getAddress().then(result => {
                $("#receiver").text(result);

                let img = $("#qrcode").find("img");
                if (img.length == 0) $("#btnQRcode").click();
            });
        }

        protected OnCopyAddress(): void {

        }

        private OnCamera() {
            (<any>cordova).plugins.barcodeScanner.scan(result => {
                let address: string = result.text;
                TabBase.showTab("#Tab_Account_Send", address);
            }, error => {
                alert("Scanning failed: " + error);
            }, {
                    showFlipCameraButton: true, // iOS and Android
                    showTorchButton: true, // iOS and Android
                    torchOn: true, // Android, launch with the torch switched on (if available)
                    prompt: "Place a barcode inside the scan area", // Android
                    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                    formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
                });
        }
    }
}
