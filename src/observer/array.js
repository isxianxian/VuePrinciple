let oldArrayMethods = Array.prototype,
  arrayMethods = Object.create(oldArrayMethods);
// Object.create 原型链继承，创建一个对象，对象的__proto__指向参数对象。不用assign的原因是因为某些属性enumerable为false，不可枚举。
let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']
methods.forEach(item => {
  arrayMethods[item] = function (...arg) {
    console.log('使用了类似push的方法')
    let res = oldArrayMethods[item].apply(this, arg);

    // push,unsift,splice 添加的可能还是对象，要监听。
    let inserted,
      ob = this._ob;
    switch (item) {
      case 'push':
      case 'unshift':
        inserted = arg;
        break;
      case 'splice':
        inserted = arg.splice(2);
        break;
      default:
        break;
    }
    inserted ? ob.observerArray(inserted) : '';
    ob.dep.notify();  // 派发更新

    return res;
  }
})

export default arrayMethods;