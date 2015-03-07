
var servmix = require('./client');
var through2 = require('through2');

var less = require('gulp-less');

servmix.request('test/*.css', function(stream, filo) {

    return stream
        .pipe(through2.obj(function(file, enc, callback) {
            filo.ext = ".less";
            file.contents = filo.readFile(file);
            file.stat = filo.fileStat(file);
            filo.ext = ".css";

            callback(null, file);
        }))
        .pipe(less());
});

servmix.request('test/*.js', function(stream, filo) {
    return stream
        .pipe(through2.obj(function(file, enc, callback) {
            var fileContent = filo.readFile(file),
                contents = "define(function(require, exports, module) {\n"+ fileContent.toString() +"\n});";
            file.contents = new Buffer(contents);

            callback(null, file);
        }));
});

var marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});
servmix.request('*.md', function(stream, filo) {

    filo.ext = ".html";

    return stream.pipe(through2.obj(function(file, enc, callback) {
        var contents = "<html>" + marked(file.contents.toString()) + "</html>";
        file.contents = new Buffer(contents);
        callback(null, file);
    }));
});

module.exports = servmix;