var log4js = require('log4js');

log4js.configure({
    "appenders": [
        {
            "type": "console"
        }
    ],
    "replaceConsole": true,
    "levels": {
        servmix: "TRACE"
    }
});

var levels = [
    'ALL',
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL',
    'MARK',
    'OFF'
];

exports.getLogger = function(name, level) {
    var logger = log4js.getLogger(name);

    if(level && levels.indexOf(level) !== -1) {
        logger.setLevel(level);
    }

    return logger;
};

var exportLevels = exports.levels = {};

levels.forEach(function(level) {
    exportLevels[level.toLowerCase()] = level;
});