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
       ob.dep.notify(); // 派发更新

       return res;
     };
   });

   // dep 每个属性都有自己的依赖。建立和watcher多对多的关系。
   let id$1 = 0;
   class Dep {
     constructor() {
       this.id = id$1++;
       this.subs = []; // 收集关联的watcher 
     }

     depend() {
       // 通知当前渲染的watcher去关联dep
       if (Dep.target) {
         Dep.target.addDep(this);
       }
     }

     addSub(watcher) {
       // dep关联watcher
       this.subs.push(watcher);
     }

     notify() {
       // 通知关联的watcher更新
       console.log('kkk');
       this.subs.forEach(watcher => watcher.update());
     }

   }
   Dep.target = null; // 全局变量，指向当前渲染的Watcher。

   const targetStack = []; // 栈结构用来存watcher

   function pushTarget(watcher) {
     targetStack.push(watcher); // 当渲染视图的时候，将当前视图监测器放到栈结构中。并全局声明当前渲染器。

     Dep.target = watcher;
   }
   function popTarget() {
     targetStack.pop(); // 当视图渲染结束，将视图监测器从栈结构拿出，并获取上一个watcher。

     Dep.target = targetStack[targetStack.length - 1];
   }

   class Observer {
     constructor(data) {
       // 当给数组添加一个属性时，是可以循环枚举出来的。为了避免递归，需要enumerable为false。
       // Object.defineProperties(data, '_ob', {
       //   enumerable: false,
       //   configurable: false,
       //   value: this,
       // })
       def(data, '_ob', this); // this 就是Observer实例

       this.dep = new Dep();

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
     let childOb = observer(val);
     let dep = new Dep(); // 检测的每个属性都实例化一个dep。

     Object.defineProperty(data, key, {
       get() {
         console.log(`获取${key}属性值`); // 获取值的时候如果有渲染视图，这时候就能将值和视图绑定起来。

         if (Dep.target) {
           dep.depend();
         }

         if (childOb) {
           childOb.dep.depend(); // 如果是数组，递归收集依赖

           if (Array.isArray(val)) {
             dependArray(val);
           }
         }

         return val;
       },

       set(newVal) {
         // 依赖收集
         if (newVal == val) return;
         console.log('设置新的属性值');
         observer(newVal);
         val = newVal;
         dep.notify(); // 当设置新值的时候，通知关联的watcher去更新
       }

     });
   } // 递归收集数组依赖


   function dependArray(val) {
     let e;

     for (let i = 0; i < val.length; i++) {
       e = val[i];
       e && e._ob && e._ob.dep.depend();

       if (Array.isArray(e)) {
         dependArray(e);
       }
     }
   } // 导出一个监听函数，用来监听data对象的属性变化。
   // 使用了defineProperty，此方法不兼容ie8及其以下版本，所以vue2不兼容ie8。


   function observer(data) {
     if (!isObject(data)) {
       return;
     } // 创建一个类进行数据劫持。


     return new Observer(data);
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

   function proxy(vm, key, source) {
     Object.defineProperty(vm, key, {
       get() {
         return vm[source][key];
       },

       set(newVal) {
         observer(newVal);
         vm[source][key] = newVal;
       }

     });
   }

   function initData(vm) {
     let data = vm.$options.data;
     vm._data = data = typeof data === 'function' ? data.call(vm) : data; // 监听data的变化来实时影响视图 ==> 数据影响视图。

     observer(data);

     for (let key in data) {
       proxy(vm, key, '_data'); // 数据代理，将data中的数据代理到实例对象上。
     }
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
     if (node.type == 1) {
       return generate(node);
     }

     let {
       text
     } = node; // 普通文本

     if (!defaultTagRE.test(text)) {
       return `_v(${JSON.stringify(text)})`;
     }

     let lastIndex = defaultTagRE.lastIndex = 0;
     let exec,
         tokens = [];

     while (exec = defaultTagRE.exec(text)) {
       let index = exec.index;

       if (index > lastIndex) {
         tokens.push(JSON.stringify(text.slice(lastIndex, index)));
       }

       tokens.push(`_s(${exec[1].trim()})`);
       lastIndex = index + exec[0].length;
     }

     if (lastIndex < text.length) {
       tokens.push(JSON.stringify(text.slice(lastIndex)));
     }

     let str = `_v(${tokens.join('+')})`;
     return str;
   }

   function genProps(attrs) {
     if (!attrs.length) return 'undefined';
     let str = '';

     for (let i = 0; i < attrs.length; i++) {
       let {
         name,
         value
       } = attrs[i];

       if (name == 'style') {
         let obj = {};
         value = value.split(';');
         value.map(item => {
           if (item) {
             let [key, val] = item.split(':');
             obj[key] = val;
           }
         });
         value = obj;
       }

       value = JSON.stringify(value);
       str += `${name}:${value},`;
     }

     str = `{${str.slice(0, str.length - 1)}}`;
     return str;
   }

   function getChildren(childrens) {
     if (!childrens.length) return '';
     return childrens.map(child => gen(child)).join(',');
   } // 元素节点


   function generate(node) {
     let {
       tagName,
       attrs,
       childrens
     } = node;
     return `_c('${tagName}' ,${genProps(attrs)},${getChildren(childrens)})`;
   }

   // compileToFunctions 模板转换核心方法，将vue语法转换成render函数。render函数执行转化为dom元素。
   function compileToFunctions(template) {
     // 1. 将template字符串转化为ast语法树。描述代码的html，css，js 结构。
     let ast = parse(template); // 2. 将ast语法树转化为render字符串函数体

     let code = generate(ast); // 3. 转换成render函数

     let renderFn = new Function(`with(this){return ${code}}`);
     return renderFn; // _c('div' , {id:'app'} , _v('hello'+_s(name)), _c('span',undefined,_v("world")) )
     // _c：创建一个元素，参数是元素，属性集合，子节点
     // _v: 创建普通文本，参数是文本字符串
     // _s：创建变量文本，先获取到变量，再用JSON.stringify将其转化为字符串
   } // new Function
   //    let fn = new Function( 参数1, 参数2. 函数体字符串）==>函数的参数（或更确切地说，各参数的名称）首先出现，而函数体在最后。所有参数都写成字符串形式。fn 函数执行就是将参数传入函数体字符串执行。
   //    这个方法与其它方法的不同点在于，函数通过在运行时传入 函数体字符串创建的。之前所有的声明都需要在脚本中编写功能代码。但 new Function 允许将所有的字符串转换为函数。意味着可以从服务器或者外界用户接收新函数然后执行。
   // with
   //    with(obj){ statements }，statements 语句执行。
   //    使用with关键词关联obj对象，解析时，将statements 里面的变量都当作了局部变量；如果局部变量和obj对象中的属性同名，那局部变量就会指向obj中的属性。
   // 模板编译生成render

   // patch 是用来渲染和更新视图的。
   function patch(oldVnode, vnode) {
     let isRealElement = oldVnode.nodeType;

     if (isRealElement) {
       // 先将虚拟节点转化为真实的dom元素
       // 利用原来元素的位置插入生成的真实dom元素（父节点，兄弟节点，insertBefore）
       // 再删除原来元素
       let oldEle = oldVnode;
       let parentEle = oldEle.parentNode;
       let el = createElement$1(vnode);
       parentEle.insertBefore(el, oldEle.nextSibling); // 使用insertBefore是为了不破换位置。

       parentEle.removeChild(oldEle);
       return el;
     }
   }

   function createElement$1(vnode) {
     let {
       tag,
       data,
       key,
       children,
       text
     } = vnode;

     if (typeof tag == 'string') {
       // 元素节点
       vnode.el = document.createElement(tag);
       updateProperties(vnode); // 更新属性

       children ? children.forEach(child => {
         return vnode.el.appendChild(createElement$1(child)); // appendChild 插入一个子元素。返回插入的元素。
       }) : '';
     } else {
       // 文本节点
       vnode.el = document.createTextNode(text);
     }

     return vnode.el;
   }

   function updateProperties(vnode) {
     let {
       el,
       data: newProps = {}
     } = vnode;

     for (let attr in newProps) {
       let val = newProps[attr];

       if (attr == 'style') {
         for (let styleName in val) {
           el.style[styleName] = val[styleName];
         }
       } else if (attr == 'class') {
         el.className = val;
       } else {
         el.setAttribute(attr, val);
       }
     }
   }

   // nextTick 实现原理
   let callbacks = [];
   let pending = false;

   function flushCallbacks() {
     // 同步任务，callbacks中的函数依次执行。
     pending = false;

     for (let i = 0; i < callbacks.length; i++) {
       callbacks[i]();
     }
   }

   let timerFunc; // 定义异步方法，优雅降级（优先级，有啥用啥）

   if (typeof Promise !== "undefined") {
     const p = Promise.resolve();

     timerFunc = () => {
       p.then(flushCallbacks);
     };
   } else if (typeof MutationObserver !== 'undefined') {
     // MutationObserver 监听dom变化。 当dom发生变化，执行回调函数，也是个异步。
     let counter = 1;
     const textNode = document.createTextNode(String(counter));
     const observer = new MutationObserver(flushCallbacks);
     observer.observe(textNode, {
       characterData: true
     });

     timerFunc = () => {
       // 通过改变dom元素的data值来触发监听函数
       counter = (counter + 1) % 2;
       textNode.data = counter;
     };
   } else if (typeof setImmediate !== 'undefined') {
     timerFunc = () => {
       setImmediate(flushCallbacks);
     };
   } else {
     timerFunc = () => {
       setTimeout(flushCallbacks, 0);
     };
   }

   function nextTick(cb) {
     callbacks.push(cb);

     if (!pending) {
       // 此时没有执行异步任务，手动调用；如果已经在执行异步了，cb在callbacks中等待执行即可。
       pending = true;
       timerFunc();
     }
   }

   let queue = []; // 队列数组

   let has = {}; // 执行队列中的方法

   function flushScheduleQueue() {
     for (let i = 0; i < queue.length; i++) {
       queue[i].run();
     }

     queue = [];
     has = {};
   } // 把watcher放到队列中，等所有数据更新完成后再视图刷新


   function queueWatcher(watcher) {
     let id = watcher.id;

     if (has[id] === 'undefined') {
       has[id] = true;
       queue.push(watcher);
       nextTick(flushScheduleQueue);
     }
   }

   // Watcher 监听者 当数据变化的时候指挥watcher去执行某些方法来更新。
   let id = 0;
   class Watcher {
     constructor(vm, exprOrFn, cb, options) {
       this.vm = vm;
       this.exprOrFn = exprOrFn; // 当前的视图渲染函数

       this.cb = cb; // 回调函数，比如可以在更新update之前执行beforeUpdate方法

       this.options = options; // 额外的选项 true代表渲染watcher

       this.id = id++; // watcher唯一的标识

       this.deps = []; // 存放有关的dep的容器

       this.depsId = new Set(); // 用来去重id

       if (typeof exprOrFn === 'function') {
         this.getter = exprOrFn;
       }

       this.get(); // 实例化Watcher的时候get执行，渲染视图。
     }

     get() {
       pushTarget(this); // 视图渲染前将当前watcher放到全局中。表示watcher监测的组件正在渲染。

       this.getter(); // 视图渲染函数执行。

       popTarget(); // 视图渲染完将当前watcher移除。
     }

     addDep(dep) {
       let id = dep.id; // 如果watcher关联的deps中没有，才把这个加入到deps集合中，才通知dep去关联watcher

       if (!this.depsId.has(id)) {
         this.depsId.add(id); // new Set的方法：has add

         this.deps.push(dep);
         dep.addSub(this);
       }
     }

     update() {
       // 视图更新方法
       queueWatcher(this);
     }

     run() {
       //视图重新渲染
       this.get();
     }

   }

   // 生命周期js函数
   function lifecycleMixin(Vue) {
     Vue.prototype._update = function (vnode) {
       const vm = this;
       return patch(vm.$el, vnode); // 将虚拟节点转换为真实dom元素渲染到页面上。
     };
   }
   function mountComponent(vm, el) {
     // 把真实的el选项赋值给示例的$el属性，为之后新dom替换旧dom做铺垫。
     vm.$el = el; // 渲染视图的核心方法

     let updateComponent = () => {
       let node = vm._render();

       vm.$el = vm._update(node); // render 函数执行生成虚拟dom；
       // update 函数执行将虚拟dom转成真实的dom元素渲染到页面上。
     }; // 渲染一次视图就创建一个视图渲染监视器Watcher(实际的视图渲染在实例化watcher里面)


     new Watcher(vm, updateComponent, null, true);
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
       } // 组件挂载的核心方法。把当前的组件示例挂载到真试的dom元素上。


       return mountComponent(vm, el);
     };
   }
   /**
    *  实例初始化
    *      初始化状态 initState(vm)
    *        包括initDate:数据劫持
    * 
    */

   // 定义虚拟节点
   class Vnode {
     constructor(tag, data, key, children, text) {
       this.tag = tag;
       this.data = data;
       this.key = key;
       this.children = children;
       this.text = text;
     }

   }
   function createElement(tag, data = {}, ...children) {
     // 除了tag和data，其余的都是子元素
     let {
       key
     } = data;
     return new Vnode(tag, data, key, children, undefined);
   }
   function createTextNode(text) {
     //  字符串 'undefined' 和 undefined 是不一样的！
     return new Vnode(undefined, undefined, undefined, undefined, text);
   }

   function renderMixin(Vue) {
     // 将_render 方法绑定到vue的原型上。
     Vue.prototype._render = function () {
       const vm = this;
       const {
         render
       } = vm.$options;
       return render.call(vm); // render 函数执行返回虚拟dom。注意函数中this的指向。
     };

     Vue.prototype._c = function (...arg) {
       // 创建虚拟dom元素
       return createElement(...arg);
     };

     Vue.prototype._v = function (text) {
       // 创建虚拟文本元素
       return createTextNode(text);
     };

     Vue.prototype._s = function (val) {
       return val == null ? '' : typeof val == 'object' ? JSON.stringify(val) : val;
     };

     Vue.prototype.$nextTick = nextTick; // 手动调用异步方法。
   }

   function Vue(option) {
     this.init(option);
   }

   initMixin(Vue); // 绑定初始化方法

   renderMixin(Vue); // 绑定render渲染方法

   lifecycleMixin(Vue); // 绑定生命周期函数

   return Vue;

}));
//# sourceMappingURL=vue.js.map
