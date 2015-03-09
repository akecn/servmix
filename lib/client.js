var through2 = require('through2');
var minimatch = require('minimatch');
var utils = require('./utils');
var Configure = require('./configure');

var Client = function(options) {
    var cfg = new Configure(options);
    this.rules = cfg.rules;
};

// return the first match rule.
Client.prototype.getRule = function(filo) {
    var rule;
    this.rules.forEach(function(r) {

        if(filo.files.some(function(file) {

            return matchGlobs(file.path, r.globs, {matchBase: true});
        })) {

            rule = r;
            return false;
        }
    });

    return rule;
};

function matchGlobs(filePath, globs, options) {
    if(!globs ||
        (Array.isArray(globs) && globs.length === 0)
        ) {
        return true;
    }

    if(!Array.isArray(globs)) {
        globs = [globs];
    }

    var positives = globs.filter(isPositive),
        negatives = globs.filter(isNegative);

    if(positives.length === 0) return false;

    // if match the exclude glob. then return false;
    var isExclude = negatives.some(function(glob) {
        return !minimatch(filePath, glob, options);
    });

    if(isExclude) {
        return false;
    }

    return positives.some(function(glob) {
        return minimatch(filePath, glob, options);
    });

}

function isNegative(pattern) {
    if (typeof pattern !== 'string') return true;
    if (pattern[0] === '!') return true;
    return false;
}

function isPositive(pattern) {
    return !isNegative(pattern);
}

Client.prototype.compile = function(filo, callback) {

    var rule = this.getRule(filo);

    if(!rule) {
        // if mismatch, and if filo with mutiple file
        if(filo.isAvailable()) {
            filo.contents = filo.output().toString();
            callback(null, filo);
        }else {
            callback(new Error('mismatch rule & invalid file'));
        }
        return;
    }

    console.log('match rule: %s', rule);

    var result = rule.dispose(filo.stream({
//        filter: rule.filter
    }), filo);

    if (result && utils.isStream(result)) {
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
        globs: url,
        dispose: callback
    });
};

module.exports = Client;