import initMixin from "./mixin.js";

export function initGlobal(Vue) {
  Vue.options = {};

  initMixin(Vue); // 在Vue对象上挂载了mixin方法。
}