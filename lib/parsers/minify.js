
var CleanCSS = require('clean-css');


exports.compile = function(filo, options, callback) {

    var result = new CleanCSS().minify(filo.output());
    callback(result.styles);
};