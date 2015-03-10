"use strict";

var through2 = require('through2');
var babel = require('gulp-babel');

module.exports = function(filo, options) {
    options || (options = {});
    var type = options.ext;

    return through2.obj(function(file, enc, callback) {
        // change ext
        filo.extension(file, type);

        file.contents = filo.readFile(file);
        file.stat = filo.fileStat(file);

        callback(null, file);

    }).pipe(babel(options));
};