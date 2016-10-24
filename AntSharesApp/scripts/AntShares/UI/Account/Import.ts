namespace AntShares.UI.Account
{
    export class Import extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#import_prikey").click(this.OnImportButtonClick);
        }

        protected onload(): void
        {
        }

        private OnImportButtonClick()
        {
            if (formIsValid("form_create_wallet"))
            {
                Global.Wallet.import($("#import_prikey_input").val()).then(result =>
                {
                    alert(Resources.global.importAccountAlert);
                    TabBase.showTab("#Tab_Account_Index");
                }, reason => $("#import_error").text(reason));
            }
        }
    }
}
