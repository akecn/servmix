var Servmix = require('./lib/servmix');
var mime = require('mime-types');

/**
 * todo
 */
module.exports = function(options) {

    // todo default options setting

    var servmix = new Servmix(options);

    return function(req, res, next) {

        var url = req.url.slice(1);

        servmix.compile(url, function(err, file) {
            if(err) {
                next();
                return;
            }
            res.setHeader('Content-Type', mime.contentType(file.ext));
            res.end(file.contents);
        });

    };

};