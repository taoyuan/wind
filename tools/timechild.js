#!/usr/bin/env node
/*
 * Time `log.child(...)`.
 *
 * Getting 0.011ms on my Mac. For about 1000 req/s that means that the
 * `log.child` would be about 1% of the time handling that request.
 * Could do better. I.e. consider a hackish fast path.
 *
 * ...
 *
 * Added: `log.fastchild({...}, true)`. Use the `true` to assert that
 * the given options are just new fields (and no serializers).
 * Result: Another order of magnitude.
 */

var ben = require('ben');  // npm install ben
var Logger = require('../lib').Logger;

var log = new Logger({
    transports: [
        {
            type: 'file',
            filename: __dirname + '/timechild.log'
        },
        {
            type: 'console'
        }
    ]
});

console.log('Time `log.child`:');

var ms;

ms = ben(1e5, function () {
    var child = log.child();
});
console.log(' - adding nothing:  %dms per iteration', ms);

function fooRewriter(obj) {
    return {bar: obj.bar};
}
ms = ben(1e5, function () {
    var child = log.child({
        rewriters: [fooRewriter]
    });
});
console.log(' - adding one rewriter: %dms per iteration', ms);

ms = ben(1e5, function () {
    var child = log.child({
        transports: [ {type: 'memory'} ]
    });
});
console.log(' - adding one transports: %dms per iteration',
    ms);

ms = ben(1e6, function () {
    var child = log.child({}, true);
});
console.log(' - [fast] adding nothing:  %dms per iteration', ms);