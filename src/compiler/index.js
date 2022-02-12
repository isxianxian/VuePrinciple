// compileToFunctions 模板转换核心方法，将vue语法转换成render函数。render函数执行转化为dom元素。
import { parse } from './parse.js';
import { generate, gen } from './codegen.js';

export function compileToFunctions(template) {
  // 1. 将template字符串转化为ast语法树。描述代码的html，css，js 结构。
  let ast = parse(template);

  // 2. 将ast语法树转化为render字符串函数体
  let code = gen(ast);
  console.log(code, '11');

  // 3. 转换成render函数
  // let renderFn = new Function(`with(this){return ${code}}`)
  // return renderFn;

  // _c('div' , {id:'app'} , _v('hello'+_s(name)), _c('span',undefined,_v("world")) )
  // _c：创建一个元素，参数是元素，属性集合，子节点
  // _v: 创建普通文本，参数是文本字符串
  // _s：创建变量文本，先获取到变量，再用JSON.stringify将其转化为字符串



}

// new Function
//    let fn = new Function( 参数1, 参数2. 函数体字符串）==>函数的参数（或更确切地说，各参数的名称）首先出现，而函数体在最后。所有参数都写成字符串形式。fn 函数执行就是将参数传入函数体字符串执行。
//    这个方法与其它方法的不同点在于，函数通过在运行时传入 函数体字符串创建的。之前所有的声明都需要在脚本中编写功能代码。但 new Function 允许将所有的字符串转换为函数。意味着可以从服务器或者外界用户接收新函数然后执行。
// with
//    with(obj){ statements }，statements 语句执行。
//    使用with关键词关联obj对象，解析时，将statements 里面的变量都当作了局部变量；如果局部变量和obj对象中的属性同名，那局部变量就会指向obj中的属性。