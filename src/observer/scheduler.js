import { nextTick } from '../util/next-tick.js';
import { callHook } from '../lifecycle.js';


let queue = []; // 队列数组
let has = {};

// 执行队列中的方法
function flushScheduleQueue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i].run();
  }
  const updatedQueue = queue.slice()
  queue = [];
  has = {};
  callUpdatedHooks(updatedQueue); // 当视图全部渲染完成后，每个视图都会执行updated函数。
}

function callUpdatedHooks(queue) {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher) {
      callHook(vm, 'updated')
    }
  }
}

// 把watcher放到队列中，等所有数据更新完成后再视图刷新
export function queueWatcher(watcher) {
  let id = watcher.id;
  if (has[id] === undefined) {
    has[id] = true;
    queue.push(watcher);
    nextTick(flushScheduleQueue)
  }
}