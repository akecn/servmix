var fs = require('fs'),
    path = require('path'),
    less = require('less');

exports.type = "text/css";

exports.compile = function(filo, options, callback) {
    filo.ext = ".less";

    if(filo.isAvailable()) {

        var buffer = filo.output();
        less.render(buffer.toString(), function(err, output) {
            callback(output.css);
        });

    }else {
        callback();
    }
};