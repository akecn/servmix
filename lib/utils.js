var _ = require('lodash'),
    fs = require('fs'),
    path = require('path');
var Stream = require('stream').Stream;

var log4js = require('log4js');

//log4js.configure({
//    "appenders": [
//        {
//            "type": "console"
//        }
//    ],
//    "replaceConsole": true,
//    "levels": {
//        servmix: "TRACE"
//    }
//});

exports.getLogger = function(name, level) {
    var logger = log4js.getLogger(name);

    if(level) {
        logger.setLevel(level);
    }

    return logger;
};

var logger = exports.getLogger('Console', 'ALL');
exports.log = function() {
    logger.trace.apply(logger, arguments);
};


_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
exports.template = function(tpl) {
    return _.template(tpl);
};

exports.isStream = function(o) {
    return !!o && o instanceof Stream;
};