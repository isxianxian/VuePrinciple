import { mergeOptions } from '../util/index.js';

export default function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    // 将原本的options和mixin混合得到一个新的options对象。
    this.options = mergeOptions(this.options, mixin);
  }
}