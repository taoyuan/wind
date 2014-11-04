var util = require('util'),
    colors = require('colors'),
    common = require('../common'),
    Transport = require('./transport').Transport;

//
// ### function Console (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Console transport object responsible
// for persisting log messages and metadata to a terminal or TTY.
//
var Console = exports.Console = function (options) {
    Transport.call(this, options);
    options = options || {};

    this.json = options.json || false;
    this.colorize = options.colorize || true;
    this.prettyPrint = options.prettyPrint || false;
    this.timestamp = typeof options.timestamp !== 'undefined' ? options.timestamp : false;
    this.category = options.category || null;

    if (this.json) {
        this.stringify = options.stringify || function (obj) {
            return JSON.stringify(obj, null, 2);
        };
    }
};

//
// Inherit from `firelog.Transport`.
//
util.inherits(Console, Transport);

//
// Expose the name of this Transport on the prototype
//
Console.prototype.name = 'console';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Firelog. Metadata is optional.
//
Console.prototype.log = function (rec, callback) {
    if (this.silent) {
        return callback(null, true);
    }

    var self = this,
        output;

    output = this.renderer.render({
        appname: this.appname,
        colorize: this.colorize,
        json: this.json,
        level: rec.level,
        message: rec.message,
        meta: rec.meta,
        stringify: this.stringify,
        timestamp: this.timestamp,
        prettyPrint: this.prettyPrint,
        raw: this.raw,
        id: this.category || rec.id,
        label: rec.label
    });

    if (rec.level === 'error' || rec.level === 'debug') {
        process.stderr.write(output + '\n');
    } else {
        process.stdout.write(output + '\n');
    }

    //
    // Emit the `logged` event immediately because the event loop
    // will not exit until `process.stdout` has drained anyway.
    //
    self.emit('logged');
    callback(null, true);
};
