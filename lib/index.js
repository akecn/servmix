/**
 * @file
 * Created by wuake on 2015-01-30
 */
var fs = require('fs'),
    path = require('path'),
    URL = require('url');

var _ = require('lodash'),
    mime = require('mime-types'),
    findupSync = require('findup-sync'),
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

        var filo = new Filo(url, {
            cwd: options.cwd
        });

        var cb = function(content) {
            if(content) {
                callback(null, content, filo.contentType);
            }else {
                callback(new Error('invalid'));
            }
        };

        var type = filo.mimeType,
            compiler = type && compilerMap[type];

        if (type && compiler && _.isFunction(compiler.parse)) {

            var config = options.parsers[compiler.name];

            compiler.parse(filo, config, cb);

        } else {
            type && logger.warn('can not found parser of "%s" file.', type)

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
            var module = require(name),
                mimeType = module.type;

            if(mimeType && module.compile) {
                compilers[mimeType] = {
                    mime: mimeType,
                    parse: module.compile,
                    name: fileNameWithoutExt
                };
            }
        }
    });

    return compilers;
}