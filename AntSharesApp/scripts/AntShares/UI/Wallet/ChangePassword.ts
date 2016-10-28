namespace AntShares.UI.Wallet
{
    export class ChangePassword extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("button").click(this.OnChangePasswordButtonClick);
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            $("#change_wallet_name").text(Global.Wallet.dbPath);
        }

        private OnChangePasswordButtonClick = () =>
        {
            if (formIsValid("form_change_password"))
            {
                Global.Wallet.changePassword($("#old_password").val(), $("#new_password").val()).then(result =>
                {
                    if (result)
                    {
                        $("#change_error").hide();
                        $("#change_password_reset").trigger("click");
                        alert(Resources.global.changePwdSuccess);
                        TabBase.showTab("#Tab_Account_Index");
                    }
                    else
                    {
                        $("#change_error").show();
                    }
                });
            }
        }
    }
}
