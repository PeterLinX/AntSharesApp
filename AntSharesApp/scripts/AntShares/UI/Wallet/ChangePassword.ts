namespace AntShares.UI.Wallet
{
    export class ChangePassword extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnChangePasswordButtonClick);
            $(this.target).find("#old_password").change(() => { this.vertifyPassword() });
        }

        private vertifyPassword()
        {
            verifyPassword(
                GlobalWallet.getCurrentWallet().walletName,
                "old_password",
                "change_error")
        }

        protected onload(): void
        {
            let wallet = GlobalWallet.getCurrentWallet();
            if (wallet.accounts.length <= 0)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#change_wallet_name").text(wallet.walletName);
        }

        private OnChangePasswordButtonClick()
        {
            let wallet = GlobalWallet.getCurrentWallet();
            if (formIsValid("form_change_password"))
            {
                wallet.verifyPassword($("#old_password").val().toUint8Array(),
                    () =>
                    {
                        $("#change_error").hide();
                        wallet.changePassword(
                            $("#old_password").val().toUint8Array(),
                            $("#new_password").val().toUint8Array(),
                            () => { alert("修改钱包密码成功"); }
                        );
                    },
                    () =>
                    {
                        $("#change_error").show();
                    }
                );
            }
        }
    }
}