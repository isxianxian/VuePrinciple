import {observer} from './observer/index.js';

// 初始化状态js
export function initState(vm){
    const opts = vm.$options;
    if(opts.props){
        initProps(vm);
    }
    if(opts.data){
        initData(vm);
    }
    if(opts.methods){
        initMethods(vm);
    }
    if(opts.computed){
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm);
    }
}

function initProps(vm){};
function initData(vm){
    let data = vm.$options.data;
    vm._data = data = typeof data === 'function'?data.call(vm):data;
    // 监听data的变化来实时影响视图 ==> 数据影响视图。
    observer(data);
};
function initMethods(vm){};
function initComputed(vm){};
function initWatch(vm){};