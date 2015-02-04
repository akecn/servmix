/**
 * @file
 * Created by wuake on 2015-01-30
 */
var fs = require('fs'),
    path = require('path');

var _ = require('lodash'),
    minimatch = require('minimatch'),
    utils = require('./utils'),
    Filo = require('filo');

var logger = utils.getLogger('servmix');

var configure = require('./configure.json');

var compilerMap = getParsersFromDir("./parsers/", {
    cwd: __dirname
}) || {};


function Servmix(options) {

    this.options = _.defaults(options || {}, {
        cwd: process.cwd()
    }, configure);

}

_.assign(Servmix.prototype, {
    /**
     * compile the file use opposite parser
     * @param url <String>
     * @param callback
     */
    compile: function (url, callback) {
        var options = this.options;

        var rules = options && options.rules;

        var cb = function(content) {
            if(content) {
                callback(null, content, filo.contentType);
            }else {
                callback(new Error('invalid'));
            }
        };

        if(!rules || rules.length === 0) {
            cb();
            return;
        }

        var filo = new Filo(url, {
            cwd: options.cwd
        });

        var tasks;
        rules.forEach(function(rule) {
            var expression = rule.expression,
                _tasks = rule.tasks;

            // todo filo.test
            var filePath = filo.getFiles()[0];

            if(_tasks && _tasks.length && minimatch(filePath, expression)) {
                tasks = [].concat(_tasks);

                logger.trace('url:"%s" match tasks [%s]', url, tasks);

                return false;
            }
        });

        if(tasks) {

            var task;
            // xxx resolve multiple task callback
            function next(content) {
                filo.content = content;

                task = tasks.shift();
console.log('task %s', task);
                if(!task) {
                    cb(content);
                    return;
                }

                var compiler = compilerMap[task];

                if(compiler && _.isFunction(compiler.compile)) {

                    var config = options.configure[compiler.__name];
                    compiler.compile(filo, config, next);

                }else {
                    logger.trace('no compile of %s', task);
                    next(content);
                }
            }

            next();

        }else {

            if (filo.isAvailable()) {

                cb(filo.output());

            } else {

                cb();
            }
        }

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