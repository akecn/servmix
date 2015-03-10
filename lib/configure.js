var through2 = require('through2'),
    path = require('path'),
    fs = require('fs'),
    findup = require('findup-sync'),
    _ = require('lodash');
var utils = require('./utils');

var defaultExtensions = readExtensions('extensions', {cwd: __dirname});

function readExtensions(dir, options) {
    options || (options = {});

    var cwd = options.cwd || process.cwd();

    dir = path.join(cwd, dir);

    var rt = {};
    if(!fs.existsSync(dir)) return rt;

    var stat = fs.statSync(dir);

    if(stat.isDirectory()) {

        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            var fullPath = path.join(dir, file),
                ext = path.extname(fullPath);

            if (ext !== ".js") return;

            var name = path.basename(fullPath, ext);

            try {
                var stat = fs.statSync(fullPath);

                if (stat.isFile()) {
                    rt[name] = require(fullPath);
                }
            } catch (ex) {
                console.log('error %s', ex.message);
            }
        });
    }else {
        try {
            rt = require(dir) || {};
        }catch(ex) {}
    }

    return rt;
}

function fetchJSONCfg(cwd) {
    var cfgPath = findup('servmix.json', {cwd: cwd});

    try {
        var cfg = fs.readFileSync(cfgPath);
        return JSON.parse(cfg);
    }catch(ex) {}
}

function fetchJSCfg(cwd) {
    var cfgPath = findup('servmix.js', {cwd: cwd});
    if(cfgPath) {
        var client = require(cfgPath);
        return client.rules;
    }
}

/**
 * generate rules
 */
function Configure(options, context) {
    options || (options = {});

    var cwd = this.cwd = options.cwd || process.cwd();
    this.extensions = {};
    this.context = context;

    this.extend(defaultExtensions);

    var jsRules = fetchJSCfg(cwd);
    this.rules = jsRules || [];

    var cfg = fetchJSONCfg(cwd);
    if(cfg) {
        if (cfg.extend) {
            var extensions = readExtensions(cfg.extend, {
                cwd: cwd
            });
            this.extend(extensions);
        }

        var rules = cfg.rules;
        rules.forEach(function (rule) {
            this.add(rule);
        }.bind(this));
    }
}

Configure.prototype.extend = function(map) {
    if(!map) return;

    var extensions = this.extensions;

    for(var name in map) {
        if(map.hasOwnProperty(name)) {
            extensions[name] = map[name];
        }
    }
};

Configure.prototype.add = function(rule) {
    this.rules.push({
        globs: rule.globs,
        dispose: this.factory(rule.tasks)
    });
};

Configure.prototype.factory = function(tasks) {
    var getStream = this.getStreamByExtName.bind(this);

    if(!Array.isArray(tasks)) {
        tasks = [tasks];
    }

    return function(stream, filo) {
console.log(tasks);
        return tasks.reduce(function(prevStream, current) {
            var currStream = getStream(current, filo);

            if(!currStream) {
                return prevStream;
            }

            return prevStream.pipe(currStream);

        }, stream);

    };
};

Configure.prototype.getStreamByExtName = function(name, filo) {
    var extension,
        cfg;

    if(typeof name === "object") {
        cfg = _.clone(name);
        name = cfg.name;
        delete cfg.name;
    }

    extension = this.extensions[name];

    return extension && extension(filo, cfg, this.context);
};

module.exports = Configure;