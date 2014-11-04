var firelog = require('../lib/firelog');

var logger = new (firelog.Logger)({
    transports: [
        new (firelog.transports.Console)({appname: 'firelog'})
    ]
});

logger.log('info', 'execute', 'Hello, this is a logging event with appname', {'foo': 'bar'});
