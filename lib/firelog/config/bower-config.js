/*
 * bower-config.js: Config that conform to bower logging levels.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var config = exports;

config.levels = {
    debug: 0,
    info: 1,
    action: 2,
    warn: 3,
    conflict: 4,
    error: 5
};

config.colors = {
    warn: 'yellow',
    error: 'red',
    conflict: 'magenta',
    debug: 'gray',
    default: 'cyan'
};