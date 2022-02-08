import babel from 'rollup-plugin-babel';

export default{
    input:'./src/index.js', 
    output:{
        file:"dist/vue.js",
        format:'umd', // 常见格式：IIFE（自执行函数，如jq，使用script引入） ESM CJS UMD 等等
        name:'Vue', // umd格式下需要配置name，会将导出的模块放到window上。
                    // 如果在node使用，用cjs形式；如果只是打包到webpack中使用，用esm形式；如果是在前端 script使用，用iife形式。
        sourcemap:true, //代码映射，可以在编译后的es5语法中找到原生es6写法处
    },
    plugins:[
        babel({
            exclude:"node_modules/*", // 引入Babel插件转义，但是不包含node_modules下的文件。
        }),
        process.env.ENV =='development'? serve({
            open:true,
            openPage:'/public/index.html',
            port:3000,
            contentBase:'', // 以当前文件夹为路径启动服务
        }):""
    ]
}


// rollup -c -w ：运行脚本 => rollup 执行 -c表示配置文件config -w表示监听文件变化watch  