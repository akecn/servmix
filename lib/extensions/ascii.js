"use strict";

var through2 = require('through2');
var toAscii = require('native2ascii');

module.exports = function(filo) {

    return through2.obj(function(file, enc, callback) {

        var contents = file.contents;
        if(contents) {
            contents = toAscii.native2ascii(contents.toString());
            file.contents = new Buffer(contents);
        }

        callback(null, file);

    });
};