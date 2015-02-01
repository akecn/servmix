var fs = require('fs'),
    path = require('path');

var cheerio = require('cheerio'),
    utils = require('../utils');

var VFile = require('../vfile');

var logger = utils.getLogger('html');

exports.type = "text/html";

exports.compile = function(filo, options, callback) {
    var buffer = filo.output();

    var $ = cheerio.load(buffer);

    var mapping = options.mapping || [];

    var filePath = filo.getFiles()[0],
        base = path.dirname(filePath);

    if(mapping.length === 0) {
        callback();
    }

    mapping.forEach(function(map) {
        $(map.pattern).each(function(idx, el) {
            var attr = "href";
            switch(el.type) {
                case "script":
                case "img":
                    attr = "src";
                    break;
            }

            var attrVal = $(el).attr(attr);
            if(attrVal) {

                var pp = path.resolve(base, attrVal),
                    vf = new VFile(attrVal, {
                        cwd: base
                    });

                require('./less').compile(vf, {},function(content) {
                    map.action.forEach(function(action) {
                        if(action === "inline") {
                            var compiled = utils.template("<style>{{contents}}</style>")
                            var html = compiled({
                                contents: content
                            });
                            $(el).replaceWith(html);

                            callback($.html());
                        }
                    })
                });
            }else {
                callback();
            }
        });
    });

};