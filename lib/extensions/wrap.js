var through2 = require('through2'),
    utils = require('../utils');

module.exports = function(filo, options) {
    options || (options = {});
    var type = options.type;

    var tpl = "{{contents}}";

    if(options.type) {
        switch (type) {
            case "amd":
                tpl = "define(function(require, exports, module) {\n{{contents}}\n});"
                break;
            case "kmd":
                tpl = "KISSY.add(function(S, require, exports, module) {\n{{contents}}\n});"
                break;
        }
    }else if(options.header && options.footer) {
        tpl = [options.header, tpl, options.footer].join("\n");
    }

    return through2.obj(function(file, enc, callback) {
        var contents = file.contents;

        if(contents) {
            var compiled = utils.template(tpl),
                html = compiled({
                    contents: contents.toString()
                });

            file.contents = new Buffer(html);

            callback(null, file);
        }else {
            callback();
        }
    });

};