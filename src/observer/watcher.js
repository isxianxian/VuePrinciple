// Watcher 监听者 当数据变化的时候指挥watcher去执行某些方法来更新。

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

    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn;
    }

    this.get(); // 实例化Watcher的时候get执行，渲染视图。
  }


  get() {
    pushTarget(this); // 视图渲染前将当前watcher放到全局中。表示watcher监测的组件正在渲染。
    this.getter(); // 视图渲染函数执行。
    popTarget();// 视图渲染完将当前watcher移除。
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

  update() { // 视图更新方法
    queueWatcher(this);
  }

  run() {  //视图重新渲染
    this.get()
  }
}