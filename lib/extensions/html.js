
var _ = require('lodash'),
    minimatch = require('minimatch'),
    cheerio = require('cheerio'),
    through2 = require('through2');
var path = require('path');

var Filo = require('filo');

//var logger = utils.getLogger('html');

module.exports = function(filo, options, context) {

    return through2.obj(function(file, enc, callback) {

        if(!filo.available(file)) {
            callback();
            return;
        }

        var $ = cheerio.load(file.contents);

        var $el = $('link[data-servmix][href]')
        var url = $el.attr('href');

        context.compile(url, {
            cwd: path.dirname(filo.getUrl(file))
        }, function(err, filo) {
            if(err) {
                console.log(err);
                callback(null, file);
                return;
            }

            $el.replaceWith("<style>" + filo.contents.toString() + "</style>");

            file.contents = new Buffer($.html());
            callback(null, file);
        });

//        file.contents = new Buffer("aaaaa");
//        callback(null, file);
    });

};