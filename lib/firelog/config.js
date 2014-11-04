/*
 * config.js: Default settings for all levels that firelog knows about
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var colors = require('colors');

var config = exports,
    allColors = exports.allColors = {};

config.addColors = function (colors) {
    mixin(allColors, colors);
};

config.colorize = function (level, target) {
    var colorized = target || level;
    var color = allColors[level] || allColors['default'];
    if (color instanceof Array) {
        for (var i = 0, l = color.length; i < l; ++i) {
            colorized = colorized[color[i]];
        }
    } else if (color.match(/\s/)) {
        var colorArr = color.split(/\s+/);
        for (var i = 0; i < colorArr.length; ++i) {
            colorized = colorized[colorArr[i]];
        }
        allColors[level] = colorArr;
    } else {
        colorized = colorized[color];
    }
    return colorized;
};

//
// Export config sets
//
config.cli = require('./config/cli-config');
config.npm = require('./config/npm-config');
config.syslog = require('./config/syslog-config');

//
// Add colors for pre-defined config sets
//
config.addColors(config.cli.colors);
config.addColors(config.npm.colors);
config.addColors(config.syslog.colors);

function mixin(target) {
    var args = Array.prototype.slice.call(arguments, 1);

    args.forEach(function (a) {
        var keys = Object.keys(a);
        for (var i = 0; i < keys.length; i++) {
            target[keys[i]] = a[keys[i]];
        }
    });
    return target;
};
