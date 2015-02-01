## Servmix

a Server for html, and all the resource in html.

render all the resource which need compile with origin file. like less、coffee script etc. 
and handle `link/script` with extra resource content.

and you can custom the compile operation, with internal method to handle all the file content.

### usage

use `servmix` as static server.

```
(sudo) npm install servmix -g
servmix
```

use in express/connect.

```
var servmix = require('servmix');
var host = servmix.middleware(app, options);
host.add(patten, function(fileContent) {
    // handle file content
});
```

extend in nodejs.

```
var servmix = require('servmix');
```

### features（功能目标）

* mock数据。对于内部发起的请求可以统一接管转发。解决demo跨域问题。（nion）
* html页面渲染时，实时解析内部引用的资源（预编译文件）；实时根据规则处理页面中的节点。

### configure

#### server & middleware.config
```
{
    "port": "8000",
    
}
```

#### servmix.config
```
{
    "cwd": process.cwd(),
    "extension": "directory/path"
}
```

### reflect的问题

优点：
* 依托于def平台，好处是可以利用def提供的一切便利设施，也能为def plugin提供便利
* 在静态服务器的基础上更进一步，提供文件实时编译能力。

缺点：
* 只能运行在def环境。
* 对指定的静态资源请求实时编译，但也只是如此。扩展能力不足，定制需要修改内部代码。如果期望处理文件内外链的资源，需要额外实现文件编译。
* 虽然提供了实时编译能力，但本质上只是静态服务器，提供静态资源访问能力。引用资源的地址实际上与线上环境是不符的（可使用代理工具解决）。

### servmix的目标

* 主要提供html访问实时处理服务，可降级为静态资源服务器。
* 简单可依赖
* 核心提供基础框架，可配制编译/处理规则。
* html文件在开发和线上切换不需要修改资源路径。