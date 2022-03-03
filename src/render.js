import { createElement, createTextNode } from './vdom/index.js';
import { nextTick } from './util/next-tick.js';

export function renderMixin(Vue) {
  // 将_render 方法绑定到vue的原型上。
  Vue.prototype._render = function () {
    const vm = this;
    const { render } = vm.$options;
    return render.call(vm);
    // render 函数执行返回虚拟dom。注意函数中this的指向。
  }

  Vue.prototype._c = function (...arg) {
    // 创建虚拟dom元素
    return createElement(this, ...arg);
  }
  Vue.prototype._v = function (text) {
    // 创建虚拟文本元素
    return createTextNode(this, text);
  }
  Vue.prototype._s = function (val) {
    return val == null
      ? ''
      : typeof val == 'object'
        ? JSON.stringify(val) : val
  }

  Vue.prototype.$nextTick = nextTick; // 手动调用异步方法。
}
