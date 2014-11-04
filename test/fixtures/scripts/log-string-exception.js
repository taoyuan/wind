/*
 * log-string-exceptions.js: A test fixture for logging string exceptions in firelog.
 *
 * (C) 2011 Charlie Robbins
 * MIT LICENCE
 *
 */

var path = require('path'),
    firelog = require('../../../lib/firelog');

var logger = new (firelog.Logger)({
  transports: [
    new (firelog.transports.File)({
      filename: path.join(__dirname, '..', 'logs', 'string-exception.log'),
      handleExceptions: true
    })
  ]
});

logger.handleExceptions();

setTimeout(function () {
  throw 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
}, 1000);