## Servmix

a pre-compile static server.

### usage

use `servmix` as static server.

```
# TODO
(sudo) npm install servmix -g
servmix
```

use in express/connect.

```
var servmix = require('servmix');
var host = servmix.middleware(app, options);
host.add(patten, function(fileContent) {
    // handle file content
});
```