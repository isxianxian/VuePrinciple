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
