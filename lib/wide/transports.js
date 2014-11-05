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
    var TransportClass;
    if (!type) {
        type = 'console';
    } else  if (type instanceof Transport) {
        return type;
    } else if (typeof type === 'object') {
        options = type;
        type = options.type;
    }

    if (typeof type === 'string') {
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
        return new TransportClass(options || {});
    }
};