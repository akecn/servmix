
var servmix = require('./servmix');
var through2 = require('through2');

var less = require('gulp-less');

servmix.pick('test/*.css', {}, function(stream, filo) {

    filo.ext = ".css";

    stream
        .pipe(through2.obj(function(file, enc, callback) {
            file.path = file.path.replace('.css', '.less');
            file.contents = filo.readFile(file);
            file.stat = filo.fileStat(file);

            callback(null, file);
        }))
        .pipe(less())
        .pipe(servmix.output());
});

servmix.pick('test/*.js', function(stream, filo) {
    stream
        .pipe(through2.obj(function(file, enc, callback) {
            var fileContent = filo.readFile(file),
                contents = "define(function(require, exports, module) {\n"+ fileContent.toString() +"\n});";
            file.contents = new Buffer(contents);

            callback(null, file);
        }))
        .pipe(servmix.output());
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
servmix.pick('*.md', function(stream, filo) {

    filo.ext = ".html";

    return stream.pipe(through2.obj(function(file, enc, callback) {
        var contents = "<html>" + marked(file.contents.toString()) + "</html>";
        file.contents = new Buffer(contents);
        callback(null, file);
    }));
});

module.exports = servmix;