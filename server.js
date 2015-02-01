var _ = require('lodash'),
    path = require('path'),
    connect = require('connect'),
    serveIndex = require('serve-index'),
    serveStatic = require('serve-static');

var serveMix = require('./middleware');

/**
 *
 * @param options
 * @param options.cwd 当前执行脚本的位置。决定了静态资源服务器的跟目录
 * @param options.port 服务器端口
 */
exports.start = function(options) {
    var app = connect();

    options = _.defaults(options || {}, {
        cwd: ".",
        port: 8000
    });

    var cwd = path.resolve(options.cwd);

//    app.use(require('less-middleware')(cwd));

    serveMix(app, options);

    app.use(serveStatic(cwd, {
        index: false
    }));

    app.use(serveIndex(cwd, {
        icons: true
    }));

    app.listen(options.port, function() {

//        if(options.noisy === true) {
//            cmdOpen('http://localhost:' + port, 'google chrome');
//        }

    });
};