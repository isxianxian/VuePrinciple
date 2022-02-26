import { nextTick } from '../util/next-tick.js';


let queue = []; // 队列数组
let has = {};

// 执行队列中的方法
function flushScheduleQueue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i].run();
  }
  queue = [];
  has = {};
}

// 把watcher放到队列中，等所有数据更新完成后再视图刷新
export function queueWatcher(watcher) {
  let id = watcher.id;
  if (has[id] === 'undefined') {
    has[id] = true;
    queue.push(watcher);
    nextTick(flushScheduleQueue)
  }
}