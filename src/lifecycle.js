// 生命周期js函数
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    patch(vm.$el, vnode); // 将虚拟节点转换为真实dom元素渲染到页面上。

  }
}


export function mountComponent(vm, el) {
  // 把真实的el选项赋值给示例的$el属性，为之后新dom替换旧dom做铺垫。
  vm.$el = el;

  // render 函数执行生成虚拟dom；
  // update 函数执行将虚拟dom转成真实的dom元素渲染到页面上。
  let node = vm._render();
  vm._update(node);
}