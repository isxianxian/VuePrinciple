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

**异步更新渲染**  
当视图受数据影响重新更新渲染的时候，先将视图渲染着放到一个队列中，等所有数据都更新完毕了再去视图渲染，用到了异步操作。  
异步方法 nextTick 用几个异步操作的优雅降级。Promise，MutationObserver，setImmedlate，setTimeout。

**DomDiff**

patch 方法

```
  当生成虚拟VNode之后会挂载到实例上，通过判断实例VNode的存在判断是第几次渲染。
  当使用patch将虚拟节点转化为真实的dom后，会将新生成的真实dom替换之前的el属性，vm.$el。
  如果是第一次渲染，直接生成dom元素；
  如果不是第一次渲染的时候，如果新旧节点完全不一样就直接创建新元素替换旧元素。如果是一样的元素但都是文本，则复用元素，只是更改元素的textContent。如果是一样的元素且不是文本元素，则将新节点的属性更新到旧节点上，更新子元素。
```

尽可能少的操作 dom 元素，所以进行元素的对比复用。(对比复用，尽可能复用旧元素，将新元素属性更新到旧元素上，移动旧元素完成。)

```
  双指针方法。
  分为头和头对比，尾和尾对比，头和尾对比，尾和头对比。更新属性，改变位置。
  如果上述都不符合，利用oldCh创建一个key对应index的map对象。在这个对象中查找元素，查找到能复用，就将能复用的元素移动到指定位置，记住，移动后原有位置要置空undefined。如果没找到能复用的元素，就直接创建新元素然后移动。
  到循环完毕，新节点还有剩余，依次创建元素并插入。若老节点还有剩余，依次从指定位置删除。
```

> GlobalApi 全局 Api

**Mixin 混入原理**

```
  Mixin 方法是定义在Vue对象上的。==> 通过执行initGlobal方法，将Mixin方法挂到Vue对象上，且为Vue创建一个空对象属性options。

  Mixin 方法是将Vue.options 对象 和传入的mixins对象合并成一个大的options对象，挂到Vue上，实现条件混合，主要使用到mergeOption 方法。

  mergeOption 先循环父属性，再循环处理子有父没有的属性（hasOwnProperty 处理）。
  合并原则：
    如果是生命周期函数，则父子生命函数混合成一个数组，然后执行的时候按数组顺序执行（先父再子）。
    如果是组件components，则将对象的原型指向父亲的components，然后将子的组件循环放到对象上。（子组件优先！）
    如果是data，是函数就函数执行后的对象合并，是对象就直接对象合并。
    如果是对象（data，methods），则对象合并，父子若有同名属性，子属性值覆盖父属性值。
    如果是普通属性，合并处理，子有留子，父有留父，父子属性同名，子属性覆盖父属性。
```

**Extend 原理**  
Vue.extend 是一个用来创建子类的全局 api。

```
  let Sub = Vue.extend(options);创建一个子类。
  new Sub().$mount(el); 实例化子类并挂载到元素上渲染。
```

**Component 原理**

```
Vue.Component(id , definition);
使用Vue.extend方法创建一个子类，并把子类和id关联起来放到Vue.options.components对象中。

组件渲染
先整个页面节点生成VNode，VNode渲染过程中碰到组件Vnode，组件Vnode渲染成真实的元素，在放到整体Dom中。

组件的_c函数和普通元素没差别，只是在转化为VNode的时候，会根据组件生成组件VNode。
在VNode转换为真实dom的时候，如果是组件(VNode.data.hook.init),init方法执行实例化子类，并通过$mount生成dom元素。
（获取组件的template转化为_render,再VNode，再patch方法生成真实的Dom [组件实例上是没有$el的]挂载到组件实例的$el上)
将dom元素返回完成组件dom的转化。
```

**watch 侦听属性**

用法

```
  监听data中声明的值。
  可以写成字符串（变化后执行的方法名），函数，数组（变换后依次调用的函数），对象（对象中根据情况添加options来增强功能。deep：深度监听；immediate：初次渲染就执行监听方法。一般是监听到变化后才会执行。）
```

原理

```
  new Watcher(vm, exprOrFn, cb, options);

  watch监听的值必须是在data中声明的值。
  当options中有watch属性的时候，会去initWatch，创建数据的监听者。
  option.user为true来表示是用户的监听。
  此时exprOrFn 表示的是变量名，获取变量值的时候就会建立变量和监听的关系。
  当变量变化时，数据监听者就会执行update，执行run，run执行完毕就会执行cb回调函数。cb就是用户自己写的处理函数。

  this.value；this.before；this.deep；this.user；
```

**computed 计算属性**

```
  如果计算属性依赖的值不发生变化，页面更新的时候不会计算属性不会重新计算，计算结果会被缓存，可以利用此api优化性能。
  computed
```

**生命周期函数执行**

```
  在mergeOptions 后执行beforeCreate 函数。此时能从this.$options中获取到所有option的属性。
  在initState后执行 created函数。此时能从this获取到所有的属性，方法等原始条件。（数据劫持已经执行完）
  在mountComponent函数中，在初始渲染dom元素前执行 beforeMount函数，此时dom元素还没有渲染完。
  在new Watcher 后执行mounted函数，此时所有的dom渲染流程已经走完。（dom和数据的关联关系已建立；实例化Watcher是同步操作）
  在Watcher的run函数中执行beforeUpdate函数，update函数只是将视图放入更新列表，实际视图真正更新是执行run函数。
  在scheduler.js 中，所有待更新视图都更新后再执行updated函数。所有视图更新完成后复制视图列表循环执行，因为每个视图对应一个生命函数。
```
