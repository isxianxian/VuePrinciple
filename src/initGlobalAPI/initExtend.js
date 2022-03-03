import { mergeOptions } from '../util/index.js';

export default function initExtend(Vue) {
  Vue.extend = function (extendOptions) {
    let cid = 0;
    let Sub = function (options) {
      this._init(options);
    }
    Sub.cid = cid++;  // 每个子类都有自己独一无二的id。
    Sub.prototype = Object.create(this.prototype); // Sub原型对象指向Vue.prototype，子继承父的属性方法。原型链。
    Sub.prototype.constructor = Sub;  // 构造函数还是要指向自己的。
    Sub.options = mergeOptions(this.options, extendOptions); // 将父类的options 和自己的extendOptions 合并。

    return Sub;
  }
}