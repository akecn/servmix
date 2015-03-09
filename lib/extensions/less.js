var path = require('path'),
    less = require('less'),
    through2 = require('through2');

module.exports = function(filo, options) {
    return through2.obj(function(file, enc, callback) {
        filo.extension(file, '.less');

        if(filo.available(file)) {
            file.contents = filo.readFile(file);
            file.stat = filo.fileStat(file);

            less.render(file.contents.toString(), {
                filename: path.join(file.cwd, file.path)
            }, function(err, output) {
                if(err) {
                    callback();
                    return;
                }

                file.contents = new Buffer(output.css);
                callback(null, file);
            });
        }else {
            callback();
        }

    });
};