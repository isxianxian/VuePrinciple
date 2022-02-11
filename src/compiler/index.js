// compileToFunctions 模板转换核心方法，将vue语法转换成render函数。render函数执行转化为dom元素。
import { parse } from './parse.js';

export function compileToFunctions(template) {
  // 1. 将template字符串转化为ast语法树。描述代码的html，css，js 结构。
  let ast = parse(template);
  console.log(ast, '7')

  // 2. 将ast语法树转化为render函数
}