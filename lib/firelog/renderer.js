var cycle = require('cycle');
var config = require('./config');
var common = require('./common');

var Renderer = exports.Render = function Renderer() {

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
Renderer.prototype.render = function (options) {
    var timestampFn = typeof options.timestamp === 'function'
            ? options.timestamp
            : common.timestamp,
        timestamp = options.timestamp ? timestampFn() : null,
        meta = options.meta !== undefined || options.meta !== null ? common.clone(cycle.decycle(options.meta)) : null,
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
        output = common.clone(meta) || {};
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

        output = common.clone(meta) || {};
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

            logstashOutput['@fields'] = common.clone(output);
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
                    : common.serialize(meta)
            );
        }
    }

    return output;
};
