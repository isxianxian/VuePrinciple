// 初始化js
import { initState } from './state.js';
import { compileToFunctions } from './compiler/index.js';
import { mountComponent } from './lifecycle.js';

import { mergeOptions } from './util/index.js';
import { callHook } from './lifecycle.js';


export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    let vm = this;
    vm.$options = mergeOptions(vm.constructor.options, options);
    callHook(vm, 'beforeCreate');
    // 实例的构造函数constructor就是自己的类。
    // 初始化实例状态
    initState(vm);
    callHook(vm, 'created');

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // 元素渲染 render函数>template>el
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

    // 传入的 el 或者 template 选项最后都会被解析成 render 函数,这样才能保持模板解析的一致性。

    if (!options.render) {
      let template = options.template;
      if (!template && el) {
        template = el.outerHTML;
      }

      if (template) {
        // compileToFunctions 模板转换核心方法
        const render = compileToFunctions(template);
        options.render = render;
      }
    }

    // 组件挂载的核心方法。把当前的组件示例挂载到真试的dom元素上。
    return mountComponent(vm, el);
  }

}




/**
 *  实例初始化
 *      初始化状态 initState(vm)
 *        包括initDate:数据劫持
 * 
 */