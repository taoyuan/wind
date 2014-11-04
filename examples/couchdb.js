var firelog = require('../lib/firelog');

//
// Create a new firelog logger instance with two tranports: Console, and Couchdb
//
//
// The Console transport will simply output to the console screen
// The Couchdb tranport will perform an HTTP POST request to the specified CouchDB instance
//
var logger = new (firelog.Logger)({
  transports: [
    new (firelog.transports.Console)(),
    new (firelog.transports.Couchdb)({ 'host': 'localhost', 'db': 'logs' })
    // if you need auth do this: new (firelog.transports.Couchdb)({ 'user': 'admin', 'pass': 'admin', 'host': 'localhost', 'db': 'logs' })
  ]
});

logger.log('info', 'Hello webhook log files!', { 'foo': 'bar' });
