namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase
    {

        protected oncreate(): void
        {
            $(this.target).find("#convert").click(this.OnConvertButtonClick);
            $(this.target).find("#relay").click(this.OnRelayButtonClick);
        }

        protected onload(args: any[]): void
        {
            $("#Tab_Advanced_DeveloperTool #relay_data").val("");
            $("#Tab_Advanced_DeveloperTool #relay_data").focus();
        }

        private OnConvertButtonClick = () =>
        {
            let strRelayData: string = $("#Tab_Advanced_DeveloperTool #relay_data").val();
            try {
                if (strRelayData == "")
                {
                    alert(Resources.globel.pleaseInputData);
                } else {
                    Core.SignatureContext.parse(strRelayData).then(context =>
                    {
                        context.signable.setScripts(context.getScripts());
                        let ms = new IO.MemoryStream();
                        let writer = new IO.BinaryWriter(ms);
                        context.signable.serialize(writer);
                        let output: Uint8Array = new Uint8Array(ms.toArray(), 0);
                        $("#Tab_Advanced_DeveloperTool #convert_section").removeAttr("style");
                        $("#Tab_Advanced_DeveloperTool #convert_data").text(output.toHexString());
                    }).catch(reason => {
                        alert(reason);
                    });
                }
            } catch (e) {
                if (e instanceof SyntaxError) {
                    alert(Resources.globel.dataFormatError);
                }
                else{
                    alert(e);
                }
            }
        }

        private OnRelayButtonClick = () =>
        {
            let strRelayData: string = $("#Tab_Advanced_DeveloperTool #relay_data").val();
            try {
                if (strRelayData == "") {
                    alert(Resources.globel.pleaseInputData);
                } else {
                    let inventory: Network.Inventory;
                    Core.SignatureContext.parse(strRelayData).then(context =>
                    {
                        context.signable.setScripts(context.getScripts());
                        inventory = <Network.Inventory>context.signable;
                        return Global.Node.relay(inventory);
                    }).then(success => {
                        if (success)
                        {
                            alert(Resources.globel.relaySuccess);
                        } else
                        {
                            alert(Resources.globel.relayFaild);
                        }
                    }).catch(reason => {
                        alert(reason);
                    });
                }
            } catch (e) {
                if (e instanceof SyntaxError) {
                    alert(Resources.globel.dataFormatError);
                }
                else {
                    alert(e);
                }
            }

        }

    }
}