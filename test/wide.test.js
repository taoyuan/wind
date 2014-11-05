var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    assert = require('chai').assert,
    wide = require('..'),
    helpers = require('./helpers');

describe('wide', function () {
    wide.transports.console.colorize = true;

    it('should have the correct methods defined', function () {
        wide.transports.console.level = 'silly';
        assert.isFunction(wide.Transport);
        assert.isObject(wide.transports.console);
        assert.isFalse(wide.emitErrs);
        assert.isObject(wide.config);
        ['Logger', 'add', 'remove', 'extend', 'clear']
            .concat(Object.keys(wide.config.npm.levels))
            .forEach(function (key) {
                assert.isFunction(wide[key]);
            });
    });

    it('have the correct version set', function (done) {
        fs.readFile(path.join(__dirname, '..', 'package.json'), function (err, data) {
            assert.isNull(err);
            data = JSON.parse(data.toString());
            assert.equal(wide.version, data.version);
            done();
        });
    });

    describe('#log()', function () {
        helpers.testNpmLevels(wide, "should respond without an error", function (err) {
            assert.isNull(err);
        });
    });

    describe('extend() method called on an empty object', function () {
        var obj = {};
        wide.extend(obj);

        it('should define the appropriate methods', function () {
            ['log', 'profile', 'startTimer'].concat(Object.keys(wide.config.npm.levels)).forEach(function (method) {
                assert.isFunction(obj[method]);
            });
        })
    });

    describe('#setLevels()', function () {
        it('should have the proper methods defined', function () {
            wide.setLevels(wide.config.syslog.levels);
            assert.isObject(wide.transports.console);
            assert.isFalse(wide.emitErrs);
            assert.isObject(wide.config);

            var newLevels = Object.keys(wide.config.syslog.levels);
            ['Logger', 'add', 'remove', 'extend', 'clear']
                .concat(newLevels)
                .forEach(function (key) {
                    assert.isFunction(wide[key]);
                });


            Object.keys(wide.config.npm.levels)
                .filter(function (key) {
                    return newLevels.indexOf(key) === -1;
                })
                .forEach(function (key) {
                    assert.isTrue(typeof wide[key] === 'undefined');
                });
        });
    });
});
