/*
 * custom-levels.js: Custom logger and color levels in wide
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var wide = require('..');

//
// Logging levels
//
var config = {
    levels: {
        silly: 0,
        verbose: 1,
        info: 2,
        data: 3,
        warn: 4,
        debug: 5,
        error: 6
    },
    colors: {
        silly: 'magenta',
        verbose: 'cyan',
        info: 'green',
        data: 'grey',
        warn: 'yellow',
        debug: 'blue',
        error: 'red'
    }
};

var logger = module.exports = new (wide.Logger)({
    transports: [
        {
            type: 'console',
            colorize: true
        }
    ],
    levels: config.levels,
    colors: config.colors
});

logger.data('hello');