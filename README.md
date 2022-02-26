**Rollup**  
js 模块打包器，可以将小块代码编译成大块复杂的代码。一般在开发应用的时候用 webpack，在开发库的时候用 Rollup。  
@babel/core(babel 核心模块)； @babel/present-env(babel 将高级语法转换为低级语法)；  
rollup-plugin-babel(babel 和 rollup 的桥梁)；rollup-plugin-serve（实现静态服务）；  
cross-env (设置环境变量)

# Vue

<font color='red'>在 new Vue 这个类产生实例的过程中，你需要知道发生了哪些事情，事情的发生顺序是什么样子的；实例上有哪些方法和属性，能做哪些事情，你能怎么去使用他们。</font>

**index.js**  
Vue 整个流程，方法汇总的 js 文件。

**init.js**  
Vue 初始化 js

**observer**  
数据劫持

## 原理

**初始渲染**  
通过 template 或 el 的 innerHTML 生成 render 函数；

```
  生成ast语法树；再将ast语法树转化为render函数；
  render 函数通过_c（创建元素虚拟节点），_v（创建文本虚拟节点），_s（获取变量，通过with 和 将data数据代理到this实例上） 组成。
```

render 函数执行生成虚拟节点；

```
  虚拟节点 vnode（节点实例，有tag，key，data，children，text属性）。
```

\_update 函数执行将虚拟节点转化为真实的 dom 元素渲染到页面；

```
  通过tag判断是元素还是文本。
  元素：createElement。添加属性（style[key] = val；className；setAttribute）；children递归创建元素并通过appendChild添加到父元素上。
  文本：createTextNode。
```

**更新渲染**  
每个组件渲染的时候都会有创建一个视图渲染监视者 watcher；每个被检测的数据被获取时候都会创建一个依赖收集者 dep（收集相关 watcher）。  
有一个堆来依次存储视图渲染监视者 watcher，有一个全局变量 Dep.target 来全局声明当前渲染的视图。  
当组件被渲染时，先会将自身视图渲染者放到堆中，再将全局视图渲染监视者赋值给 Dep.target 全局变量。===>pushTarget()  
当组件被渲染完毕，就会从堆中删除当前视图渲染者，并将全局视图渲染监视者还给上个未被渲染完的视图渲染者。===>popTarget()  
当数据被获取使用且存在全局视图渲染监视者的时候，表明这个数据和这个视图有关，所以 dep 和 watcher 相互收集对方。===>dep.depend();  
当数据被修改的时候，就会去通知有关的视图渲染监视者去更新。===>dep.notify();  
注意，当属性值是对象的时候，表示里面的值和当前渲染组件也有关系，也需要建立数据和视图的联系。===>childOb.depend()

##### **数组依赖收集和依赖派放**

数据劫持：当属性值为数组的时候，需要对其中的对象继续数据和视图的联系，并且如果是多层数组的时候，要注意递归建立联系。
数组的依赖派放除了获取数据时，还要注意数组使用 push 等方法时。
