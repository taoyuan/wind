var cycle = require('cycle');
var pad = require('pad');
var config = require('./config');
var common = require('./common');

var Renderer = exports.Render = function Renderer() {
    this._sizes = {
        id: 13,    // Id max chars
        label: 20, // Label max chars
        sumup: 5   // Amount to sum when the label exceeds
    };
    this._compact = process.stdout.columns < 120;
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
//      data:      'additional logging metadata to serialize',
//      colorize:  false, // Colorizes output (only if `.json` is false)
//      timestamp: true   // Adds a timestamp to the serialized message
//    }
//
Renderer.prototype.render = function (options) {
    var timestampFn = typeof options.timestamp === 'function' ? options.timestamp : common.timestamp;
    var timestamp = options.timestamp ? timestampFn(options.timestamp) : null;
    var data = options.data !== undefined || options.data !== null ? common.clone(cycle.decycle(options.data)) : null;

    //
    // raw mode is intended for outputing wide as streaming JSON to STDOUT
    //
    if (options.raw) {
        return this.renderRaw(timestamp, data, options);
    }

    //
    // json mode is intended for pretty printing multi-line json to the terminal
    //
    if (options.json || true === options.logstash) {
        return this.renderJson(timestamp, data, options);
    }

    return this.renderString(timestamp, data, options);
};

Renderer.prototype.renderRaw = function (timestamp, data, options) {
    var output;
    if (typeof data !== 'object' && data != null) {
        data = {data: data};
    }
    output = common.clone(data) || {};
    if (options.id) output.id = options.id;
    if (options.label) output.label = options.label;
    output.level = options.level;
    output.message = options.message.stripColors;
    return JSON.stringify(output);
};

Renderer.prototype.renderJson = function (timestamp, data, options) {
    var output;

    if (typeof data !== 'object' && data != null) {
        data = {data: data};
    }

    output = common.clone(data) || {};
    output.level = options.level;
    output.message = options.message;
    if (options.id) output.id = options.id;
    if (options.label) output.label = options.label;
    if (timestamp) output.timestamp = timestamp;

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
};


Renderer.prototype.renderString = function (timestamp, data, options) {
    var output;
    var colorize = options.colorize ? config.colorize : function (s) {
        return s;
    };

    output = timestamp ? timestamp.grey + ' ' : '';
    output += options.appname ? (options.appname + ' ') : '';

    var label = options.label;
    var id = options.id;

    if (!this._compact && label && id) {
        // Construct the label
        var length = id.length + label.length + 1;
        var nrSpaces = this._sizes.id + this._sizes.label - length;

        // Ensure at least one space between the label and the id
        if (nrSpaces < 1) {
            // Also adjust the label size for subsequent logs
            this._sizes.label = label.length + this._sizes.sumup;
            nrSpaces = this._sizes.id + this._sizes.label - length;
        }

        output += label.green + common.repeat(' ', nrSpaces) + colorize(options.level, id) + ' ';

    } else if (id) {
        // If there's not enough space for the id, adjust it
        // for subsequent logs
        if (id.length > this._sizes.id) {
            this._sizes.id = id.length += this._sizes.sumup;
        }

        output += colorize(options.level, pad(id, this._sizes.id)) + ' ';
    }


    //output += colorize(options.level);
    //output += ': ';
    //output += options.id ? ('[' + colorize(options.level, options.id) + '] ') : '';

    output += options.message;

    if (data !== null && data !== undefined) {
        if (data && data instanceof Error && data.stack) {
            data = data.stack;
        }

        if (typeof data !== 'object') {
            output += ' ' + data;
        }
        else if (Object.keys(data).length > 0) {
            output += ' ' + (
                options.prettyPrint
                    ? ('\n' + util.inspect(data, false, null, options.colorize))
                    : common.serialize(data)
            );
        }
    }

    return output;
};