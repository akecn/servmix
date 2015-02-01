var servmix = require('./lib/index');

module.exports = servmix;

servmix.middleware = require('./middleware');

servmix.server = require('./server');