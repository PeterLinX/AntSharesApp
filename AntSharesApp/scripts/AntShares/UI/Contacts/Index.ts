namespace AntShares.UI.Contacts
{
    export class Index extends TabBase
    {
        protected oncreate(): void
        {
            $("#btn_delte_contact").click(this.OnDeleteClick);
        }

        protected onload(): void {
            let ul = $("#Tab_Contacts_Index").find("ul:eq(0)");
            ul.find("li.add").remove();
            this.loadContactsList();
        }

        private loadContactsList = () => 
        {
            let contacts: Contacts.Contact;
            Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.getContacts();
            }).then(results => {
                if (results.length == 0) {
                    $("#Tab_Contacts_Index .empty").show();
                    $("#Tab_Contacts_Index .title").hide();
                } else {
                    $("#Tab_Contacts_Index .empty").hide();
                    $("#Tab_Contacts_Index .title").show();
                    let contactsArray = linq(results).orderByDescending(p => p.name).toArray();
                    let result = Promise.resolve();
                    for (let i = 0; i < contactsArray.length; i++) {
                        let ul = $("#Tab_Contacts_Index").find("ul:eq(0)");
                        let liTemp = ul.find("li:eq(0)");
                        let li = liTemp.clone(true);
                        li.removeAttr("style");
                        li.click(() =>
                        {
                            $("#contact_name_selected").val(results[i].name);
                            $("#contact_address_selected").val(results[i].address);
                            $("#Tab_Contacts_Index li").removeClass("info");
                            $("#Tab_Contacts_Index .contact-action").hide();
                            li.addClass("info");
                            li.find(".contact-action").show();
                        });
                        li.find(".btn-send").click(this.OnSendClick);
                        li.addClass("add");
                        li.find(".contact-name").text(results[i].name);
                        li.find(".contact-address").text(results[i].address);
                        ul.append(li);
                    }
                }
            }).catch(e => {
                alert(e);
            });
        }

        private OnDeleteClick() {
            let modal = $('#deleteModal') as any;
            modal.modal('hide');
            let name = $("#contact_name_selected").val();
            let contacts: Contacts.Contact;
            Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.get();
            }).then(() => {
                return contacts.delete(name);
            }).then(() => {
                TabBase.showTab("#Tab_Contacts_Index");
            }).catch(e => {
                alert(e);
            })
        }

        private OnSendClick() {
            let address = $("#contact_address_selected").val();
            TabBase.showTab("#Tab_Account_Send", address);
        }
    }
}
