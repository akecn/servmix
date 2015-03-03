var fs = require('fs'),
    path = require('path');
var _ = require('lodash');

function File(options) {
    options || (options = {});

    this.cwd = options.cwd;
    this.dir = options.dir;
    this.ext = options.ext;
    this.name = options.name;

    var url = options.url;
    if(!this.ext) {
        this.ext = path.extname(url);
    }

    this.base = url.replace(this.ext, "");
}

"cwd dir base ext".split(' ').forEach(function(name) {
    var getFn = function() {
        return this["__" + name] || "";
    };

    var setFn = function(v) {
        this["__" + name] = v;
        this["__url"] = path.join(this.cwd, this.dir, this.base + this.ext);
    };

    Object.defineProperty(File.prototype, name, {
        enumerable: true,
        get: getFn,
        set: setFn
    });
});

Object.defineProperty(File.prototype, 'url', {
    enumerable: true,
    get: function() {
        return this.__url;
    }
});

_.assign(File.prototype, {
    _read: function() {
        var file = this.url;
        try {
            var stats = fs.lstatSync(file);

            if(stats.isFile()) {
                return fs.readFileSync(file);
            }

        }catch(ex) {}
    },

    read: function() {
        var contents = this.contents;

        if(!contents) {
            contents = this.contents = this._read();
        }

        return contents;
    },

    toString: function() {
        var contents = this.contents || this.read();

        if(contents) {

            return contents.toString();
        }else {
            return null;
        }
    }
});

module.exports = File;



if(!module.parent) {
    var cwd = path.resolve(process.cwd(), "../", "../");

    var file1 = new File({
        name: "file1",
        cwd: cwd,
        url: "servmix/lib/filo.js"
    });

    var file2 = new File({
        name: "file2",
        cwd: cwd,
        dir: "servmix",
        url: "lib/file",
        ext: ".js"
    });

    console.log(file1, file2);

    file1.ext = ".es";
    console.log(file1, file2);
    console.log(file2.read());
}