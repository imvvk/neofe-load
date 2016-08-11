# neofe-load


neofe 工具的辅助延迟加载静态资源模块， 可以加载 js  css 等资源   

     npm install neofe-load 

### API 
 
`Config` 配置文件 
    
    base 默认 "/" ,加载模块的前缀路径 与module 的相对路径 组成完整路径  
    如果是模块发布到了 cdn 后 ，base 应该是 "http://cdn.domain";

`loadModule(moudle, callback)`  加载模块  [使用例子](https://github.com/imvvk/neofe-example/tree/master/lazy_load_demo)
    
    module {String or Array} 如果window.__Manifest__ 存在则会从里面取模块的版本号,  
    追加到module 
    callback {Function}  加载完module 后执行的回调函数

    //

    var neofeLoad = require("neofe-load");
    //如果用其他域名加载资源，需要修改Config.base
    //neofeLoad.Config.base = "//cdn.domain/";

    //导出文件地址 会和 neofeLoad.Config.base 拼接而成
    neofeLoad.loadModule("/src/scripts/depends/mod2.js", function() {
        //默认 expose 名为文件路径 
        //var subMod = require("src/scripts/depends/mod2.js");
        //配置expose
        var subMod = require("mod2.js");
        subMod.print();
    });




`load(url , callback)`  加载JS CSS 方法 , 加载完成后执行回调函数 loadModule 调用的方法 不会连接Config.base 
    
    url {String or Array}
    callback {Function} 回调函数  

    example : 
    load("xxx.js" , function() {
       //使用 xxx.js 的变量或者函数 
       
    });
       

