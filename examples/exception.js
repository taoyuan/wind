var wide = require('..');
var transports = require('../transports');
wide.handleExceptions(new transports.Console({ colorize: true, json: true }));

throw new Error('Hello, wide!');
