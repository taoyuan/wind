var assert = require('chai').assert,
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    util = require('util'),
    wide = require('../lib/wide');

var helpers = exports;

helpers.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            size++;
        }
    }

    return size;
};

helpers.tryUnlink = function (file) {
    try {
        fs.unlinkSync(file)
    }
    catch (ex) {
    }
};

helpers.it = function (title, fn, setup) {
    it(title, function (done) {
        var that = this;
        var completed = false;
        that.done = function () {
            if (completed) return;
            completed = true;
            done();
        };
        setup = setup || function (fn) {
            fn(that.done);
        };
        setup(function () {
            fn.apply(that, arguments);
            that.done();
        });
    })
};

helpers.assertDateInfo = function (info) {
    assert.isNumber(Date.parse(info));
};

helpers.assertProcessInfo = function (info) {
    assert.isNumber(info.pid);
    assert.isNumber(info.uid);
    assert.isNumber(info.gid);
    assert.isString(info.cwd);
    assert.isString(info.execPath);
    assert.isString(info.version);
    assert.isArray(info.argv);
    assert.isObject(info.memoryUsage);
};

helpers.assertOsInfo = function (info) {
    assert.isArray(info.loadavg);
    assert.isNumber(info.uptime);
};

helpers.assertTrace = function (trace) {
    trace.forEach(function (site) {
        assert.isTrue(!site.column || typeof site.column === 'number');
        assert.isTrue(!site.line || typeof site.line === 'number');
        assert.isTrue(!site.file || typeof site.file === 'string');
        assert.isTrue(!site.method || typeof site.method === 'string');
        assert.isTrue(!site.function || typeof site.function === 'string');
        assert.isTrue(typeof site.native === 'boolean');
    });
};

helpers.assertLogger = function (logger, level) {
    assert.instanceOf(logger, wide.Logger);
    assert.isFunction(logger.log);
    assert.isFunction(logger.add);
    assert.isFunction(logger.remove);
    assert.equal(logger.level, level || "info");
    Object.keys(logger.levels).forEach(function (method) {
        assert.isFunction(logger[method]);
    });
};

helpers.assertConsole = function (transport) {
    assert.instanceOf(transport, wide.transports.Console);
    assert.isFunction(transport.log);
};

helpers.assertMemory = function (transport) {
    assert.instanceOf(transport, wide.transports.Memory);
    assert.isFunction(transport.log);
};

helpers.assertFile = function (transport) {
    assert.instanceOf(transport, wide.transports.File);
    assert.isFunction(transport.log);
};

helpers.assertDailyRotateFile = function (transport) {
    assert.instanceOf(transport, wide.transports.DailyRotateFile);
    assert.isFunction(transport.log);
};

helpers.assertWebhook = function (transport) {
    assert.instanceOf(transport, wide.transports.Webhook);
    assert.isFunction(transport.log);
};

helpers.assertCouchdb = function (transport) {
    assert.instanceOf(transport, wide.transports.Couchdb);
    assert.isFunction(transport.log);
};

helpers.assertHandleExceptions = function (options) {
    function setup(callback) {
        var child = spawn('node', [options.script]);

        helpers.tryUnlink(options.logfile);
        child.on('exit', function () {
            fs.readFile(options.logfile, callback);
        })
    }

    it("should save the error information to the specified file", function (done) {
        setup(function (err, data) {
            assert.isTrue(!err);
            data = JSON.parse(data);

            assert.isObject(data);
            helpers.assertProcessInfo(data.process);
            helpers.assertOsInfo(data.os);
            helpers.assertTrace(data.trace);
            if (options.message) {
                assert.equal('uncaughtException: ' + options.message, data.message);
            }
            done();
        })
    });
};

helpers.testNpmLevels = function (transport, assertMsg, assertFn) {
    return helpers.testLevels(wide.config.npm.levels, transport, assertMsg, assertFn);
};

helpers.testSyslogLevels = function (transport, assertMsg, assertFn) {
    return helpers.testLevels(wide.config.syslog.levels, transport, assertMsg, assertFn);
};

helpers.testLevels = function (levels, transport, assertMsg, assertFn) {
    Object.keys(levels).forEach(function (level) {
        function testSetup(callback) {
            transport.log(level, 'test message', {}, callback.bind(this, null));
        }

        describe('with the ' + level + ' level', function () {
            helpers.it(assertMsg, assertFn, testSetup);
        });
    });

    function metadatatestSetup(callback) {
        transport.log('info', 'test message', {metadata: true}, callback.bind(this, null));
    }

    describe('when passed metadata', function () {
        helpers.it(assertMsg, assertFn, metadatatestSetup);
    });

    function primmetadataSetup(callback) {
        transport.log('info', 'test', 'test message', 'metadata', callback.bind(this, null));
    }

    describe('when passed primitive metadata', function () {
        helpers.it(assertMsg, assertFn, primmetadataSetup);
    });

    var circmetadata = {};
    circmetadata['metadata'] = circmetadata;

    function circmetadataSetup(callback) {
        transport.log('info', 'test message', circmetadata, callback.bind(this, null));
    }

    describe('when passed circular metadata', function () {
        helpers.it(assertMsg, assertFn, circmetadataSetup);
    });
};
