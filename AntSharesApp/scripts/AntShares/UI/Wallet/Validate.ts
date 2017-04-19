namespace AntShares.UI.Wallet
{
    export class Validate extends TabBase
    {
        protected oncreate(): void
        {
            //github.com/chiruom/jquery.gesture.password.js - Licensed under the MIT license
            (<any>$("#gesturepwdValidate")).GesturePasswd({
                backgroundColor: "FFFFFF",     //背景色
                color: "#252736",               //主要的控件颜色
                roundRadii: 25,                 //大圆点的半径
                pointRadii: 6,                  //大圆点被选中时显示的圆心的半径
                space: 30,                      //大圆点之间的间隙
                lineColor: "#252736",           //用户划出线条的颜色
            });
        }

        protected onload(args: any[]): void
        {
            (<any>$('#menu')).mmenu({ dragOpen: { open: false }});
            $('footer').hide();
            $('#icon_menu').hide();
            setTitle(3);
            let effective: number = 0;
            
            $("#gesturepwdValidate").on("hasPasswd", function (e, passwd) {
                let gesturePwd: string = getCookie("gesturePwd");
                if (gesturePwd == passwd) {
                    $("#gesturepwdValidate").trigger("passwdRight");
                    $("#gesturepwdValidate").off("hasPasswd");
                    setTimeout(() => {
                        $('footer').show();
                        $('#icon_menu').show();
                        TabBase.showTab("#Tab_Account_Index");
                    }, 500);
                } else {
                    $("#gesturepwdValidate").trigger("passwdWrong");
                }
            });
            
        }

    }
}