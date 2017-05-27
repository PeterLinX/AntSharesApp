import * as Application from './application';

declare var require: (modules: string[], ready: Function, errback: Function) => void;

// 尝试从 /merges 文件夹下载平台特定的代码。
// 有关详细信息，请访问 http://taco.visualstudio.com/zh-cn/docs/configure-app/#Content。
require(["./platformOverrides"],
    () => Application.initialize(),
    () => Application.initialize());