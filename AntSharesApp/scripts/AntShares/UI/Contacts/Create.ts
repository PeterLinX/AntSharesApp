namespace AntShares.UI.Contacts
{
    export class Create extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#create_contact").click(this.OnCreateClick);

        }

        protected onload(): void
        {

        }

        private OnCreateClick = () =>
        {
            if (formIsValid("form_create_contact"))
            {
                let name: string = $("#contact_name").val();
                let address: string = $("#contact_address").val();

                let contacts: Contacts.Contact;
                Contacts.Contact.instance().then(result =>
                {
                    contacts = result;
                    return contacts.get();
                }).then(result =>
                {
                    if (result.indexOf(name) >= 0)
                        throw new Error(Resources.global.contactExists);
                    return contacts.add(name, address);
                }).then(wallet =>
                {
                    formReset("form_create_contact");
                    TabBase.showTab("#Tab_Contacts_Index", true);
                }).catch(e =>
                {
                    alert(e);
                })
            }
        }


    }
}
