(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

   function isObject(object) {
     return typeof object === 'object' && object !== null;
   }
   function def(obj, key, val) {
     Object.defineProperty(obj, key, {
       enumerable: false,
       configurable: false,
       value: val
     });
   }

   let oldArrayMethods = Array.prototype,
       arrayMethods = Object.create(oldArrayMethods); // Object.create 原型链继承，创建一个对象，对象的__proto__指向参数对象。不用assign的原因是因为某些属性enumerable为false，不可枚举。

   let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
   methods.forEach(item => {
     arrayMethods[item] = function (...arg) {
       console.log('使用了类似push的方法');
       let res = oldArrayMethods[item].apply(this, arg); // push,unsift,splice 添加的可能还是对象，要监听。

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
       }

       inserted ? ob.observerArray(inserted) : '';
       return res;
     };
   });

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
         data.__proto__ = arrayMethods; // 对数组中的对象进行监测===> 通过索引改变数组基本类型值视图没变化

         this.observerArray(data);
       } else {
         this.walk(data);
       }
     }

     observerArray(data) {
       for (let i = 0; i < data.length; i++) {
         observer(data[i]);
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

   } // 对data的每个属性都进行响应式设计


   function defineReactive(data, key, val) {
     observer(val);
     Object.defineProperty(data, key, {
       get() {
         console.log(`获取${key}属性值`);
         return val;
       },

       set(newVal) {
         // 依赖收集
         if (newVal == val) return;
         console.log('设置新的属性值');
         val = newVal;
         observer(newVal);
       }

     });
   } // 导出一个监听函数，用来监听data对象的属性变化。
   // 使用了defineProperty，此方法不兼容ie8及其以下版本，所以vue2不兼容ie8。


   function observer(data) {
     if (!isObject(data)) {
       return;
     } // 创建一个类进行数据劫持。


     new Observer(data);
   }

   function initState(vm) {
     const opts = vm.$options;

     if (opts.props) ;

     if (opts.data) {
       initData(vm);
     }

     if (opts.methods) ;

     if (opts.computed) ;

     if (opts.watch) ;
   }

   function initData(vm) {
     let data = vm.$options.data;
     vm._data = data = typeof data === 'function' ? data.call(vm) : data; // 监听data的变化来实时影响视图 ==> 数据影响视图。

     observer(data);
   }

   // 初始化js
   function initMixin(Vue) {
     Vue.prototype.init = function (option) {
       let vm = this;
       vm.$options = option; // 初始化实例状态

       initState(vm);
     };
   }
   /**
    *  实例初始化
    *      初始化状态 initState(vm)
    * 
    */

   function Vue(option) {
     this.init(option);
   }

   initMixin(Vue);

   return Vue;

}));
//# sourceMappingURL=vue.js.map
