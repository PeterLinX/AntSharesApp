namespace AntShares.UI.Contacts
{
    export class Index extends TabBase
    {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
        }

        protected onload(): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Start");
                return;
            }
            let tbody = $("#Tab_Contacts_Index").find("tbody:eq(0)");
            tbody.find("tr :visible").remove();
            this.loadContactsList();
        }

        private loadContactsList = () => {
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

                        tr.find(".contact-name").text(results[i].name);
                        tr.find(".contact-address").text(results[i].address);
                        tbody.append(tr);
                    }
                }
                }).catch(e => {
                    alert(e);
                });;


        }


    }
}
