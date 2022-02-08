import {initMixin} from './init.js';


function Vue(option){
    this.init(option);
}

initMixin(Vue);



export default Vue;