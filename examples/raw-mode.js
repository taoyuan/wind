var firelog = require('../lib/firelog');

var logger = new (firelog.Logger)({
    transports: [
        new (firelog.transports.Console)({raw: true})
    ]
});

logger.log('info', 'Hello, this is a raw logging event', {'foo': 'bar'});
logger.log('info', 'install', 'Hello, this is a raw logging event with id', {'foo': 'bar'});
