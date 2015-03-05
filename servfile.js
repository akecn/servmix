
var servmix = require('./servmix');

servmix.pick('./test', function(stream) {
    stream
        // .pipe().pipe()
        .pipe(servmix.output());
});

module.exports = servmix;