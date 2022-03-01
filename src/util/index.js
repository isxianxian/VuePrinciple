export function isObject(object) {
  return typeof object === 'object' && object !== null;
}

export function def(obj, key, val) {
  Object.defineProperty(obj, key, {
    enumerable: false,
    configurable: false,
    value: val,
  })
}

export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestory',
  'destoryed',
]
let strats = [];
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

// 生命周期函数合并方法
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal);
    }
    return [childVal];
  } else {
    return parentVal;
  }
}

// 组件的合并策略
function mergeAssets(parentVal, childVal) {
  let res = Object.create(parentVal); // res.__proto__ = parentVal;
  if (childVal) {
    for (let k in childVal) {
      res[k] = childVal[k];
    }
  }
  return res;
}
strats.components = mergeAssets;

// 合并option的方法（最开始合并的时候parent.options 一定是空对象）
export function mergeOptions(parent, child) {
  let options = {};
  // 遍历父亲
  for (let k in parent) {
    mergeFiled(k);
  }
  // 遍历子条件
  for (let k in child) {
    if (!parent.hasOwnProperty(k)) {
      mergeFiled(k);
    }
  }

  // 具体合并操作
  function mergeFiled(k) {
    console.log(typeof parent[k], typeof child[k], k, '68')
    if (strats[k]) {  // 是生命函数
      options[k] = strats[k](parent[k], child[k]);
    } else if (typeof parent[k] == 'object' || typeof child[k] == 'object') { // 说明是个对象,对象合并，以子条件为准。
      options[k] = { ...parent[k], ...child[k] }
    } else if (child[k]) { // 子属性存在，以子属性为准。
      options[k] = child[k];
    } else if (parent[k]) {
      options[k] = parent[k];
    }
  }

  return options;
}





// option 合并策略
// 生命周期函数：父子的合并为数组，生命周期时，数组中的函数依次执行。
// 其它父子都有的，子的代替父；父子各自有的，独立保存。