var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var EventEmitter = exports.EventEmitter = function EventEmitter(conf) {
    EventEmitter2.call(this, conf);
    this._piped = [];
};

util.inherits(EventEmitter, EventEmitter2);

EventEmitter.prototype.emit = function () {
    var args = arguments;
    apply(this, EventEmitter2.prototype.emit, args);
    this._piped.forEach(function (emitter) {
        apply(emitter, emitter.emit, args);
    });
};

EventEmitter.prototype.pipe = function (emitter) {
    this._piped.push(emitter);
};

function apply(scope, fn, args) {
    switch (args.length) {
        case 0: return fn.call(scope);
        case 1: return fn.call(scope, args[0]);
        case 2: return fn.call(scope, args[0], args[1]);
        // slow
        default: return fn.apply(scope, args);
    }
}
