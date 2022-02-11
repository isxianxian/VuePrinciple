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

   // 以下为源码的正则  
   const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123

   const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无

   const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名

   const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >

   const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名

   const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

   let root,
       // 根元素
   currentParent,
       // 当前父元素
   stack = []; // 元素堆栈

   const TEXT_TYPE = 3;
   const ELEMENT_TYPE = 1;

   function handleChars(text) {
     // 文本去掉空格
     text = text.replace(/\s/g, '');

     if (text) {
       currentParent.childrens.push({
         text,
         type: TEXT_TYPE
       });
     }
   } // 处理开始标签


   function handleStartTag({
     tagName,
     attrs
   }) {
     let element = createASTElement({
       tagName,
       attrs
     });

     if (!root) {
       root = element;
     }

     currentParent = element;
     stack.push(element);
   } // 处理结束标签


   function handleEndTag() {
     let element = stack.pop();
     currentParent = stack[stack.length - 1];

     if (currentParent) {
       element.parent = currentParent;
       currentParent.childrens.push(element);
     }
   } // 创建元素的ast结构


   function createASTElement({
     tagName,
     attrs
   }) {
     return {
       tagName,
       attrs,
       type: ELEMENT_TYPE,
       childrens: [],
       parent: null
     };
   }

   function parse(html) {
     while (html) {
       let htmlIndex = html.indexOf('<');

       if (htmlIndex == 0) {
         let match = parseStartTag();

         if (match) {
           handleStartTag(match);
           continue;
         }

         let endTagMatch = html.match(endTag);

         if (endTagMatch) {
           advance(endTagMatch[0].length);
           handleEndTag();
           continue;
         }
       }

       let text;

       if (htmlIndex >= 0) {
         text = html.substring(0, htmlIndex);
       }

       if (text) {
         advance(htmlIndex);
         handleChars(text);
       }
     }

     return root; // 处理开始标签

     function parseStartTag() {
       let start = html.match(startTagOpen); // match 的返回值是数组或null

       if (start) {
         let match = {
           tagName: start[1],
           attrs: []
         };
         advance(start[0].length);
         let attr, end; // && 有执行优先级的。

         while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
           advance(attr[0].length);
           attr = {
             name: attr[1],
             value: attr[3] || attr[4] || attr[5]
           };
           match.attrs.push(attr);
         }

         if (end) {
           advance(end[0].length);
         }

         return match;
       }
     } // 字符串前进n个


     function advance(n) {
       html = html.substring(n);
     }
   }

   const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容
   // 解析节点

   function gen(node) {
     let {
       type
     } = node;

     if (type == 1) {
       // 如果是元素的话，直接创建一个元素字符串
       return generate(node);
     } // 文本，需要判断是普通文本还是{{ 变量 }}


     let {
       text
     } = node;

     if (!defaultTagRE.test(text)) {
       return `_v(${JSON.stringify(text)})`;
     } // 重置正则匹配位置


     let lastIndex = defaultTagRE.lastIndex = 0;
     let tokens = [];
     let match, index;

     while (match = defaultTagRE.exec(text)) {
       index = match.index;

       if (index > lastIndex) {
         tokens.push(JSON.stringify(text.slice(lastIndex, index)));
       }

       tokens.push(`_s(${match[1].trim()})`);
       lastIndex = index + match[0].length;
     }

     if (lastIndex < text.length) {
       tokens.push(JSON.stringify(text.slice(lastIndex)));
     }

     let s = `_v(${tokens.join('+')})`;
     return s;
   }

   function genProps(attrs) {
     if (!attrs.length) return 'undefined';
     let obj = {};

     for (let i = 0; i < attrs.length; i++) {
       let {
         name,
         value
       } = attrs[i];

       obj[name] = value;
     }

     return obj;
   }

   function getChildren(el) {
     let {
       childrens
     } = el;
     if (!childrens.length) return ""; // 如果没有子元素，返回空字符串

     let res = childrens.map(child => {
       return gen(child);
     });
     return res.join(',');
   }

   function generate(el) {
     let children = getChildren(el);
     let attr = genProps(el.attrs);
     return `_c('${el.tagName}' , ${attr} , ${children})`;
   }

   // compileToFunctions 模板转换核心方法，将vue语法转换成render函数。render函数执行转化为dom元素。
   function compileToFunctions(template) {
     // 1. 将template字符串转化为ast语法树。描述代码的html，css，js 结构。
     let ast = parse(template); // 2. 将ast语法树转化为render函数

     let code = generate(ast);
     console.log(code, '11'); // _c('div' , {id:'app'} , _v('hello'+_s(name)), _c('span',undefined,_v("world")) )
     // _c：创建一个元素，参数是元素，属性集合，子节点
     // _v: 创建普通文本，参数是文本字符串
     // _s：创建变量文本，先获取到变量，再用JSON.stringify将其转化为字符串
   }

   // 初始化js
   function initMixin(Vue) {
     Vue.prototype.init = function (options) {
       let vm = this;
       vm.$options = options; // 初始化实例状态

       initState(vm);

       if (vm.$options.el) {
         vm.$mount(vm.$options.el);
       }
     }; // 元素渲染 render函数>template>el


     Vue.prototype.$mount = function (el) {
       const vm = this;
       const options = vm.$options;
       el = document.querySelector(el); // 传入的 el 或者 template 选项最后都会被解析成 render 函数,这样才能保持模板解析的一致性。

       if (!options.render) {
         let template = options.template;

         if (!template && el) {
           template = el.outerHTML;
         }

         if (template) {
           // compileToFunctions 模板转换核心方法
           const render = compileToFunctions(template);
           options.render = render;
         }
       }
     };
   }
   /**
    *  实例初始化
    *      初始化状态 initState(vm)
    *        包括initDate:数据劫持
    * 
    */

   function Vue(option) {
     this.init(option);
   }

   initMixin(Vue);

   return Vue;

}));
//# sourceMappingURL=vue.js.map
