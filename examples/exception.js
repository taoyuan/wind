var firelog = require('../');
firelog.handleExceptions(new firelog.transports.Console({ colorize: true, json: true }));

throw new Error('Hello, firelog!');
