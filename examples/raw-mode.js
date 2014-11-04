var wide = require('../lib/wide');

var logger = new (wide.Logger)({
    transports: [
        new (wide.transports.Console)({raw: true})
    ]
});

logger.log('info', 'Hello, this is a raw logging event', {'foo': 'bar'});
logger.log('info', 'install', 'Hello, this is a raw logging event with id', {'foo': 'bar'});
