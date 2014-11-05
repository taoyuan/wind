var t = require('chai').assert;
var wide = require('../lib/wide');

function CapturingTransport(name, options) {
    if (typeof name === 'object') {
        options = name;
        name = null;
    }
    this.name = name || 'capturing';
    wide.mixin(this, options);
    this.recs = [];
}

CapturingTransport.prototype.log = function (rec) {
    this.recs.push(rec);
};

describe('child-behaviour', function () {

    it('child can add stream', function () {
        var dadTransport = new CapturingTransport();
        var dad = wide.createLogger({
            level: 'info',
            transports: [dadTransport]
        });

        var sonTransport = new CapturingTransport();
        var son = dad.child({
            level: 'debug',
            transports: [sonTransport]
        });

        dad.info('info from dad');
        dad.debug('debug from dad');
        son.debug('debug from son');

        var rec;
        t.equal(dadTransport.recs.length, 1);
        rec = dadTransport.recs[0];
        t.equal(rec.message, 'info from dad');
        t.equal(sonTransport.recs.length, 1);
        rec = sonTransport.recs[0];
        t.equal(rec.message, 'debug from son');
    });


    it('child can set level of inherited transports', function () {
        var dadTransport = new CapturingTransport();
        var dad = wide.createLogger({
            level: 'info',
            transports: [dadTransport]
        });

        // Intention here is that the inherited `dadTransport` logs at 'debug' level
        // for the son.
        var son = dad.child({
            level: 'debug'
        });

        dad.info('info from dad');
        dad.debug('debug from dad');
        son.debug('debug from son');

        var rec;
        t.equal(dadTransport.recs.length, 2);
        rec = dadTransport.recs[0];
        t.equal(rec.message, 'info from dad');
        rec = dadTransport.recs[1];
        t.equal(rec.message, 'debug from son');
    });


    it('child can set level of inherited transports and add transports', function () {
        var dadTransport = new CapturingTransport();
        var dad = wide.createLogger({
            level: 'info',
            transports: [ dadTransport ]
        });

        // Intention here is that the inherited `dadTransport` logs at 'debug' level
        // for the son.
        var sonTransport = new CapturingTransport('son', {level: 'debug'});
        var son = dad.child({
            level: 'silly',
            transports: [ sonTransport ]
        });

        dad.info('info from dad');
        dad.silly('silly from dad');
        son.silly('silly from son');
        son.debug('debug from son');

        t.equal(dadTransport.recs.length, 3);
        t.equal(dadTransport.recs[0].message, 'info from dad');
        t.equal(dadTransport.recs[1].message, 'silly from son');
        t.equal(dadTransport.recs[2].message, 'debug from son');

        t.equal(sonTransport.recs.length, 1);
        t.equal(sonTransport.recs[0].message, 'debug from son');
    });
});