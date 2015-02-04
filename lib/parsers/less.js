var fs = require('fs'),
    path = require('path'),
    less = require('less');

exports.compile = function(filo, options, callback) {
    filo.ext = ".less";
    var f = filo.getFiles()[0],
        base = path.dirname(f);

    if(filo.isAvailable()) {
        var buffer = filo.output();

        less.render(buffer.toString(), {
            paths: [base]
        }, function(err, output) {
            if(err) {
                callback();
            }

            callback(output.css);
        });

    }else {
        callback();
    }
};