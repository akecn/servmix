var fs = require('fs'),
    path = require('path');

var _ = require('lodash'),
    minimatch = require('minimatch'),
    cheerio = require('cheerio'),
    utils = require('../utils');

var Filo = require('filo');

var logger = utils.getLogger('html');

exports.compile = function(filo, options, callback) {
    var buffer = filo.output();

    var $ = cheerio.load(buffer);

    var mappings = options.mappings || [],
        pattern = options.pattern;

    var filePath = filo.getFiles()[0],
        base = path.dirname(filePath);

    var $elems = $(pattern);

    if(mappings.length === 0 || $elems.length === 0) {
        callback();
        return;
    }

    mappings.forEach(function(map) {
        $elems.each(function(idx, el) {
            var $el = $(el),
                attr = "href";
            switch(el.type) {
                case "script":
                case "img":
                    attr = "src";
                    break;
            }

            var attrVal = $el.attr(attr);

//            if(map.href[0] !== attrVal) {
                console.log(map.href, attrVal);

//                callback($.html());
//                return false;
//            }

            var ext = path.extname(attrVal);
            var stpl = "{{contents}}",
                tpl;

            switch(ext) {
                case ".js":
                    stpl = "<script>{{contents}}</script>";
                    break;
                case ".css":
                    stpl = "<style>{{contents}}</style>"
                    break;
            }

            tpl = utils.template(stpl);

            if(attrVal) {

                var fo = new Filo(attrVal, {
                        cwd: base
                    });

                var replaceConf = map.replace;
                if(replaceConf) {
                    if(replaceConf.type === "file") {
                        var tasks = [].concat(replaceConf.tasks);

                        function cb(content) {
                            if(content) {
                                $el.replaceWith(tpl({
                                    contents: content
                                }));
                            }

                            callback($.html());
                        }

                        var task;
                        // xxx resolve multiple task callback
                        function next(content) {
                            fo.content = content;

                            task = tasks.shift();

                            if(!task) {
                                cb(content);
                                return;
                            }

                            try {
                                var compiler = require("./" + task);
                                if (compiler && _.isFunction(compiler.compile)) {

                                    // TODO
                                    var config = {};
//                                    var config = options.configure[compiler.__name];
                                    compiler.compile(fo, config, next);

                                } else {
                                    logger.trace('no compile of %s', task);
                                    next(content);
                                }
                            }catch(ex) {
                                next(filo.output().toString());
                            }
                        }

                        next();
                    }else {

                    }
                }else {
                    callback();
                }
            }else {
                callback();
            }
        });
    });

};