// dep 每个属性都有自己的依赖。建立和watcher多对多的关系。

let id = 0;

export default class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 收集关联的watcher 
  }
  depend() {  // 通知当前渲染的watcher去关联dep
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  addSub(watcher) { // dep关联watcher
    this.subs.push(watcher);
  }
  notify() {  // 通知关联的watcher更新
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null;  // 全局变量，指向当前渲染的Watcher。
const targetStack = []; // 栈结构用来存watcher
export function pushTarget(watcher) {
  targetStack.push(watcher);  // 当渲染视图的时候，将当前视图监测器放到栈结构中。并全局声明当前渲染器。
  Dep.target = watcher;
}
export function popTarget() {
  targetStack.pop();  // 当视图渲染结束，将视图监测器从栈结构拿出，并获取上一个watcher。
  Dep.target = targetStack[targetStack.length - 1];
}