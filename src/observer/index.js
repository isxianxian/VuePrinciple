import { isObject } from '../util/index.js';


class Observer {
  constructor(data) {
    this.walk(data);
  }
  walk(data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i],
        val = data[key];
      defineReactive(data, key, val);
    }
  }
}

// 对data的每个属性都进行响应式设计
function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    get() {
      return val;
    },
    set(newVal) {// 依赖收集
      if (newVal == val) return;
      console.log('属性值发生变化了');
      val = newVal;
    }
  })
}

// 导出一个监听函数，用来监听data对象的属性变化。
// 使用了defineProperty，此方法不兼容ie8及其以下版本，所以vue2不兼容ie8。
export function observer(data) {
  console.log(isObject(data))
  if (!isObject(data)) {
    return;
  }
  // 创建一个类进行数据劫持。
  new Observer(data);
}