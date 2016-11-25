﻿namespace AntShares.UI.Account
{
    export class Receive extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(0);
            Global.Wallet.getContracts()[0].getAddress().then(result => {
                $("#receiver").text(result);
            });
        }
    }
}
