var firelog = require('../lib/firelog');

var logger = new (firelog.Logger)({
    transports: [
        new (firelog.transports.Console)({appname: 'firelog', timestamp: true})
    ]
});

logger.cli();

logger.log('info', 'Hello, this is a logging event with appname', {'foo': 'bar'});
logger.log('info', 'action', 'Hello, this is a logging event with appname', {'foo': 'bar'});
logger.action('info', 'action', 'Hello, this is a logging event with appname', {'foo': 'bar', 'label': 'winston#*'});