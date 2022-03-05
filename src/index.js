import { initMixin } from './init.js';
import { stateMixin } from './state.js';
import { renderMixin } from './render.js';
import { lifecycleMixin } from './lifecycle.js';

import { initGlobal } from './initGlobalAPI/index.js';

function Vue(option) {
  this._init(option);
}

initMixin(Vue); // 绑定初始化方法
stateMixin(Vue); // 绑定$watch方法
renderMixin(Vue); // 绑定render渲染方法
lifecycleMixin(Vue); // 绑定生命周期函数

initGlobal(Vue);  // 初始化Vue全局api => Vue.options; Vue.mixin; 


export default Vue;