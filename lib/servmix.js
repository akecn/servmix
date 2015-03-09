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

    this.client = new Client({
        cwd: options.cwd
    });

    this.cwd = options.cwd;
}

_.assign(Servmix.prototype, {
    /**
     * compile the file use opposite parser
     * @param url <String>
     * @param callback
     */
    compile: function (url, callback) {
        if(!url) {
            callback(new Error('invlid file'));
            return;
        }

        var filo = new Filo(url, {
            cwd: this.cwd
        });

        this.client.compile(filo, callback)
    }
});

module.exports = Servmix;