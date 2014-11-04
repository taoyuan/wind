var firelog = require('../lib/firelog');

firelog.cli('firelog', { timestamp: 'short'});

firelog.log('info', 'Hello, this is a logging event with appname', {'foo': 'bar'});
firelog.log('info', 'action', 'Hello, this is a logging event with appname', {'foo': 'bar'});
firelog.action('action', 'Hello, this is a logging event with appname', {'foo': 'bar', 'label': 'winston#*'});