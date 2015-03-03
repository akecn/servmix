var Servmix = require('./lib/index');
var mime = require('mime-types');

/**
 * todo
 */
module.exports = function(app, options) {

    // todo default options setting

    var servmix = new Servmix(options);

    app.use(function(req, res, next) {

        var url = req.url;

        servmix.compile(url, function(err, file) {
            if(err) {
                next();
                return;
            }

            res.setHeader('Content-Type', mime.contentType(file.ext));
            res.end(file.contents);
        });

    });

};