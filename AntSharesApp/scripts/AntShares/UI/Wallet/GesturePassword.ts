namespace AntShares.UI.Wallet
{
    export class GesturePassword extends TabBase {

        protected oncreate(): void {
            //github.com/chiruom/jquery.gesture.password.js - Licensed under the MIT license
            (<any>$("#Tab_Wallet_GesturePassword #gesturepwdSet")).GesturePasswd({
                backgroundColor: "FFFFFF",      //背景色
                color: "#252736",               //主要的控件颜色
                roundRadii: 25,                 //大圆点的半径
                pointRadii: 6,                  //大圆点被选中时显示的圆心的半径
                space: 30,                      //大圆点之间的间隙
                lineColor: "#252736",           //用户划出线条的颜色
            });
        }

        protected onload(): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            if (isMobileApp.App()) {
                //App
            } else {
                TabBase.showTab("#Tab_Account_Index");
                alert("网页版钱包无法设置手势密码");
                return;
            }

            setTitle(2);
            let initPwd: string = "";
            let confirmPwd: string = "";
            let cnt: number = 0;
            let effective: number = 0;

            $("#Tab_Wallet_GesturePassword #gesturepwdSet").on("hasPasswd", (e, passwd) => {
                if (cnt == 0) {
                    initPwd = passwd;
                    cnt++;
                    $("#Tab_Wallet_GesturePassword #gesturepwdSet").trigger("passwdRight");
                } else {
                    confirmPwd = passwd;
                    if (initPwd == confirmPwd) {
                        $("#Tab_Wallet_GesturePassword #gesturepwdSet").trigger("passwdRight");
                        $("#Tab_Wallet_GesturePassword #gesturepwdSet").off("hasPasswd");
                        setTimeout(() => {
                            setCookie("gesturePwd", passwd, 365);
                            cnt = 0;
                            TabBase.showTab("#Tab_Account_Index");
                        }, 500);
                    } else {
                        initPwd = passwd;
                        $("#Tab_Wallet_GesturePassword #gesturepwdSet").trigger("passwdWrong");
                        alert(Resources.global.gesturePwdWrong);
                    }
                }
                
            });
        }

    }
}
