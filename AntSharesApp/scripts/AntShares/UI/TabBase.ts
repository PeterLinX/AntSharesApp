namespace AntShares.UI
{
    export abstract class TabBase
    {
        private static _tabs = new Object();
        protected target: Element;

        protected oncreate(): void { }
        protected onload(args: any[]): void { }

        public static showTab(id: string, ...args): void
        {
            $('.content>.tab-content>.tab-pane').removeClass("active");
            $(id).addClass("active");
            let className = id.replace("#Tab_", "AntShares.UI.").replace(/_/g, '.');
            let tab: TabBase;
            if (TabBase._tabs[className] == null)
            {
                let t: () => void;
                try { t = eval(className); } catch (ex) { }
                if (t == null) return;
                tab = new t() as TabBase;
                tab.target = $(id)[0];
                tab.oncreate();
                TabBase._tabs[className] = tab;
            } 
            else
            {
                tab = TabBase._tabs[className];
            }
            $("#menu").find("li").removeClass("mm-selected");
            let menuList = $("#menu").find("li");
            for (let i = 0; i < menuList.length; i++)
            {
                if ($(menuList[i]).find("a").attr("href") == id)
                {
                    $(menuList[i]).addClass("mm-selected");
                    break;
                }
            }
            tab.onload(args);
        }
    }

    $('.tab-trigger').click(function (event)
    {
        event.preventDefault();
        TabBase.showTab($(this).attr("href"), $(this).data("args"));
    });

    $(function ()
    {
        TabBase.showTab('#' + $('.content>.tab-content>.tab-pane.active').attr("id"));
    });
}
