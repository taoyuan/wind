/*
 * default-exceptions.js: A test fixture for logging exceptions with the default firelog logger.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var path = require('path'),
    firelog = require('../../../lib/firelog');

firelog.handleExceptions([
  new (firelog.transports.File)({
    filename: path.join(__dirname, '..', 'logs', 'default-exception.log'),
    handleExceptions: true
  })
]);

setTimeout(function () {
  throw new Error('OH NOES! It failed!');
}, 1000);