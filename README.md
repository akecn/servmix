## Servmix

a pre-compile static server.

### usage

use in express/connect.

```
var app = new Connect();
var servmix = require('servmix');
app.use(servmix.middleware(options));

app.listen(port);
```

use in node

```
var Servmix = require('servmix').Service;
var servmix = new Servmix(options);
servmix.compile(url, function(err, file) {
    if(err) {
        // throw
    }
    // file object. with attributes contents and ext. detail in [filo](http://github.com/akecn/filo) 
});
```

use `servmix` as static server.

```
# TODO
(sudo) npm install servmix -g
servmix
```

you can config in `servmix.json`:

```
{
    "rules": [
        {
            "globs": "*.md",
            "tasks": "markdown"
        },
        {
            "globs": "*.css",
            "tasks": ["less", "minify"]
        },
        {
            "globs": ["test/*.js", "!sea.js"],
            "tasks": [{
                "name": "wrap",
                "type": "amd"
            }]
        }
    ]
}
```

### default extension 

#### less
compile less to css

#### markdown
compile markdown to html

#### babel
compile es6 to es5

#### wrap
auto wrap js with `define(function(require, exports, module) { <% ="your code"%> })`

#### minify
minify js and css code

and also you can extend extension by yourself.

### create your extension

set `extend` attribute of `servmix.json`:

```
{
    "extend": "path/to/your/extension/dir/or/file"
}
```

if `extend` is file, then the exports will be your extension. like this

```
module.exports = {
    "less": function(filo, options) {
        return through2.obj(function(file, enc, callback) {
            // the file is vinyl object. so create extension just like develop plugin for gulp
        });
    }
}
```

if you don't like configure but code.

create `servmix.js`, and code like this:

```
var servmix = require('servmix'),
    less = require('gulp-less'),
    through2 = require('through2');
servmix.request(["*.css", "!reset.css"], function(stream, filo) {
    stream
        .pipe(through2.obj(function(file, enc, callback) {
            // different with gulp. the file may be isNull.because the path come from url.
            filo.extension(file, '.less');
            
            if(filo.available(file)) {
                file.contents = filo.readFile(file);
                file.stat = filo.fileStat(file);
            }
            callback(null, file);
        }))
        // then just use gulp-plugin
        .pipe(less());
});

// important!!
module.exports = servmix;
```