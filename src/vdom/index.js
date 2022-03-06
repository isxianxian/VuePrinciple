import { isReservedTag, isObject } from '../util/index.js';


// 定义虚拟节点
export default class Vnode {
  constructor(tag, data, key, children, text) {
    this.tag = tag;
    this.data = data;
    this.key = key;
    this.children = children;
    this.text = text;
  }
}

export function createElement(vm, tag, data = {}, ...children) {
  // 除了tag和data，其余的都是子元素
  let { key } = data;
  if (isReservedTag(tag)) {
    return new Vnode(tag, data, key, children, undefined);
  } else {
    let Ctor = vm.$options.components[tag];
    return createComponent(vm, tag, data, key, children, Ctor);
  }
}

function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) { // 针对 components 上注册的组件，此时还没生成子组件。
    Ctor = vm.$options._base.extend(Ctor);
  };
  data.hook = {
    init(vnode) {
      let child = (vnode.componentInstance = new Ctor({ _isComponent: true })); //实例化组件
      child.$mount();
    }
  };
  let vnode = new Vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, { Ctor, children });
  return vnode
}

export function createTextNode(vm, text) {
  //  字符串 'undefined' 和 undefined 是不一样的！
  return new Vnode(undefined, undefined, undefined, undefined, text);
}