/*
 * firelog.js: Top-level include defining Firelog.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var firelog = exports;

//
// Expose version using `pkginfo`
//
require('pkginfo')(module, 'version');

//
// Include transports defined by default by firelog
//
firelog.transports = require('./firelog/transports');

//
// Expose utility methods
//
var common = require('./firelog/common');
firelog.hash = common.hash;
firelog.clone = common.clone;
firelog.longestElement = common.longestElement;
firelog.exception = require('./firelog/exception');
firelog.config = require('./firelog/config');
firelog.addColors = firelog.config.addColors;

//
// Expose core Logging-related prototypes.
//
firelog.Container = require('./firelog/container').Container;
firelog.Logger = require('./firelog/logger').Logger;
firelog.Transport = require('./firelog/transports/transport').Transport;

//
// We create and expose a default `Container` to `firelog.loggers` so that the
// programmer may manage multiple `firelog.Logger` instances without any additional overhead.
//
// ### some-file1.js
//
//     var logger = require('firelog').loggers.get('something');
//
// ### some-file2.js
//
//     var logger = require('firelog').loggers.get('something');
//
firelog.loggers = new firelog.Container();

//
// We create and expose a 'defaultLogger' so that the programmer may do the
// following without the need to create an instance of firelog.Logger directly:
//
//     var firelog = require('firelog');
//     firelog.log('info', 'some message');
//     firelog.error('some error');
//
var defaultLogger = new firelog.Logger({
    transports: [new firelog.transports.Console()]
});

//
// Pass through the target methods onto `firelog.
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
common.setLevels(firelog, null, defaultLogger.levels);
methods.forEach(function (method) {
    firelog[method] = function () {
        return defaultLogger[method].apply(defaultLogger, arguments);
    };
});

//
// ### function cli ()
// Configures the default firelog logger to have the
// settings for command-line interfaces: no timestamp,
// colors enabled, padded output, and additional levels.
//
firelog.cli = function () {
    firelog.padLevels = true;
    common.setLevels(firelog, defaultLogger.levels, firelog.config.cli.levels);
    defaultLogger.setLevels(firelog.config.cli.levels);
    firelog.config.addColors(firelog.config.cli.colors);

    if (defaultLogger.transports.console) {
        defaultLogger.transports.console.colorize = true;
        defaultLogger.transports.console.timestamp = false;
    }

    return firelog;
};

//
// ### function setLevels (target)
// #### @target {Object} Target levels to use
// Sets the `target` levels specified on the default firelog logger.
//
firelog.setLevels = function (target) {
    common.setLevels(firelog, defaultLogger.levels, target);
    defaultLogger.setLevels(target);
};

//
// Define getter / setter for the default logger level
// which need to be exposed by firelog.
//
Object.defineProperty(firelog, 'level', {
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
// default logger which need to be exposed by firelog.
//
['emitErrs', 'exitOnError', 'padLevels', 'levelLength', 'stripColors'].forEach(function (prop) {
    Object.defineProperty(firelog, prop, {
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
// the default firelog logger.
//
Object.defineProperty(firelog, 'default', {
    get: function () {
        return {
            transports: defaultLogger.transports,
            exceptionHandlers: defaultLogger.exceptionHandlers
        };
    }
});
