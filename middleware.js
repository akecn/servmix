var Servmix = require('./lib/index');

/**
 * todo
 */
module.exports = function(app, options) {

    // todo default options setting

    var servmix = new Servmix(options);

    app.use(function(req, res, next) {

        var url = req.url;

        servmix.compile(url, function(err, content, contentType) {
            if(err || !content) {
                next();
                return;
            }
            // if compile success and send back `content`
            contentType || (contentType = "text/plain; charset=utf-8");
            res.setHeader('Content-Type', contentType);
            res.end(content);
        });

    });

};