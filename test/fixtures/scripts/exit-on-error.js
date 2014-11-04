/*
 * default-exceptions.js: A test fixture for logging exceptions with the default firelog logger.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var path = require('path'),
    firelog = require('../../../lib/firelog');

firelog.exitOnError = function (err) {
  return err.message !== 'Ignore this error';
};

firelog.handleExceptions([
  new (firelog.transports.File)({
    filename: path.join(__dirname, '..', 'logs', 'exit-on-error.log'),
    handleExceptions: true
  })
]);

setTimeout(function () {
  throw new Error('Ignore this error');
}, 1000);