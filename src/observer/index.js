import { isObject, def } from '../util/index.js';
import arrayMethods from './array.js';


class Observer {
  constructor(data) {
    // 当给数组添加一个属性时，是可以循环枚举出来的。为了避免递归，需要enumerable为false。
    // Object.defineProperties(data, '_ob', {
    //   enumerable: false,
    //   configurable: false,
    //   value: this,
    // })

    def(data, '_ob', this);


    if (Array.isArray(data)) {
      // 如果是数组的话，不会对索引进行监测，因为会影响性能。
      // 当使用push，pop，shift，unshift等方法修改数组的时候，视图需要变化，所以要重写这些方法。
      data.__proto__ = arrayMethods;
      // 对数组中的对象进行监测===> 通过索引改变数组基本类型值视图没变化
      this.observerArray(data);
    } else {
      this.walk(data);
    }
  }

  observerArray(data) {
    for (let i = 0; i < data.length; i++) {
      observer(data[i])
    }
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
  observer(val)
  Object.defineProperty(data, key, {
    get() {
      console.log(`获取${key}属性值`)
      return val;
    },
    set(newVal) {// 依赖收集
      if (newVal == val) return;
      console.log('设置新的属性值');
      val = newVal;
      observer(newVal)
    }
  })
}

// 导出一个监听函数，用来监听data对象的属性变化。
// 使用了defineProperty，此方法不兼容ie8及其以下版本，所以vue2不兼容ie8。
export function observer(data) {
  if (!isObject(data)) {
    return;
  }
  // 创建一个类进行数据劫持。
  new Observer(data);
}