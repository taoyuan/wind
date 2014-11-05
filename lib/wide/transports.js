var fs = require('fs'),
    path = require('path'),
    common = require('./common'),
    Transport = require('./transports/transport').Transport;

var transports = {};

//
// Setup all transports as lazy-loaded getters.
//
fs.readdirSync(path.join(__dirname, 'transports')).forEach(function (file) {
    var transport = file.replace('.js', ''),
        name = common.capitalize(transport);

    if (transport === 'transport') {
        return;
    }
    else if (~transport.indexOf('-')) {
        name = transport.split('-').map(function (part) {
            return common.capitalize(part);
        }).join('');
    }

    transports.__defineGetter__(transport, function () {
        return require('./transports/' + transport)[name];
    });

    transports.__defineGetter__(name, function () {
        return require('./transports/' + transport)[name];
    });
});

exports.get = function (type, options) {
    var TransportClass, inst;
    if (!type) {
        type = 'console';
    } else  if (typeof type.log === 'function') {
        inst = type;
        type = null;
    } else if (typeof type === 'object') {
        options = type;
        type = options.type;
    }

    if (!inst && typeof type === 'string') {
        TransportClass = transports[type];
        if (!TransportClass) {
            try {
                TransportClass = require(type);
            } catch (e) {
            }
        }
        if (!TransportClass) {
            throw new Error('Invalid transport ' + type);
        }
        inst = new TransportClass(options || {});
    }

    if (!inst.name) {
        inst.name = '$' + inst.constructor.name;
    }
    return inst;
};