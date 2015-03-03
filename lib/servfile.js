
var servmix = require('./index');

servmix.pick('./test')
    // .pipe().pipe()
    .pipe(servmix.output());