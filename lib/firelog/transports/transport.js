var events = require('events'),
    util = require('util'),
    Renderer = require('../renderer').Render;

//
// ### function Transport (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Tranport object responsible
// base functionality for all firelog transports.
//
var Transport = exports.Transport = function (options) {
    events.EventEmitter.call(this);

    options = options || {};
    this.appname = options.appname;
    this.level = options.level === undefined ? 'info' : options.level;
    this.silent = options.silent || false;
    this.raw = options.raw || false;
    this.name = options.name || this.name;

    this.handleExceptions = options.handleExceptions || false;

    this.renderer = new Renderer();
};

//
// Inherit from `events.EventEmitter`.
//
util.inherits(Transport, events.EventEmitter);

//
// ### function formatQuery (query)
// #### @query {string|Object} Query to format
// Formats the specified `query` Object (or string) to conform
// with the underlying implementation of this transport.
//
Transport.prototype.formatQuery = function (query) {
    return query;
};

//
// ### function normalizeQuery (query)
// #### @options {string|Object} Query to normalize
// Normalize options for query
//
Transport.prototype.normalizeQuery = function (options) {
    //
    // Use options similar to loggly.
    // [See Loggly Search API](http://wiki.loggly.com/retrieve_events#optional)
    //

    options = options || {};

    // limit
    options.rows = options.rows || options.limit || 10;

    // starting row offset
    options.start = options.start || 0;

    // now - 24
    options.from = options.from || new Date - (24 * 60 * 60 * 1000);
    if (typeof options.from !== 'object') {
        options.from = new Date(options.from);
    }

    // now
    options.until = options.until || new Date;
    if (typeof options.until !== 'object') {
        options.until = new Date(options.until);
    }

    // 'asc' or 'desc'
    options.order = options.order || 'desc';

    // which fields to select
    //options.fields = options.fields;

    return options;
};

//
// ### function formatResults (results, options)
// #### @results {Object|Array} Results returned from `.query`.
// #### @options {Object} **Optional** Formatting options
// Formats the specified `results` with the given `options` accordinging
// to the implementation of this transport.
//
Transport.prototype.formatResults = function (results, options) {
    return results;
};

//
// ### function logException (msg, meta, callback)
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Logs the specified `msg`, `meta` and responds to the callback once the log
// operation is complete to ensure that the event loop will not exit before
// all logging has completed.
//
Transport.prototype.logException = function (msg, meta, callback) {
    var self = this;

    function onLogged() {
        self.removeListener('error', onError);
        callback();
    }

    function onError() {
        self.removeListener('logged', onLogged);
        callback();
    }

    this.once('logged', onLogged);
    this.once('error', onError);
    this.log({level: 'error', message: msg, meta: meta}, function () {
    });
};


//
// ### function log (options)
// #### @options {Object} All information about the log serialization.
// Generic logging function for returning timestamped strings
// with the following options:
//
//    {
//      level:     'level to add to serialized message',
//      id:        'id to prepend the message'
//      message:   'message to serialize',
//      meta:      'additional logging metadata to serialize',
//      colorize:  false, // Colorizes output (only if `.json` is false)
//      timestamp: true   // Adds a timestamp to the serialized message
//    }
//
Transport.prototype.log = function (options) {
    var timestampFn = typeof options.timestamp === 'function'
            ? options.timestamp
            : exports.timestamp,
        timestamp = options.timestamp ? timestampFn() : null,
        meta = options.meta !== undefined || options.meta !== null ? exports.clone(cycle.decycle(options.meta)) : null,
        output;

    var id = options.id;
    var colorize = options.colorize ? config.colorize : function (s) {
        return s;
    };

    //
    // raw mode is intended for outputing firelog as streaming JSON to STDOUT
    //
    if (options.raw) {
        if (typeof meta !== 'object' && meta != null) {
            meta = {meta: meta};
        }
        output = exports.clone(meta) || {};
        if (id) output.id = id;
        output.level = options.level;
        output.message = options.message.stripColors;
        return JSON.stringify(output);
    }

    //
    // json mode is intended for pretty printing multi-line json to the terminal
    //
    if (options.json || true === options.logstash) {
        if (typeof meta !== 'object' && meta != null) {
            meta = {meta: meta};
        }

        output = exports.clone(meta) || {};
        output.level = options.level;
        output.message = options.message;
        if (id) output.id = id;
        if (timestamp) {
            output.timestamp = timestamp;
        }

        if (options.logstash === true) {
            // use logstash format
            var logstashOutput = {};
            if (output.message !== undefined) {
                logstashOutput['@message'] = output.message;
                delete output.message;
            }

            if (output.timestamp !== undefined) {
                logstashOutput['@timestamp'] = output.timestamp;
                delete output.timestamp;
            }

            logstashOutput['@fields'] = exports.clone(output);
            output = logstashOutput;
        }

        if (typeof options.stringify === 'function') {
            return options.stringify(output);
        }

        return JSON.stringify(output, function (key, value) {
            return value instanceof Buffer
                ? value.toString('base64')
                : value;
        });
    }

    output = timestamp ? timestamp + ' - ' : '';
    output += options.appname ? (' ' + options.appname + ' ') : '';
    output += colorize(options.level);
    output += ': ';
    output += id ? ('[' + colorize(options.level, id) + '] ') : '';
    output += options.message;

    if (meta !== null && meta !== undefined) {
        if (meta && meta instanceof Error && meta.stack) {
            meta = meta.stack;
        }

        if (typeof meta !== 'object') {
            output += ' ' + meta;
        }
        else if (Object.keys(meta).length > 0) {
            output += ' ' + (
                options.prettyPrint
                    ? ('\n' + util.inspect(meta, false, null, options.colorize))
                    : exports.serialize(meta)
            );
        }
    }

    return output;
};

