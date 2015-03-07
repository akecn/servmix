var _ = require('lodash'),
    path = require('path'),
    fs = require('fs');

/**
 * get all the parsers in directory
 * @param dirPath <String> the directory.
 * @param options
 * @param options.cwd <String> cwd of dirPath
 */
function getParsersFromDir(dirPath, options) {
    if(!dirPath) return;

    options = _.defaults(options || {});

    dirPath = path.join(options.cwd, dirPath);

    if(!fs.existsSync(dirPath)) {
        return;
    }

    var files = fs.readdirSync(dirPath),
        compilers = {};

    _.each(files, function(file) {
        var fileNameWithoutExt = path.basename(file, '.js');

        // only *.js file
        if(file !== fileNameWithoutExt) {
            var name = path.resolve(dirPath, fileNameWithoutExt);
            var mod = require(name);

            if(mod.compile) {
                mod.__name = fileNameWithoutExt;
                compilers[fileNameWithoutExt] = mod;
            }
        }
    });

    return compilers;
}

module.exports = getParsersFromDir(__dirname);