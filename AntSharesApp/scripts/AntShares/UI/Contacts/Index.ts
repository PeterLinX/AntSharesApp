namespace AntShares.UI.Contacts
{
    export class Index extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void
        {
            $(this.target).find("#dedete_contact").click(this.OnDeleteClick);
        }

        protected onload(): void {

            let tbody = $("#Tab_Contacts_Index").find("tbody:eq(0)");
            tbody.find("tr :visible").remove();
            this.loadContactsList();
            $("#dedete_contact").hide();
        }

        private loadContactsList = () => 
        {
            let contacts: Contacts.Contact;
            Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.getContacts();
            }).then(results => {
                if (results.length == 0) {
                    $("#Tab_Contacts_Index > h5").show();
                    $("#Tab_Contacts_Index > table").hide();
                } else {
                    $("#Tab_Contacts_Index > h5").hide();
                    $("#Tab_Contacts_Index > table").show();
                    let contactsArray = linq(results).orderByDescending(p => p.name).toArray();
                    let result = Promise.resolve();
                    for (let i = 0; i < contactsArray.length; i++) {
                        let tbody = $("#Tab_Contacts_Index").find("tbody:eq(0)");
                        let trTemp = tbody.find("tr:eq(0)");
                        let tr = trTemp.clone(true);
                        tr.removeAttr("style");
                        tr.click(() =>
                        {
                            $("#contact_name_selected").val(results[i].name);
                            $("#Tab_Contacts_Index tr").removeClass("info");
                            tr.addClass("info");
                            $("#dedete_contact").show();
                        });
                        tr.find(".contact-name").text(results[i].name);
                        tr.find(".contact-address").text(results[i].address);
                        tbody.append(tr);
                    }
                }
                }).catch(e => {
                    alert(e);
                });;
        }

        private OnDeleteClick()
        {
            let name = $("#contact_name_selected").val();
            if (confirm("确定要删除联系人" + name + "吗？"))
            {
                let contacts: Contacts.Contact;
                Contacts.Contact.instance().then(result =>
                {
                    contacts = result;
                    return contacts.get();
                }).then(() =>
                {
                    return contacts.delete(name);
                }).then(() =>
                {
                    TabBase.showTab("#Tab_Contacts_Index");
                }).catch(e =>
                {
                    alert(e);
                })

            }
        }
    }
}
