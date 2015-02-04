
var fs = require('fs'),
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
exports.compile = function(filo, options, callback) {

    filo.contentType = "text/html; charset=utf-8";

    if(filo.isAvailable()) {
        var buffer = filo.output();

        callback("<html>" + marked(buffer.toString()) + "</html>");
    }else {
        callback();
    }
};
