// nextTick 实现原理

let callbacks = [];
let pending = false;

function flushCallbacks() { // 同步任务，callbacks中的函数依次执行。
  pending = false;
  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]();
  }
}

let timerFunc;
// 定义异步方法，优雅降级（优先级，有啥用啥）
if (typeof Promise !== "undefined") {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
  }
} else if (typeof MutationObserver !== 'undefined') {
  // MutationObserver 监听dom变化。 当dom发生变化，执行回调函数，也是个异步。
  let counter = 1;
  const textNode = document.createTextNode(String(counter));
  const observer = new MutationObserver(flushCallbacks);
  observer.observe(textNode, { characterData: true });
  timerFunc = () => { // 通过改变dom元素的data值来触发监听函数
    counter = (counter + 1) % 2;
    textNode.data = counter;
  }
} else if (typeof setImmediate !== 'undefined') {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  }
}



export function nextTick(cb) {
  callbacks.push(cb);
  if (!pending) {
    // 此时没有执行异步任务，手动调用；如果已经在执行异步了，cb在callbacks中等待执行即可。
    pending = true;
    timerFunc();
  }
}