//var Servmix = require('./lib/index');

var through2 = require('through2');

var Servmix = {
    rules: []
};

Servmix.pick = function(url, callback) {
    this.rules.push({
        params: url,
        callback: callback
    });
};

Servmix.output = function(options) {
    var self = this;
    return through2.obj(function(file, enc, callback) {
//        console.log('output:', file);
        callback(null, file);
    }, function(callback) {
//        self.trigger(self._host);
        var filo = self._host;
        var contents = filo.output();

        if (contents) {

            filo.contents = contents;
            filo.ext = filo.files[0].ext;

//            console.log(filo.contents.toString());
            self._callback(null, filo);
//            console.log("=-===========");
            console.log('done');
        } else {
            console.log('fail');
            self._callback(new Error('invalid file'));
        }
    });
};

Servmix.host = function(host, callback) {
    this._host = host;
    this._callback = callback;
};

module.exports = Servmix;

Servmix.middleware = require('./middleware');

Servmix.server = require('./server');