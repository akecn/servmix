
## install

```
(sudo) npm install servmix -g
```

## use in express/connect.

```
var app = new Connect();
var servmix = require('servmix');
app.use(servmix.middleware(options));

app.listen(port);
```

## use in node

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

## use `servmix` as static server.

```
servmix --cwd  
```

### configure style
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

#### default extension 

##### less
compile less to css

##### markdown
compile markdown to html

##### babel
compile es6 to es5

##### wrap
auto wrap js with `define(function(require, exports, module) { <% ="your code"%> })`

##### minify
minify js and css code

and also you can extend extension by yourself.

#### create your extension

add `extend` property for `servmix.json`:

```
{
    "extend": "path/to/your/extension/dir/or/file"
}
```

if `extend` is file, then the exports will be your extensions.

```
module.exports = {
    "less": function(filo, options) {
        return through2.obj(function(file, enc, callback) {
            // the file is vinyl object. so create extension just like develop plugin for gulp
        });
    }
}
```

or `extend` is directory, every file in the directory will be read as an extension. see `lib/extensions/`

### gulp style

create `servmix.js`:

```
var servmix = require('servmix'),
    babel = require('gulp-babel'),
    through2 = require('through2');
servmix.request(["*.js", "!sea.js"], function(stream, filo) {
    stream
        .pipe(through2.obj(function(file, enc, callback) {
            // different with gulp. the file may be isNull.because the path come from url.
            // so change extension
            filo.extension(file, '.es');
            // then read the real file.
            if(filo.available(file)) {
                file.contents = filo.readFile(file);
                file.stat = filo.fileStat(file);
            }
            callback(null, file);
        }))
        // then just use gulp-plugin
        .pipe(babel());
});

// important!!
module.exports = servmix;
```

## TODO
* watch config file change
* html extension
* pass configure, not only read cfg file.
* clone example file
* livereload
* more extension support?