import { initMixin } from './init.js';
import { renderMixin } from './render.js';
import { lifecycleMixin } from './lifecycle.js';

function Vue(option) {
  this.init(option);
}

initMixin(Vue); // 绑定初始化方法
renderMixin(Vue); // 绑定render渲染方法
lifecycleMixin(Vue); // 绑定生命周期函数


export default Vue;