var wide = exports;

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
wide.Container = require('./wide/container').Container;
wide.Logger = require('./wide/logger').Logger;
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

//
// We create and expose a 'defaultLogger' so that the programmer may do the
// following without the need to create an instance of wide.Logger directly:
//
//     var wide = require('wide');
//     wide.log('info', 'some message');
//     wide.error('some error');
//
var defaultLogger = new wide.Logger({
    transports: [{type: 'console'}]
});

//
// Pass through the target methods onto `wide.
//
var methods = [
    'log',
    'query',
    'stream',
    'add',
    'remove',
    'clear',
    'profile',
    'startTimer',
    'extend',
    'cli',
    'handleExceptions',
    'unhandleExceptions',
    'addRewriter'
];
common.setLevels(wide, null, defaultLogger.levels);
methods.forEach(function (method) {
    wide[method] = function () {
        return defaultLogger[method].apply(defaultLogger, arguments);
    };
});

//
// ### function cli ()
// Configures the default wide logger to have the
// settings for command-line interfaces: no timestamp,
// colors enabled, padded output, and additional levels.
//
wide.cli = function (appname, options) {

    //wide.padLevels = true;
    common.setLevels(wide, defaultLogger.levels, wide.config.cli.levels);
    //defaultLogger.setLevels(wide.config.cli.levels);
    //wide.config.addColors(wide.config.cli.colors);
    //
    //if (defaultLogger.transports.console) {
    //    defaultLogger.transports.console.colorize = true;
    //    defaultLogger.transports.console.timestamp = false;
    //}

    defaultLogger.cli(appname, options);

    return wide;
};

//
// ### function setLevels (target)
// #### @target {Object} Target levels to use
// Sets the `target` levels specified on the default wide logger.
//
wide.setLevels = function (target) {
    common.setLevels(wide, defaultLogger.levels, target);
    defaultLogger.setLevels(target);
};

//
// Define getter / setter for the default logger level
// which need to be exposed by wide.
//
Object.defineProperty(wide, 'level', {
    get: function () {
        return defaultLogger.level;
    },
    set: function (val) {
        defaultLogger.level = val;

        Object.keys(defaultLogger.transports).forEach(function (key) {
            defaultLogger.transports[key].level = val;
        });
    }
});

//
// Define getters / setters for appropriate properties of the
// default logger which need to be exposed by wide.
//
['emitErrs', 'exitOnError', 'padLevels', 'levelLength', 'stripColors'].forEach(function (prop) {
    Object.defineProperty(wide, prop, {
        get: function () {
            return defaultLogger[prop];
        },
        set: function (val) {
            defaultLogger[prop] = val;
        }
    });
});

//
// @default {Object}
// The default transports and exceptionHandlers for
// the default wide logger.
//
Object.defineProperty(wide, 'default', {
    get: function () {
        return {
            transports: defaultLogger.transports,
            exceptionHandlers: defaultLogger.exceptionHandlers
        };
    }
});
