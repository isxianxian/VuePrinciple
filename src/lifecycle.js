// 生命周期js函数
import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    patch(vm.$el, vnode); // 将虚拟节点转换为真实dom元素渲染到页面上。
  }
}


export function mountComponent(vm, el) {
  // 把真实的el选项赋值给示例的$el属性，为之后新dom替换旧dom做铺垫。
  vm.$el = el;

  // 渲染视图的核心方法
  let updateComponent = () => {
    let node = vm._render();
    vm._update(node);
    // render 函数执行生成虚拟dom；
    // update 函数执行将虚拟dom转成真实的dom元素渲染到页面上。
  }

  // 渲染一次视图就创建一个视图渲染监视器Watcher(实际的视图渲染在实例化watcher里面)
  new Watcher(vm, updateComponent, null, true);
}