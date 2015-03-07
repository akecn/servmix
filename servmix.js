var through2 = require('through2');
var mime = require('mime-types');
var minimatch = require('minimatch');

var Servmix = {
    rules: []
};

Servmix.pick = function(url, options, callback) {
    if(arguments.length === 2) {
        callback = options;
    }
    this.rules.push({
        options: options,
        filter: url,
        callback: callback
    });
};

Servmix.output = function(options) {
    var self = this;
    return through2.obj(function(file, enc, callback) {
        callback(null, file);
    }, function() {
        var filo = self._host;
        var contents = filo.output();

        if (contents) {

            filo.contents = contents;
            filo.ext = filo.ext || "." + mime.extension(mime.lookup(filo.files[0].path));

//            console.log(filo.ext, filo.files.map(function(f) {return f.path;}))
            self._callback(null, filo);
        } else {
            console.log('fail');
            self._callback(new Error('invalid file'));
        }

    });
};

Servmix.host = function(host, callback) {
    this._host = host;
    this._callback = callback;
};

Servmix.compile = function() {
    var filo = this._host;
    var rule;
    this.rules.forEach(function(r) {
        if(filo.files.some(function(file) {
            return minimatch(file.path, r.filter, {matchBase: true});
        })) {
            rule = r;
            return false;
        }
    });
    if(rule) {
        var result = rule.callback(filo.stream({
            filter: rule.filter
        }), filo);

        if(result && isStream(result)) {
            result.pipe(Servmix.output());
        }

    }else {
        this._callback(new Error('no match rule'));
    }
};

var Stream = require('stream').Stream;
function isStream(o) {
    return !!o && o instanceof Stream;
}

module.exports = Servmix;

Servmix.middleware = require('./middleware');

Servmix.server = require('./server');