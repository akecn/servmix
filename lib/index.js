/**
 * @file
 * Created by wuake on 2015-01-30
 */
var fs = require('fs'),
    path = require('path');

var _ = require('lodash'),
    minimatch = require('minimatch'),
    through2 = require('through2'),
    utils = require('./utils'),
    Filo = require('filo');

var logger = utils.getLogger('servmix');

var configure = require('./configure.json');

var vm = require('vm');

//var ServmixClient = {
//    rules: []
//};
//
//ServmixClient.pick = function(url, callback) {
//    this.rules.push({
//        params: url,
//        callback: callback
//    });
//};
//
//ServmixClient.output = function(options) {
//    var self = this;
//    return through2.obj(function(file, enc, callback) {
////        console.log('output:', file);
//        callback(null, file);
//    }, function() {
//        self.trigger(self._host);
////        console.log('all done', self._host);
//    });
//};
//
//ServmixClient.host = function(host, trigger) {
//    this._host = host;
//    this.trigger = trigger;
//};

function Servmix(options) {

    this.options = _.defaults(options || {}, {
        cwd: process.cwd()
    }, configure);

    var filePath = path.join(process.cwd(), "servfile");
    this.client = require(filePath);
//    var content = fs.readFileSync(filePath).toString();
//    console.log(vm.runInNewContext(content));
//    var client = new Function("servmix", content);
//    client(ServmixClient);

//    console.log(ServmixClient);

}

_.assign(Servmix.prototype, {
    /**
     * compile the file use opposite parser
     * @param url <String>
     * @param callback
     */
    compile: function (url, callback) {
        var options = this.options;

        var filo = new Filo(url, {
            cwd: options.cwd
        });

        this.client.host(filo, callback);
        var rule = this.client.rules[0];

        var stream = through2.obj();

        var ext;
        switch(url) {
            case url.indexOf('.css') !== -1:
                ext = ".css";
                break;
            case url.indexOf('.js') !== -1:
                ext = ".js";
                break;
            default:
                ext = path.extname(url);
                break;
        }

        filo.stream(function(file, enc, cb) {

            stream.write(file);

            if(ext === ".css") {
                file.ext = ".less";

                require('less').render(file.toString(), {
                    path: file.url
                }, function (err, output) {
                    if (err) {
                        cb(err);
                        return;
                    }

                    file.contents = new Buffer(output.css);
                    file.ext = ext;

                    cb(null, file);
                });
            }else if(ext === ".js") {

                var wrapper = "amd",
                    tpl = "{{contents}}";

                if(wrapper !== undefined) {
                    switch(wrapper) {
                        case "amd":
                            tpl = "define(function(require, exports, module) {\n{{contents}}\n});"
                            break;
                        case "kmd":
                            tpl = "KISSY.add(function(S, require, exports, module) {\n{{contents}}\n});"
                            break;
                    }
                }

                var compiled = utils.template(tpl);

                file.contents = new Buffer(compiled({
                    contents: file.toString()
                }));

                cb(null, file);
            }else {

                cb(null, file);
            }

        }, function() {

            stream.end();
            rule.callback(stream);

        });
    }
});

module.exports = Servmix;

// private method ================================
/**
 * get all the parsers in directory
 * @param dirPath <String> the directory.
 * @param options
 * @param options.cwd <String> cwd of dirPath
 */
function getParsersFromDir(dirPath, options) {
    if(!dirPath) return;

    options = _.defaults(options || {});

    dirPath = path.join(options.cwd, dirPath);

    if(!fs.existsSync(dirPath)) {
        return;
    }

    var files = fs.readdirSync(dirPath),
        compilers = {};

    _.each(files, function(file) {
        var fileNameWithoutExt = path.basename(file, '.js');

        // only *.js file
        if(file !== fileNameWithoutExt) {
            var name = path.resolve(dirPath, fileNameWithoutExt);
            var module = require(name);

            if(module.compile) {
                module.__name = fileNameWithoutExt;
                compilers[fileNameWithoutExt] = module;
            }
        }
    });

    return compilers;
}