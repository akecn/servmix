var through2 = require('through2');
var CleanCSS = require('clean-css');
var UglifyJS = require("uglify-js");

module.exports = function(filo, options) {

    return through2.obj(function(file, enc, callback) {
        if(filo.available(file)) {

            switch(filo.ext) {
                case ".js":
                    minifyJs(file, callback);
                    break;
                case ".css":
                    minifyCss(file, callback);
                    break;
                default:
                    callback();
            }

        }else {
            callback();
        }
    });

};

function minifyJs(file, callback) {
    var result = UglifyJS.minify(file.contents.toString(), {fromString: true});
    file.contents = new Buffer(result.code);
    callback(null, file);
}

function minifyCss(file, callback) {
    var result = new CleanCSS().minify(file.contents);
    file.contents = new Buffer(result.styles);
    callback(null, file);
}