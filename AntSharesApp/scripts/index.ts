// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkID=397705
// 若要在 Ripple 或 Android 设备/仿真程序中调试代码: 启用你的应用程序，设置断点，
// 然后在 JavaScript 控制台中运行 "window.location.reload()"。
module AntSharesApp {
    "use strict";

    export module Application {
        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }

        function onDeviceReady() {
            // 处理 Cordova 暂停并恢复事件
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            window.requestFileSystem = window.requestFileSystem || (<any>window).webkitRequestFileSystem;
        
            (<any>cordova).plugins.backgroundMode.enable();
            //(<any>cordova).plugins.backgroundMode.on('activate', function () {
            //    setInterval(function () {
            //        (<any>cordova).plugins.notification.badge.increase();

            //    }, 1000);
            //});
            //(<any>cordova).plugins.backgroundMode.on('deactivate', function () {
            //    (<any>cordova).plugins.notification.badge.clear();
            //});

        }

        function onPause() {
			console.log("onPause()");
			//wait();
        }

        function onResume() {
            if (noResume) {
                //在Android4.4设备上备份/恢复钱包后会执行多次onResume
                //为了不跳到打开钱包页面，设置备份/恢复后1分钟内免登录
                setTimeout(() => { noResume = false }, 60000);
                return;
            }
            let gesturePwd: string = getCookie("gesturePwd");
            if (gesturePwd == "") {
                if (AntShares.Global.Wallet != null) {
                    AntShares.Global.Wallet = null;
					AntShares.UI.TabBase.showTab("#Tab_Wallet_Open", true);
					//wait_cancel();
                }
				else {
					//wait_cancel();
				}
            } else {
				//wait_cancel();
                AntShares.UI.TabBase.showTab("#Tab_Wallet_Validate");
            }
            
        }

    }

    window.onload = function () {
        Application.initialize();
        let w = window as any;
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
        if (!indexedDB) {
            alert(AntShares.UI.Resources.global.browserIndexedb);
            return;
        } else if (is_weixin() || is_weibo() || is_qq()) {
            alert(AntShares.UI.Resources.global.browserError);
            return;
        } else if (w.mobilecheck() && !isMobileApp.App()) {
            if (isMobileWeb.Edge())
                $("#download_link").attr("href", "https://www.microsoft.com/store/apps/9nblggh42jbd");
            else if (isMobileWeb.Android())
                $("#download_link").attr("href", "https://www.antshares.org/Client/android-release.apk");
            else if (isMobileWeb.iOS())
                $("#download_link").attr("href", "https://itunes.apple.com/app/xiao-yi/id1164555453");
            ($('#downloadAPP') as any).modal();
            return;
        }
    }
}
