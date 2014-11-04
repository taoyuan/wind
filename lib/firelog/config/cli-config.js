/*
 * cli-config.js: Config that conform to commonly used CLI logging levels.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var cliConfig = exports;

cliConfig.levels = {
    silly: 0,
    input: 1,
    verbose: 2,
    prompt: 3,
    debug: 4,
    info: 5,
    action: 6,
    data: 7,
    help: 8,
    warn: 9,
    error: 10
};

cliConfig.colors = {
    silly: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red',
    default: 'cyan'
};