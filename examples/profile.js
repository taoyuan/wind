var wide = require('../lib/wide');

//
// Start profile of 'test'
// Remark: Consider using Date.now() with async operations
//
wide.profile('test');

setTimeout(function () {
    //
    // Stop profile of 'test'. Logging will now take place:
    //   "17 Jan 21:00:00 - info: test duration=1000ms"
    //
    wide.profile('test', 'timeout profile');
}, 1000);