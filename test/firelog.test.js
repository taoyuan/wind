var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    assert = require('chai').assert,
    firelog = require('../lib/firelog'),
    helpers = require('./helpers');

describe('firelog', function () {
    firelog.default.transports.console.colorize = true;

    it('should have the correct methods defined', function () {
        firelog.default.transports.console.level = 'silly';
        assert.isObject(firelog.transports);
        assert.isFunction(firelog.Transport);
        assert.isTrue(!firelog.transports.Transport);
        assert.isFunction(firelog.transports.Console);
        assert.isFunction(firelog.transports.File);
        assert.isFunction(firelog.transports.Webhook);
        assert.isObject(firelog.default.transports.console);
        assert.isFalse(firelog.emitErrs);
        assert.isObject(firelog.config);
        ['Logger', 'add', 'remove', 'extend', 'clear']
            .concat(Object.keys(firelog.config.npm.levels))
            .forEach(function (key) {
                assert.isFunction(firelog[key]);
            });
    });

    it('have the correct version set', function (done) {
        fs.readFile(path.join(__dirname, '..', 'package.json'), function (err, data) {
            assert.isNull(err);
            data = JSON.parse(data.toString());
            assert.equal(firelog.version, data.version);
            done();
        });
    });

    describe('#log()', function () {
        helpers.testNpmLevels(firelog, "should respond without an error", function (err) {
            assert.isNull(err);
        });
    });

    describe('extend() method called on an empty object', function () {
        var obj = {};
        firelog.extend(obj);

        it('should define the appropriate methods', function () {
            ['log', 'profile', 'startTimer'].concat(Object.keys(firelog.config.npm.levels)).forEach(function (method) {
                assert.isFunction(obj[method]);
            });
        })
    });

    describe('#setLevels()', function () {
        it('should have the proper methods defined', function () {
            firelog.setLevels(firelog.config.syslog.levels);
            assert.isObject(firelog.transports);
            assert.isFunction(firelog.transports.Console);
            assert.isFunction(firelog.transports.Webhook);
            assert.isObject(firelog.default.transports.console);
            assert.isFalse(firelog.emitErrs);
            assert.isObject(firelog.config);

            var newLevels = Object.keys(firelog.config.syslog.levels);
            ['Logger', 'add', 'remove', 'extend', 'clear']
                .concat(newLevels)
                .forEach(function (key) {
                    assert.isFunction(firelog[key]);
                });


            Object.keys(firelog.config.npm.levels)
                .filter(function (key) {
                    return newLevels.indexOf(key) === -1;
                })
                .forEach(function (key) {
                    assert.isTrue(typeof firelog[key] === 'undefined');
                });
        });
    });
});
