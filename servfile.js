
var servmix = require('./servmix');
var through2 = require('through2');

//servmix.fileMode = "vinyl";

servmix.pick('./test', function(stream) {
    stream
        .pipe(through2.obj(function(file, enc, callback) {
            if(file.ext === ".css") {
                file.ext = ".less";

                require('less').render(file.toString(), {
                    path: file.url
                }, function (err, output) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    file.contents = new Buffer(output.css);
                    file.ext = ".css";

                    callback(null, file);
                });
            }else {
                callback(null, file);
            }
        }))
        .pipe(through2.obj(function(file, enc, callback) {
            if(file.ext === ".js") {

                file.contents = "define(function(require, exports, module) {\n{{"+file.toString()+"}}\n});";

                callback(null, file);
            }else {
                callback(null, file);
            }
        }))
        .pipe(servmix.output());
});

module.exports = servmix;