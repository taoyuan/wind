var events = require('events'),
    util = require('util'),
    colors = require('colors'),
    common = require('../common'),
    Transport = require('./transport').Transport;

//
// ### function Memory (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Memory transport object responsible
// for persisting log messages and metadata to a memory array of messages.
//
var Memory = exports.Memory = function (options) {
    Transport.call(this, options);
    options = options || {};

    this.errorOutput = [];
    this.writeOutput = [];

    this.json = options.json || false;
    this.colorize = options.colorize || false;
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
util.inherits(Memory, Transport);

//
// Expose the name of this Transport on the prototype
//
Memory.prototype.name = 'memory';

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Firelog. Metadata is optional.
//
Memory.prototype.log = function (rec, callback) {
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
        id: rec.id || this.category
    });

    if (rec.level === 'error' || rec.level === 'debug') {
        this.errorOutput.push(output);
    } else {
        this.writeOutput.push(output);
    }

    self.emit('logged');
    callback(null, true);
};

Memory.prototype.clearLogs = function () {
    this.errorOutput = [];
    this.writeOutput = [];
};