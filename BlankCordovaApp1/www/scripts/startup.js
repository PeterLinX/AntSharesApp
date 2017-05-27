define(["require", "exports", "./application"], function (require, exports, Application) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // 尝试从 /merges 文件夹下载平台特定的代码。
    // 有关详细信息，请访问 http://taco.visualstudio.com/zh-cn/docs/configure-app/#Content。
    require(["./platformOverrides"], function () { return Application.initialize(); }, function () { return Application.initialize(); });
});
//# sourceMappingURL=startup.js.map