var wide = require('..');

//
// Create a new wide logger instance with two tranports: Console, and Webhook
//
//
// The Console transport will simply output to the console screen
// The Webhook tranports will perform an HTTP POST request to an abritrary end-point ( for post/recieve webhooks )
//
var logger = new (wide.Logger)({
    transports: [
        {type: 'console'},
        {type: 'webhook', 'host': 'localhost', 'port': 8080, 'path': '/collectdata'}
    ]
});

logger.log('info', 'Hello webhook log files!', {'foo': 'bar'});
