var wide = require('../lib/wide');

//
// Create a new wide logger instance with two tranports: Console, and Couchdb
//
//
// The Console transport will simply output to the console screen
// The Couchdb tranport will perform an HTTP POST request to the specified CouchDB instance
//
var logger = new (wide.Logger)({
  transports: [
    new (wide.transports.Console)(),
    new (wide.transports.Couchdb)({ 'host': 'localhost', 'db': 'logs' })
    // if you need auth do this: new (wide.transports.Couchdb)({ 'user': 'admin', 'pass': 'admin', 'host': 'localhost', 'db': 'logs' })
  ]
});

logger.log('info', 'Hello webhook log files!', { 'foo': 'bar' });
