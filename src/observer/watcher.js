// Watcher 监听者 当数据变化的时候指挥watcher去执行某些方法来更新。

import { isObject } from '../util/index.js';
import { pushTarget, popTarget } from './dep.js';
import { queueWatcher } from './scheduler.js';

let id = 0;

export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn; // 当前的视图渲染函数
    this.cb = cb; // 回调函数，比如可以在更新update之前执行beforeUpdate方法
    this.options = options; // 额外的选项 true代表渲染watcher
    this.id = id++; // watcher唯一的标识

    this.deps = []; // 存放有关的dep的容器
    this.depsId = new Set(); // 用来去重id

    this.before = options.before; // beforeUpdate
    this.user = options.user; // 标识用户watcher
    this.deep = options.deep; // 深度监听

    this.lazy = options.lazy; // 标识computer
    this.dirty = this.lazy; // dirty 可变，表示计算watcher是否需要重新计算；

    if (typeof exprOrFn === 'function') { // 渲染函数 updateComponent
      this.getter = exprOrFn;
    } else { // watch监听的属性 => 建立值和watcher的关联关系。
      this.getter = function () {
        let path = exprOrFn.split('.'); // 可能是obj.k
        let obj = vm;
        for (let i = 0; i < path.length; i++) { // 拿到实际监听的那个key值
          obj = obj[path[i]];
        }
        return obj;
      }
    }

    this.value = this.lazy ? undefined : this.get();
    // 实例化Watcher的时候get执行，渲染视图。
    // 创建用户Watcher的时候拿到oldVal。
  }

  get() {
    pushTarget(this); // 视图渲染前将当前watcher放到全局中。表示watcher监测的组件正在渲染。
    let res = this.getter.call(this.vm); // 视图渲染函数执行。
    popTarget();// 视图渲染完将当前watcher移除。
    return res;
  }

  addDep(dep) {
    let id = dep.id;
    // 如果watcher关联的deps中没有，才把这个加入到deps集合中，才通知dep去关联watcher
    if (!this.depsId.has(id)) {
      this.depsId.add(id); // new Set的方法：has add
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  update() { // 视图更新方法,其实是将视图放到渲染队列。
    if (this.lazy) {  // computed
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }

  evaluate() {  // computed 重新计算
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); // 调用dep去收集依赖。
    }
  }

  run() {  //这时候视图才是重新渲染

    const oldVal = this.value;
    const newVal = this.get();
    this.value = newVal; // 把新值存起来作为下一次的老值。

    if (this.user) {
      if (newVal != oldVal || isObject(newVal) || this.deep) {
        this.cb.call(this.vm, newVal, oldVal)
      }
    } else {
      this.cb.call(this.vm)
    }

  }
}