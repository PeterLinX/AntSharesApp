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

        }

        function onPause() {
        }

        function onResume() {
        }

    }

    window.onload = function () {
        Application.initialize();
    }
}
