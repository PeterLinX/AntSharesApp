namespace AntShares.UI.Wallet {
    export class Hint extends TabBase {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
            $(this.target).find("#export_prikey").click(this.showPrivateKey);

        }

        protected onload(args: any[]): void {
            //if (Global.Wallet == null) {
            //    TabBase.showTab("#Tab_Wallet_Open");
            //    return;
            //}
        }

        private showPrivateKey() {
            Global.Wallet.getAccounts()[0].export().then(result => {
                alert(result);
            });
        }
        
    }
}