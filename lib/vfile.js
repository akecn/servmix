/**
 * Virtual Object for Multiple File
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    querystring = require('querystring'),
    mime = require('mime-types');

module.exports = VFile;

var def = {
//    delimiter: "??",
//    sep: ",",
    cwd: "."
};
var EMPTY = "",
    // https://regex101.com/r/oD1rH2/2
    REG_APART = /^(?:([^\?\s]*)\?\?)?([^\?\s]*)(?:\?([^\s]*))?$/g;

function VFile(url, options) {
    options = _.defaults(options || {}, def);

    this.base = path.resolve(options.cwd);

//    this.url = "";
//    this.coincident = "";

    this._files = [];
    this.ext = EMPTY;
    this.query = {};
//    this.buffer = new Buffer(EMPTY);

    this.combine(url);
}

_.assign(VFile.prototype, {
    combine: function(url) {
        var virtual = this._parse(url);

        if(!virtual) return false;

        var ext = this.ext,
            files = this._files;

        if(!ext && virtual.ext) {
            this.ext = ext = virtual.ext;
            this.mimeType = mime.lookup(ext);
            this.contentType = mime.contentType(ext);
        }

        // the file must have the same ext.
        if(virtual.ext !== ext) {
            return false;
        }

        this._files = files.concat(virtual.files);
        this.query = _.assign(this.query, virtual.query) ;
    },
    _parse: function(url) {
        var base = this.base,
            prefix, pathes, query;

        // split parts with `replace`
        url.replace(REG_APART, function(_a, f, p, q) {
            prefix = f || EMPTY;
            pathes = (p || EMPTY).split(',');
            query = q || EMPTY;
        });

        if(!pathes || pathes.length == 0) {
            return false;
        }

        var ext,
            files = [];
        pathes.forEach(function(p) {
            var extname = ext = path.extname(p);
            if(!ext) {
                ext = extname;
            }
            if(extname === ext) {
                var pathWithoutExt = p.replace(ext, EMPTY);
                var filePath = path.join(base, prefix, pathWithoutExt);
                files.push(filePath);
            }
        });

        return {
            ext: ext,
            files: files,
            query: query ? querystring.parse(query) : {}
        };
    },
    isAvailable: function() {
        var existCount = 0;
        this.getFiles().forEach(function(p) {
            try {
                var stats = fs.statSync(p);
                if(stats.isFile()) {
                    existCount ++;
                }
            }catch(ex) {}
        });

        return existCount >0;
    },
    output: function() {
        var buf = [];

        this.getFiles().forEach(function(p) {
            try {
                var stats = fs.statSync(p);
                if(stats.isFile()) {
                    buf.push(fs.readFileSync(p));
                }
            }catch(ex) {}
        });

        return Buffer.concat(buf);
    },
    getFiles: function() {
        var ext = this.ext;
        return this._files.map(function(p) {
            return p + ext;
        });
    }
});

/**
 * need method
 *  exists/existsSync
 *  stat/statSync ??
 */



/**
a
a/b
a/b/c.js
??a/b/c.js
a/b/c.js?xx=1&yy=2
??/a/b/c.js,d.js?xx=1&yy=2
/??/a/b/c.js,d.js?xx=1&yy=2
/a/??b/c.js,d.js?xx=1&yy=2
 */
//var file = new VFile('/node_modules/connect-livereload/README.md', {
//    cwd: path.resolve(__dirname, "../")
//});
//console.log(file.getFiles());
//console.log(file.output().toString());