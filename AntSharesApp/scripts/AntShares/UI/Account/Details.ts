namespace AntShares.UI.Account
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {
            let account = args[0] as Wallets.Account;
            (<any>$("#seckey")).collapse('hide');
            $("#public_key").text(account.publicKey.encodePoint(true).toHexString());
            account.export().then(result =>
            {
                $("#privatekey_export").text(result);
            });
        }
    }
}
