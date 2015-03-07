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
        this.client.compile();
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