var fs = require('fs'),
    path = require('path'),
    less = require('less');

exports.compile = function(file, options, callback) {
    file.ext = ".less";

    if(file.isAvailable()) {
        var buffer = file.output();

        less.render(buffer.toString(), {}, function(err, output) {
            if(err) {
                console.error(err);
                callback();
            }

            callback(output.css);
        });

    }else {
        console.log('invalid?')
        callback();
    }
};