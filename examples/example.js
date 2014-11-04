var wide = require('../lib/wide');

wide.cli('wide', { timestamp: 'short'});

wide.log('info', 'Hello, this is a logging event with appname', {'foo': 'bar'});
wide.log('info', 'action', 'Hello, this is a logging event with appname', {'foo': 'bar'});
wide.action('action', 'Hello, this is a logging event with appname', {'foo': 'bar', 'label': 'winston#*'});