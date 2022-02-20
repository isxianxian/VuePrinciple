import { observer } from './observer/index.js';

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
function initWatch(vm) { };