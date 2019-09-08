# wide [![Build Status](https://secure.travis-ci.org/taoyuan/wide.png?branch=master)](http://travis-ci.org/taoyuan/wide) [![Greenkeeper badge](https://badges.greenkeeper.io/taoyuan/wide.svg)](https://greenkeeper.io/)

A multi-transport async logging library for node.js. Forked from [winston](https://github.com/flatiron/winston)

## Motivation
Wide is designed to be a simple and universal logging library with support for multiple transports. A transport is essentially a storage device for your logs. Each instance of a wide logger can have multiple transports configured at different levels. For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file.

There also seemed to be a lot of logging libraries out there that coupled their implementation of logging (i.e. how the logs are stored / indexed) to the API that they exposed to the programmer. This library aims to decouple those parts of the process to make it more flexible and extensible.

## Installation

```bash
npm install wide
```

## Usage
There are two different ways to use wide: directly via the default logger, or by instantiating your own Logger. The former is merely intended to be a convenient shared logger to use throughout your application if you so choose.

* [Logging](#logging)
  * [Using the Default Logger](#using-the-default-logger)
  * [Instantiating your own Logger](#instantiating-your-own-logger)
  * [Logging with Metadata](#logging-with-metadata)
  * [String interpolation ](#string-interpolation)
* [Transports](https://github.com/taoyuan/wide/blob/master/docs/transports.md)
* [Profiling](#profiling)
* [Streaming Logs](#streaming-logs)
* [Querying Logs](#querying-logs)
* [Exceptions](#exceptions)
  * [Handling Uncaught Exceptions with wide](#handling-uncaught-exceptions-with-wide)
  * [To Exit or Not to Exit](#to-exit-or-not-to-exit)
* [Logging Levels](#logging-levels)
  * [Using Logging Levels](#using-logging-levels)
  * [Using Custom Logging Levels](#using-custom-logging-levels)
* [Further Reading](#further-reading)
  * [Events and Callbacks in Wide](#events-and-callbacks-in-wide)
  * [Working with multiple Loggers in wide](#working-with-multiple-loggers-in-wide)
  * [Using wide in a CLI tool](#using-wide-in-a-cli-tool)
  * [Extending another object with Logging](#extending-another-object-with-logging)
* [Working with transports](#working-with-transports)
	* [Adding Custom Transports](#adding-custom-transports)
* [Installation](#installation)
* [Run Tests](#run-tests)


## Logging

### Using the Default Logger
The default logger is accessible through the wide module directly. Any method that you could call on an instance of a logger is available on the default logger:

``` js
  var wide = require('wide');

  wide.log('info', 'Hello distributed log files!');
  wide.info('Hello again distributed logs');
```

By default, only the Console transport is set on the default logger. You can add or remove transports via the add() and remove() methods:

``` js
  wide.add(wide.transports.File, { filename: 'somefile.log' });
  wide.remove(wide.transports.Console);
```

For more documentation about working with each individual transport supported by Wide see the [Working with transports](#working-with-transports) section below.

### Instantiating your own Logger
If you would prefer to manage the object lifetime of loggers you are free to instantiate them yourself:

``` js
  var logger = new (wide.Logger)({
    transports: [
      new (wide.transports.Console)(),
      new (wide.transports.File)({ filename: 'somefile.log' })
    ]
  });
```

You can work with this logger in the same way that you work with the default logger:

``` js
  //
  // Logging
  //
  logger.log('info', 'Hello distributed log files!');
  logger.info('Hello again distributed logs');

  //
  // Adding / Removing Transports
  //   (Yes It's chainable)
  //
  logger.add(wide.transports.File)
        .remove(wide.transports.Console);
```

### Logging with Metadata
In addition to logging string messages, wide will also optionally log additional JSON metadata objects. Adding metadata is simple:

``` js
  wide.log('info', 'Test Log Message', { anything: 'This is metadata' });
```

The way these objects are stored varies from transport to transport (to best support the storage mechanisms offered). Here's a quick summary of how each transports handles metadata:

1. __Console:__ Logged via util.inspect(data)
2. __File:__ Logged via util.inspect(data)

## Profiling
In addition to logging messages and metadata, wide also has a simple profiling mechanism implemented for any logger:

``` js
  //
  // Start profile of 'test'
  // Remark: Consider using Date.now() with async operations
  //
  wide.profile('test');

  setTimeout(function () {
    //
    // Stop profile of 'test'. Logging will now take place:
    //   "17 Jan 21:00:00 - info: test duration=1000ms"
    //
    wide.profile('test');
  }, 1000);
```

All profile messages are set to the 'info' by default and both message and metadata are optional There are no plans in the Roadmap to make this configurable, but I'm open to suggestions / issues.

### String interpolation
The `log` method provides the same string interpolation methods like [`util.format`][10].

This allows for the following log messages.
``` js
logger.log('info', 'test message %s', 'my string');
// info: test message my string

logger.log('info', 'test message %d', 123);
// info: test message 123

logger.log('info', 'test message %j', {number: 123}, {});
// info: test message {"number":123}
// data = {}

logger.log('info', 'test message %s, %s', 'first', 'second', {number: 123});
// info: test message first, second
// data = {number: 123}

logger.log('info', 'test message', 'first', 'second', {number: 123});
// info: test message first second
// data = {number: 123}

logger.log('info', 'test message %s, %s', 'first', 'second', {number: 123}, function(){});
// info: test message first, second
// data = {numer: 123}
// callback = function(){}

logger.log('info', 'test message', 'first', 'second', {number: 123}, function(){});
// info: test message first second
// data = {numer: 123}
// callback = function(){}
```





## Querying Logs
Wide supports querying of logs with Loggly-like options. [See Loggly Search API](http://wiki.loggly.com/retrieve_events#optional).
Specifically: `File`, `Couchdb`, `Redis`, `Loggly`, `Nssocket`, and `Http`.

``` js
  var options = {
    from: new Date - 24 * 60 * 60 * 1000,
    until: new Date,
    limit: 10,
    start: 0,
    order: 'desc',
    fields: ['message']
  };

  //
  // Find items logged between today and yesterday.
  //
  wide.query(options, function (err, results) {
    if (err) {
      throw err;
    }

    console.log(results);
  });
```

## Streaming Logs
Streaming allows you to stream your logs back from your chosen transport.

``` js
  //
  // Start at the end.
  //
  wide.stream({ start: -1 }).on('log', function(log) {
    console.log(log);
  });
```

## Exceptions

### Handling Uncaught Exceptions with wide

With `wide`, it is possible to catch and log `uncaughtException` events from your process. There are two distinct ways of enabling this functionality either through the default wide logger or your own logger instance.

If you want to use this feature with the default logger simply call `.handleExceptions()` with a transport instance.

``` js
  //
  // You can add a separate exception logger by passing it to `.handleExceptions`
  //
  wide.handleExceptions(new wide.transports.File({ filename: 'path/to/exceptions.log' }))

  //
  // Alternatively you can set `.handleExceptions` to true when adding transports to wide
  //
  wide.add(wide.transports.File, {
    filename: 'path/to/all-logs.log',
    handleExceptions: true
  });
```

### To Exit or Not to Exit

By default, wide will exit after logging an uncaughtException. if this is not the behavior you want,
set `exitOnError = false`

``` js
  var logger = new (wide.Logger)({ exitOnError: false });

  //
  // or, like this:
  //
  logger.exitOnError = false;
```

When working with custom logger instances, you can pass in separate transports to the `exceptionHandlers` property or set `.handleExceptions` on any transport.

Example 1

``` js
  var logger = new (wide.Logger)({
    transports: [
      new wide.transports.File({ filename: 'path/to/all-logs.log' })
    ],
    exceptionHandlers: [
      new wide.transports.File({ filename: 'path/to/exceptions.log' })
    ]
  });
```

Example 2

```
var logger = new wide.Logger({
  transports: [
    new wide.transports.Console({
      handleExceptions: true,
      json: true
    })
  ],
  exitOnError: false
});
```

The `exitOnError` option can also be a function to prevent exit on only certain types of errors:

``` js
  function ignoreEpipe(err) {
    return err.code !== 'EPIPE';
  }

  var logger = new (wide.Logger)({ exitOnError: ignoreEpipe });

  //
  // or, like this:
  //
  logger.exitOnError = ignoreEpipe;
```

## Logging Levels

### Using Logging Levels
Setting the level for your logging message can be accomplished in one of two ways. You can pass a string representing the logging level to the log() method or use the level specified methods defined on every wide Logger.

``` js
  //
  // Any logger instance
  //
  logger.log('silly', "127.0.0.1 - there's no place like home");
  logger.log('debug', "127.0.0.1 - there's no place like home");
  logger.log('verbose', "127.0.0.1 - there's no place like home");
  logger.log('info', "127.0.0.1 - there's no place like home");
  logger.log('warn', "127.0.0.1 - there's no place like home");
  logger.log('error', "127.0.0.1 - there's no place like home");
  logger.info("127.0.0.1 - there's no place like home");
  logger.warn("127.0.0.1 - there's no place like home");
  logger.error("127.0.0.1 - there's no place like home");

  //
  // Default logger
  //
  wide.log('info', "127.0.0.1 - there's no place like home");
  wide.info("127.0.0.1 - there's no place like home");
```

Wide allows you to set a `level` on each transport that specifies the level of messages this transport should log. For example, you could log only errors to the console, with the full logs in a file (note that the default level of a transport is `info`):

``` js
  var logger = new (wide.Logger)({
    transports: [
      new (wide.transports.Console)({ level: 'error' }),
      new (wide.transports.File)({ filename: 'somefile.log' })
    ]
  });
```

You may also dynamically change the log level of a transport:

``` js
  var logger = new (wide.Logger)({
    transports: [
      new (wide.transports.Console)({ level: 'warn' }),
      new (wide.transports.File)({ filename: 'somefile.log', level: 'error' })
    ]
  });
  logger.debug("Will not be logged in either transport!");
  logger.transports.console.level = 'debug';
  logger.transports.file.level = 'verbose';
  logger.verbose("Will be logged in both transports!");
```

As of 0.2.0, wide supports customizable logging levels, defaulting to [npm][0] style logging levels. Changing logging levels is easy:

``` js
  //
  // Change levels on the default wide logger
  //
  wide.setLevels(wide.config.syslog.levels);

  //
  // Change levels on an instance of a logger
  //
  logger.setLevels(wide.config.syslog.levels);
```

Calling `.setLevels` on a logger will remove all of the previous helper methods for the old levels and define helper methods for the new levels. Thus, you should be careful about the logging statements you use when changing levels. For example, if you ran this code after changing to the syslog levels:

``` js
  //
  // Logger does not have 'silly' defined since that level is not in the syslog levels
  //
  logger.silly('some silly message');
```

### Using Custom Logging Levels
In addition to the predefined `npm` and `syslog` levels available in Wide, you can also choose to define your own:

``` js
  var myCustomLevels = {
    levels: {
      foo: 0,
      bar: 1,
      baz: 2,
      foobar: 3
    },
    colors: {
      foo: 'blue',
      bar: 'green',
      baz: 'yellow',
      foobar: 'red'
    }
  };

  var customLevelLogger = new (wide.Logger)({ levels: myCustomLevels.levels });
  customLevelLogger.foobar('some foobar level-ed message');
```

Although there is slight repetition in this data structure, it enables simple encapsulation if you not to have colors. If you do wish to have colors, in addition to passing the levels to the Logger itself, you must make wide aware of them:

``` js
  //
  // Make wide aware of these colors
  //
  wide.addColors(myCustomLevels.colors);
```

This enables transports with the 'colorize' option set to appropriately color the output of custom levels.

## Further Reading

### Events and Callbacks in Wide
Each instance of wide.Logger is also an instance of an [EventEmitter][1]. A log event will be raised each time a transport successfully logs a message:

``` js
  logger.on('logging', function (transport, level, msg, data) {
    // [msg] and [data] have now been logged at [level] to [transport]
  });

  logger.info('CHILL WINSTON!', { seriously: true });
```

It is also worth mentioning that the logger also emits an 'error' event which you should handle or suppress if you don't want unhandled exceptions:

``` js
  //
  // Handle errors
  //
  logger.on('error', function (err) { /* Do Something */ });

  //
  // Or just suppress them.
  //
  logger.emitErrs = false;
```

Every logging method described in the previous section also takes an optional callback which will be called only when all of the transports have logged the specified message.

``` js
  logger.info('CHILL WINSTON!', { seriously: true }, function (err, level, msg, data) {
    // [msg] and [data] have now been logged at [level] to **every** transport.
  });
```

### Working with multiple Loggers in wide

Often in larger, more complex applications it is necessary to have multiple logger instances with different settings. Each logger is responsible for a different feature area (or category). This is exposed in `wide` in two ways: through `wide.loggers` and instances of `wide.Container`. In fact, `wide.loggers` is just a predefined instance of `wide.Container`:

``` js
  var wide = require('wide');

  //
  // Configure the logger for `category1`
  //
  wide.loggers.add('category1', {
    console: {
      level: 'silly',
      colorize: 'true',
      category: 'category one'
    },
    file: {
      filename: '/path/to/some/file'
    }
  });

  //
  // Configure the logger for `category2`
  //
  wide.loggers.add('category2', {
    couchdb: {
      host: '127.0.0.1',
      port: 5984
    }
  });
```

Now that your loggers are setup you can require wide _in any file in your application_ and access these pre-configured loggers:

``` js
  var wide = require('wide');

  //
  // Grab your preconfigured logger
  //
  var category1 = wide.loggers.get('category1');

  category1.info('logging from your IoC container-based logger');
```

If you prefer to manage the `Container` yourself you can simply instantiate one:

``` js
  var wide = require('wide'),
      container = new wide.Container();

  container.add('category1', {
    console: {
      level: 'silly',
      colorize: 'true'
    },
    file: {
      filename: '/path/to/some/file'
    }
  });
```

### Sharing transports between Loggers in wide

``` js
  var wide = require('wide');

  //
  // Setup transports to be shared across all loggers
  // in three ways:
  //
  // 1. By setting it on the default Container
  // 2. By passing `transports` into the constructor function of wide.Container
  // 3. By passing `transports` into the `.get()` or `.add()` methods
  //

  //
  // 1. By setting it on the default Container
  //
  wide.loggers.options.transports = [
    // Setup your shared transports here
  ];

  //
  // 2. By passing `transports` into the constructor function of wide.Container
  //
  var container = new wide.Container({
    transports: [
      // Setup your shared transports here
    ]
  });

  //
  // 3. By passing `transports` into the `.get()` or `.add()` methods
  //
  wide.loggers.add('some-category', {
    transports: [
      // Setup your shared transports here
    ]
  });

  container.add('some-category', {
    transports: [
      // Setup your shared transports here
    ]
  });
```

### Using wide in a CLI tool
A common use-case for logging is output to a CLI tool. Wide has a special helper method which will pretty print output from your CLI tool. Here's an example from the [require-analyzer][2] written by [Nodejitsu][3]:

```
  info:   require-analyzer starting in /Users/Charlie/Nodejitsu/require-analyzer
  info:   Found existing dependencies
  data:   {
  data:     colors: '0.x.x',
  data:     eyes: '0.1.x',
  data:     findit: '0.0.x',
  data:     npm: '1.0.x',
  data:     optimist: '0.2.x',
  data:     semver: '1.0.x',
  data:     wide: '0.2.x'
  data:   }
  info:   Analyzing dependencies...
  info:   Done analyzing raw dependencies
  info:   Retrieved packages from npm
  warn:   No additional dependencies found
```

Configuring output for this style is easy, just use the `.cli()` method on `wide` or an instance of `wide.Logger`:

``` js
  var wide = require('wide');

  //
  // Configure CLI output on the default logger
  //
  wide.cli();

  //
  // Configure CLI on an instance of wide.Logger
  //
  var logger = new wide.Logger({
    transports: [
      new (wide.transports.Console)()
    ]
  });

  logger.cli();
```

### Extending another object with Logging
Often in a given code base with lots of Loggers it is useful to add logging methods to a different object so that these methods can be called with less syntax. Wide exposes this functionality via the 'extend' method:

``` js
  var myObject = {};

  logger.extend(myObject);

  //
  // You can now call logger methods on 'myObject'
  //
  myObject.info("127.0.0.1 - there's no place like home");
```

## Working with Transports
There are many transports supported by wide core. If you have a transport you would like to add either open an issue or fork and submit a pull request. Commits are welcome, but I'll give you extra street cred if you __add tests too :D__


### Console Transport
``` js
  wide.add(wide.transports.Console, options)
```

The Console transport takes a few simple options:

* __level:__ Level of messages that this transport should log (default 'info').
* __silent:__ Boolean flag indicating whether to suppress output (default false).
* __colorize:__ Boolean flag indicating if we should colorize output (default false).
* __timestamp:__ Boolean flag indicating if we should prepend output with timestamps (default false). If function is specified, its return value will be used instead of timestamps.

*Metadata:* Logged via util.inspect(data);

### File Transport
``` js
  wide.add(wide.transports.File, options)
```

The File transport should really be the 'Stream' transport since it will accept any [WritableStream][14]. It is named such because it will also accept filenames via the 'filename' option:

* __level:__ Level of messages that this transport should log.
* __silent:__ Boolean flag indicating whether to suppress output.
* __colorize:__ Boolean flag indicating if we should colorize output.
* __timestamp:__ Boolean flag indicating if we should prepend output with timestamps (default true). If function is specified, its return value will be used instead of timestamps.
* __filename:__ The filename of the logfile to write output to.
* __maxsize:__ Max size in bytes of the logfile, if the size is exceeded then a new file is created.
* __maxFiles:__ Limit the number of files created when the size of the logfile is exceeded.
* __stream:__ The WriteableStream to write output to.
* __json:__ If true, messages will be logged as JSON (default true).
* __logstash:__ If true, messages will be logged as JSON and formatted for logstash (default false).

*Metadata:* Logged via util.inspect(data);

### Loggly Transport
``` js
  var Loggly = require('wide-loggly').Loggly
  wide.add(Loggly, options);
```

The Loggly transport is based on [Nodejitsu's][3] [node-loggly][6] implementation of the [Loggly][7] API. If you haven't heard of Loggly before, you should probably read their [value proposition][8]. The Loggly transport takes the following options. Either 'inputToken' or 'inputName' is required:

* __level:__ Level of messages that this transport should log.
* __subdomain:__ The subdomain of your Loggly account. *[required]*
* __auth__: The authentication information for your Loggly account. *[required with inputName]*
* __inputName:__ The name of the input this instance should log to.
* __inputToken:__ The input token of the input this instance should log to.
* __json:__ If true, messages will be sent to Loggly as JSON.

*Metadata:* Logged in suggested [Loggly format][2]

### Riak Transport
As of `0.3.0` the Riak transport has been broken out into a new module: [wide-riak][17]. Using it is just as easy:

``` js
  var Riak = require('wide-riak').Riak;
  wide.add(Riak, options);
```

In addition to the options accepted by the [riak-js][3] [client][4], the Riak transport also accepts the following options. It is worth noting that the riak-js debug option is set to *false* by default:

* __level:__ Level of messages that this transport should log.
* __bucket:__ The name of the Riak bucket you wish your logs to be in or a function to generate bucket names dynamically.

``` js
  // Use a single bucket for all your logs
  var singleBucketTransport = new (Riak)({ bucket: 'some-logs-go-here' });

  // Generate a dynamic bucket based on the date and level
  var dynamicBucketTransport = new (Riak)({
    bucket: function (level, msg, data, now) {
      var d = new Date(now);
      return level + [d.getDate(), d.getMonth(), d.getFullYear()].join('-');
    }
  });
```

*Metadata:* Logged as JSON literal in Riak

### MongoDB Transport
As of `0.3.0` the MongoDB transport has been broken out into a new module: [wide-mongodb][16]. Using it is just as easy:

``` js
  var MongoDB = require('wide-mongodb').MongoDB;
  wide.add(MongoDB, options);
```

For more information about its arguments, check [wide-mongodb's README][16].

### SimpleDB Transport

The [wide-simpledb][18] transport is just as easy:

``` js
  var SimpleDB = require('wide-simpledb').SimpleDB;
  wide.add(SimpleDB, options);
```

The SimpleDB transport takes the following options. All items marked with an asterisk are required:

* __awsAccessKey__:* your AWS Access Key
* __secretAccessKey__:* your AWS Secret Access Key
* __awsAccountId__:* your AWS Account Id
* __domainName__:* a string or function that returns the domain name to log to
* __region__:* the region your domain resides in
* __itemName__: a string ('uuid', 'epoch', 'timestamp') or function that returns the item name to log

*Metadata:* Logged as a native JSON object to the 'data' attribute of the item.

### Mail Transport

The [wide-mail][19] is an email transport:

``` js
  var Mail = require('wide-mail').Mail;
  wide.add(Mail, options);
```

The Mail transport uses [emailjs](https://github.com/eleith/emailjs) behind the scenes.  Options are the following:

* __to:__ The address(es) you want to send to. *[required]*
* __from:__ The address you want to send from. (default: `wide@[server-host-name]`)
* __host:__ SMTP server hostname (default: localhost)
* __port:__ SMTP port (default: 587 or 25)
* __username__ User for server auth
* __password__ Password for server auth
* __ssl:__ Use SSL (boolean or object { key, ca, cert })
* __tls:__ Boolean (if true, use starttls)
* __level:__ Level of messages that this transport should log.
* __silent:__ Boolean flag indicating whether to suppress output.

*Metadata:* Stringified as JSON in email.

### Amazon SNS (Simple Notification System) Transport

The [wide-sns][21] transport uses amazon SNS to send emails, texts, or a bunch of other notifications.

``` js
  require('wide-sns').SNS;
  wide.add(wide.transports.SNS, options);
```

Options:

* __aws_key:__ Your Amazon Web Services Key. *[required]*
* __aws_secret:__ Your Amazon Web Services Secret. *[required]*
* __subscriber:__ Subscriber number - found in your SNS AWS Console, after clicking on a topic. Same as AWS Account ID. *[required]*
* __topic_arn:__ Also found in SNS AWS Console - listed under a topic as Topic ARN. *[required]*
* __region:__ AWS Region to use. Can be one of: `us-east-1`,`us-west-1`,`eu-west-1`,`ap-southeast-1`,`ap-northeast-1`,`us-gov-west-1`,`sa-east-1`. (default: `us-east-1`)
* __subject:__ Subject for notifications. (default: "Wide Error Report")
* __message:__ Message of notifications. Uses placeholders for level (%l), error message (%e), and metadata (%m). (default: "Level '%l' Error:\n%e\n\nMetadata:\n%m")
* __level:__ lowest level this transport will log. (default: `info`)

### Graylog2 Transport

[wide-graylog2][22] is a Graylog2 transport:

``` js
  var Graylog2 = require('wide-graylog2').Graylog2;
  wide.add(Graylog2, options);
```

The Graylog2 transport connects to a Graylog2 server over UDP using the following options:

* __level:__ Level of messages this transport should log. (default: info)
* __silent:__ Boolean flag indicating whether to suppress output. (default: false)

* __graylogHost:__ IP address or hostname of the graylog2 server. (default: localhost)
* __graylogPort:__ Port to send messages to on the graylog2 server. (default: 12201)
* __graylogHostname:__ The hostname associated with graylog2 messages. (default: require('os').hostname())
* __graylogFacility:__ The graylog2 facility to send log messages.. (default: nodejs)

*Metadata:* Stringified as JSON in the full message GELF field.

### Papertrail Transport

[wide-papertrail][23] is a Papertrail transport:

``` js
  var Papertrail = require('wide-papertrail').Papertrail;
  wide.add(Papertrail, options);
```

The Papertrail transport connects to a [PapertrailApp log destination](https://papertrailapp.com) over TCP (TLS) using the following options:

* __level:__ Level of messages this transport should log. (default: info)
* __host:__ FQDN or IP address of the Papertrail endpoint.
* __port:__ Port for the Papertrail log destination.
* __hostname:__ The hostname associated with messages. (default: require('os').hostname())
* __program:__ The facility to send log messages.. (default: default)
* __logFormat:__ a log formatting function with the signature `function(level, message)`, which allows custom formatting of the level or message prior to delivery

*Metadata:* Logged as a native JSON object to the 'data' attribute of the item.

### Cassandra Transport

[wide-cassandra][24] is a Cassandra transport:

``` js
  var Cassandra = require('wide-cassandra').Cassandra;
  wide.add(Cassandra, options);
```

The Cassandra transport connects to a cluster using the native protocol with the following options:

* __level:__ Level of messages that this transport should log (default: `'info'`).
* __table:__ The name of the Cassandra column family you want to store log messages in (default: `'logs'`).
* __partitionBy:__ How you want the logs to be partitioned. Possible values `'hour'` and `'day'`(Default).
* __consistency:__ The consistency of the insert query (default: `quorum`).

In addition to the options accepted by the [Node.js Cassandra driver](https://github.com/jorgebay/node-cassandra-cql) Client.

* __hosts:__ Cluster nodes that will handle the write requests:
Array of strings containing the hosts, for example `['host1', 'host2']` (required).
* __keyspace:__ The name of the keyspace that will contain the logs table (required). The keyspace should be already created in the cluster.

### Adding Custom Transports
Adding a custom transport (say for one of the datastore on the Roadmap) is actually pretty easy. All you need to do is accept a couple of options, set a name, implement a log() method, and add it to the set of transports exposed by wide.

``` js
  var util = require('util'),
      wide = require('wide');

  var CustomLogger = wide.transports.CustomerLogger = function (options) {
    //
    // Name this logger
    //
    this.name = 'customLogger';

    //
    // Set the level from your options
    //
    this.level = options.level || 'info';

    //
    // Configure your storage backing as you see fit
    //
  };

  //
  // Inherit from `wide.Transport` so you can take advantage
  // of the base functionality and `.handleExceptions()`.
  //
  util.inherits(CustomLogger, wide.Transport);

  CustomLogger.prototype.log = function (level, msg, data, callback) {
    //
    // Store this message and metadata, maybe use some custom logic
    // then callback indicating success.
    //
    callback(null, true);
  };
```

### Inspirations
1. [npm][0]
2. [log.js][4]
3. [socket.io][5]
4. [node-rlog][6]
5. [BigBrother][7]
6. [Loggly][8]

## Installation

### Installing npm (node package manager)
```
  curl http://npmjs.org/install.sh | sh
```

### Installing wide
```
  [sudo] npm install wide
```

## Run Tests
All of the wide tests are written in [vows][9], and designed to be run with npm.

``` bash
  $ npm test
```

#### Author: [Yuan Tao](https://github.com/taoyuan)
#### Contributors: [Matthew Bergman](http://github.com/fotoverite), [Marak Squires](http://github.com/marak)