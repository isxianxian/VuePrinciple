// 初始化js
import {initState} from './state';

export function initMixin(Vue){
    Vue.prototype.init = function(option){
        let vm = this;
        vm.$options = option;

        // 初始化实例状态
        initState(vm);
    }
}




/**
 *  实例初始化
 *      初始化状态 initState(vm)
 * 
 */