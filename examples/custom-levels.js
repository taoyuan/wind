/*
 * custom-levels.js: Custom logger and color levels in firelog
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var firelog = require('../lib/firelog');

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

var logger = module.exports = new (firelog.Logger)({
  transports: [
    new (firelog.transports.Console)({
      colorize: true
    })
  ],
  levels: config.levels,
  colors: config.colors
});

logger.data('hello')