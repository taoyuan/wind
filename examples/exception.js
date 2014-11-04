var wide = require('../');
wide.handleExceptions(new wide.transports.Console({ colorize: true, json: true }));

throw new Error('Hello, wide!');
