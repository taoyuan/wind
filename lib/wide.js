var Logger = require('./wide/logger').Logger;

var wide = exports = module.exports = new Logger({
    transports: [{type: 'console'}]
});

//
// Expose version using `pkginfo`
//
require('pkginfo')(module, 'version');

//
// Expose utility methods
//
var common = require('./wide/common');
wide.hash = common.hash;
wide.clone = common.clone;
wide.longestElement = common.longestElement;
wide.exception = require('./wide/exception');
wide.config = require('./wide/config');
wide.addColors = wide.config.addColors;

//
// Expose core Logging-related prototypes.
//
wide.Logger = Logger;
wide.Container = require('./wide/container').Container;
wide.Transport = require('./wide/transports/transport').Transport;

//
// We create and expose a default `Container` to `wide.loggers` so that the
// programmer may manage multiple `wide.Logger` instances without any additional overhead.
//
// ### some-file1.js
//
//     var logger = require('wide').loggers.get('something');
//
// ### some-file2.js
//
//     var logger = require('wide').loggers.get('something');
//
wide.loggers = new wide.Container();
