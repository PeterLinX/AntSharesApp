define(["require", "exports"], function (require, exports) {
    // 有关“空白”模板的简介，请参阅以下文档:
    // http://go.microsoft.com/fwlink/?LinkID=397705
    // 若要在 cordova-simulate 或 Android 设备/仿真器上在页面加载时调试代码: 启动应用，设置断点，
    // 然后在 JavaScript 控制台中运行 "window.location.reload()"。
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function initialize() {
        document.addEventListener('deviceready', onDeviceReady, false);
    }
    exports.initialize = initialize;
    function onDeviceReady() {
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        // TODO: Cordova 已加载。在此处执行任何需要 Cordova 的初始化。
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
    function onPause() {
        // TODO: 此应用程序已挂起。在此处保存应用程序状态。
    }
    function onResume() {
        // TODO: 此应用程序已重新激活。在此处还原应用程序状态。
    }
});
//# sourceMappingURL=application.js.map