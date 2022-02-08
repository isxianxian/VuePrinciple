(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
   typeof define === 'function' && define.amd ? define(factory) :
   (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

   function isObject(object) {
     return typeof object === 'object' && object !== null;
   }

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

   } // 对data的每个属性都进行响应式设计


   function defineReactive(data, key, val) {
     Object.defineProperty(data, key, {
       get() {
         return val;
       },

       set(newVal) {
         // 依赖收集
         if (newVal == val) return;
         console.log('属性值发生变化了');
         val = newVal;
       }

     });
   } // 导出一个监听函数，用来监听data对象的属性变化。
   // 使用了defineProperty，此方法不兼容ie8及其以下版本，所以vue2不兼容ie8。


   function observer(data) {
     console.log(isObject(data));

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
