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

        }

        function onPause() {
        }

        function onResume() {
        }

    }

    window.onload = function () {
        Application.initialize();  

        let w = window as any;
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        if (!indexedDB) {
            alert("该浏览器不支持IndexedDB，无法使用小蚁钱包APP");
            return;
        } else if (is_weixin() || is_weibo() || is_qq()) {
            alert("无法在微信/QQ/微博的内置浏览器中使用小蚁钱包，请使用Chrome浏览器或下载小蚁钱包APP");
            return;
        }
        else if (w.mobilecheck() && !isMobileApp.App) {
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
