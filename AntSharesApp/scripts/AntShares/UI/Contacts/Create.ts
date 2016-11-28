namespace AntShares.UI.Contacts
{
    export class Create extends TabBase
    {
        protected oncreate(): void {
            $(this.target).find("#create_contact").click(this.OnCreateClick);

        }

        protected onload(): void {
            
        }

        private OnCreateClick = () => {
            let name: string = $("#contact_name").val();
            let address: string = $("#contact_address").val();

            let contacts: Contacts.Contact;
            Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.get();
            }).then(result => {
                if (result.indexOf(name) >= 0)
                    throw new Error("已经添加过该联系人");
                return contacts.add(name, address);
            }).then(wallet => {
                TabBase.showTab("#Tab_Contacts_Index", true);
                }).catch(e => {
                    alert(e);
                })
        }


    }
}
