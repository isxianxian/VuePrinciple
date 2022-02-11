// compileToFunctions 模板转换核心方法，将vue语法转换成render函数。render函数执行转化为dom元素。
import { parse } from './parse.js';
import { generate } from './codegen.js';

export function compileToFunctions(template) {
  // 1. 将template字符串转化为ast语法树。描述代码的html，css，js 结构。
  let ast = parse(template);

  // 2. 将ast语法树转化为render函数
  let code = generate(ast);
  console.log(code, '11');
  
  // _c('div' , {id:'app'} , _v('hello'+_s(name)), _c('span',undefined,_v("world")) )
  // _c：创建一个元素，参数是元素，属性集合，子节点
  // _v: 创建普通文本，参数是文本字符串
  // _s：创建变量文本，先获取到变量，再用JSON.stringify将其转化为字符串


  
}