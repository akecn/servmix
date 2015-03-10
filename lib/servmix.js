/**
 * @file
 * Created by wuake on 2015-01-30
 */
var _ = require('lodash'),
    Filo = require('filo'),
    Client = require('./client');

function Servmix(config) {

    var options = _.defaults(config || {}, {
        cwd: process.cwd()
    });

    this.client = new Client(this, {
        cwd: options.cwd
    });

    this.cwd = options.cwd;
}

_.assign(Servmix.prototype, {
    /**
     * compile the file use opposite parser
     * @param url <String>
     * @param options
     * @param callback
     */
    compile: function (url, options, callback) {
        if(!callback) {
            callback = options;
            options = {};
        }
        if(!url) {
            callback(new Error('invlid file in servmix'));
            return;
        }

        var filo = new Filo(url, {
            cwd: options.cwd || this.cwd
        });

        this.client.compile(filo, callback)
    }
});

module.exports = Servmix;