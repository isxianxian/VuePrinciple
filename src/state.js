import { observer } from './observer/index.js';
import Watcher from './observer/watcher.js';

// 初始化状态js
export function initState(vm) {
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

function initProps(vm) { };

function proxy(vm, key, source) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newVal) {
      observer(newVal);
      vm[source][key] = newVal;
    }
  })
}
function initData(vm) {
  let data = vm.$options.data;
  vm._data = data = typeof data === 'function' ? data.call(vm) : data;
  // 监听data的变化来实时影响视图 ==> 数据影响视图。
  observer(data);

  for (let key in data) {
    proxy(vm, key, '_data') // 数据代理，将data中的数据代理到实例对象上。
  }
};
function initMethods(vm) { };
function initComputed(vm) { };


function initWatch(vm) {
  let watch = vm.$options.watch;
  for (let k in watch) {
    let handler = watch[k];
    if (Array.isArray(handler)) {
      // 如果是数组就遍历进行创建
      handler.forEach((handle) => {
        createWatcher(vm, k, handle);
      });
    } else {
      createWatcher(vm, k, handler);
    }
  }
};
function createWatcher(vm, k, handler, options = {}) {
  if (typeof handler == 'object') {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler == 'string') {
    handler = vm[handler]
  }

  return vm.$watch(k, handler, options);
}

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (exprOrFn, cb, options) {
    let vm = this;
    let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true });

    // 如果 immediate 为true，回调函数立刻执行。
    if (options.immediate) {
      cb();
    }
  }
}