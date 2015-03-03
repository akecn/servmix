"use strict";

var _ = require('lodash'),
    through2 = require('through2');

var fs = require('fs'),
    path = require('path'),
    File = require('./file');

function Filo(url, options) {
    options = _.defaults(options || {}, {
        cwd: path.resolve('.')
    });

    var dispose = this._parsing(url);

    this.files = dispose.files.map(function(file) {
        return new File({
            cwd: options.cwd,
            dir: dispose.dir,
            url: file
        });
    });
}

function isComboPath(url) {
    return ~url.indexOf("??");
}

_.assign(Filo.prototype, {
    _parsing: function(url) {
        var urls = url,
            dir = "";
        if(isComboPath(url)) {
            var parts = url.split('??');

            dir = parts[0];

            urls = parts[1].split(',');
        }

        if(typeof urls === "string") {
            urls = [url];
        }

        return {
            files: urls,
            dir: dir
        };
    },

    stream: function(transform, flush) {
        var stream = through2.obj(transform, flush);

        this.files.forEach(function(file) {
            stream.write(file);
        });
        stream.end();

        return stream;
    },

    output: function() {

        var bufs = [];
        this.files.forEach(function(file) {

            var contents = file.read();
            if(contents) {
                bufs.push(contents);
            }
        });

        if(bufs.length > 0) {
            return Buffer.concat(bufs);
        }else {
            return null;
        }
    }
});

module.exports = Filo;

if(!module.parent) {
    var filo = new Filo("/lib??file.coffee,filo.coffee", {
        cwd: path.resolve(process.cwd(), '../')
    });

    console.log(filo);

    filo.stream(function(file, enc, callback) {
        file.ext = ".js";
        callback(null, file);

    }, function() {
        console.log(filo.output());
    });

}