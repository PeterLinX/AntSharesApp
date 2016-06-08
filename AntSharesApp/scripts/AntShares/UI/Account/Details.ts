namespace AntShares.UI.Account
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let wallet = GlobalWallet.getCurrentWallet();
            let i = args[0] as number;
            $("#public_key").text(wallet.accounts[i].PublicKeyPoint.encodePoint(true).toHexString());
            Export(wallet.accounts[i].PrivateKey, (wif) =>
            {
                $("#privatekey_export").text(wif);
            });
            $("#privatekey_hex").text(wallet.accounts[i].PrivateKey.toHexString());
        }
    }
}