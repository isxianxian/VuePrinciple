import initMixin from "./mixin.js";
import initAssetRegisters from "./asset.js";
import initExtend from './initExtend.js';

const ASSETS_TYPE = ['component', 'filter', 'directive'];
export function initGlobal(Vue) {
  Vue.options = {};

  ASSETS_TYPE.forEach(type => {
    // 根据ASSETS_TYPE在Vue的options中创建几个对象。 Vue.options.components={};
    Vue.options[type + 's'] = {};
  })
  Vue.options._base = Vue; // _base 指向Vue类。


  initMixin(Vue); // 在Vue对象上挂载了mixin方法。
  initAssetRegisters(Vue); // 在Vue对象上挂载component，filter，derective等方法。
  initExtend(Vue);  // 在Vue对象上挂载extend方法。
}