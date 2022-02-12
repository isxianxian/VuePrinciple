// 初始化js
import { initState } from './state.js';
import { compileToFunctions } from './compiler/index.js';

export function initMixin(Vue) {
  Vue.prototype.init = function (options) {
    let vm = this;
    vm.$options = options;

    // 初始化实例状态
    initState(vm);

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
        render.call(this);
        options.render = render;
      }
    }

  }

}




/**
 *  实例初始化
 *      初始化状态 initState(vm)
 *        包括initDate:数据劫持
 * 
 */