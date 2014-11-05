/*
 * unhandle-exceptions.js: A test fixture for using `.unhandleExceptions()` wide.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var path = require('path'),
    wide = require('../../../lib');

var logger = new (wide.Logger)({
  transports: [
    new (wide.transports.File)({
      filename: path.join(__dirname, '..', 'logs', 'unhandle-exception.log'),
      handleExceptions: true
    })
  ]
});

logger.handleExceptions();
logger.unhandleExceptions();

setTimeout(function () {
  throw new Error('OH NOES! It failed!');
}, 1000);