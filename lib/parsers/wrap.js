var fs = require('fs'),
    path = require('path'),
    utils = require('../utils');

exports.type = "application/javascript";

exports.compile = function(filo, options, callback) {

    if(filo.isAvailable()) {
        var wrapper = options.wrapper,
            tpl = "{{contents}}";

        if(wrapper !== undefined) {
            switch(wrapper) {
                case "amd":
                    tpl = "define(function(require, exports, module) {\n{{contents}}\n});"
                    break;
                case "kmd":
                    tpl = "KISSY.add(function(S, require, exports, module) {\n{{contents}}\n});"
                    break;
            }
        }

        var compiled = utils.template(tpl),
            html = compiled({
                contents: filo.output().toString()
            });

        callback(html);

    }else {
        callback();
    }
};