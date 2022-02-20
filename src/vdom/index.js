
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

export function createElement(tag, data = {}, ...children) {
  // 除了tag和data，其余的都是子元素
  let { key } = data;
  return new Vnode(tag, data, key, children, undefined)
}

export function createTextNode(text) {
  //  字符串 'undefined' 和 undefined 是不一样的！
  return new Vnode(undefined, undefined, undefined, undefined, text);
}