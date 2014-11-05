/*
 * default-exceptions.js: A test fixture for logging exceptions with the default wide logger.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var path = require('path'),
    wide = require('../../../lib');

wide.handleExceptions([
  new (wide.transports.File)({
    filename: path.join(__dirname, '..', 'logs', 'default-exception.log'),
    handleExceptions: true
  })
]);

setTimeout(function () {
  throw new Error('OH NOES! It failed!');
}, 1000);