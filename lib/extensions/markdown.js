
var through2 = require('through2'),
    marked = require('marked');

var utils = require('../utils');
var logger = utils.getLogger('markdown');

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

/**
 *
 * @param filo
 * @param options
 * @param callback
 */
module.exports = function(filo) {
    filo.ext = '.html';

    return through2.obj(function(file, enc, callback) {
        var contents = file.contents;

        if(contents) {
            file.contents = new Buffer(marked(file.contents.toString()));
        }

        callback(null, file);
    });
};
