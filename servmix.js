var Client = require('./lib/client');

module.exports = Client;

Client.middleware = require('./middleware');

Client.server = require('./server');