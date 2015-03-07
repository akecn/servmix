var through2 = require('through2');
var minimatch = require('minimatch');
var path = require('path');
var fs = require('fs');

var Stream = require('stream').Stream;
function isStream(o) {
    return !!o && o instanceof Stream;
}

function fetchDefaultRules() {
    // todo should fetch servfile config from process.cwd()
    var cfgPath = path.join(__dirname, "configure.js");
    var configure;
    if(fs.existsSync(cfgPath)) {
        configure = require(cfgPath);
    }

    return configure.rules;
}

function fetchRules(options) {
    return fetchDefaultRules();
}

var Client = function(options) {
    this.rules = fetchRules(options) || [];
};

// return the first match rule.
Client.prototype.getRule = function(filo) {
    var rule;
    this.rules.forEach(function(r) {
        if(filo.files.some(function(file) {
            return minimatch(file.path, r.filter, {matchBase: true});
        })) {
            rule = r;
            return false;
        }
    });

    return rule;
};

Client.prototype.compile = function(filo, callback) {

    var rule = this.getRule(filo);
    if(!rule) {
        callback(new Error('mismatch rule'));
        return;
    }

    var result = rule.dispose(filo.stream({
        filter: rule.filter
    }), filo);

    if (result && isStream(result)) {
        result.pipe(through2.obj(function(file, enc, cb) {

            cb(null, file);
        }, function() {

            var contents = filo.output();

            if (contents) {

                filo.contents = contents;
                callback(null, filo);
            } else {
                callback(new Error('invalid file'));
            }
        }));
    }
};

Client.rules = [];
Client.request = function(url, callback) {

    Client.rules.push({
        filter: url,
        dispose: callback
    });
};

module.exports = Client;