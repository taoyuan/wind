/*
 * default-exceptions.js: A test fixture for logging exceptions with the default wide logger.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var path = require('path'),
    wide = require('../../../lib/wide');

wide.exitOnError = function (err) {
  return err.message !== 'Ignore this error';
};

wide.handleExceptions([
  new (wide.transports.File)({
    filename: path.join(__dirname, '..', 'logs', 'exit-on-error.log'),
    handleExceptions: true
  })
]);

setTimeout(function () {
  throw new Error('Ignore this error');
}, 1000);