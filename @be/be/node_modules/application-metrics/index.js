var timers = {};

/**
 * Start timer.
 *
 */
exports.start = function(timer_name, verbose) {

    if (verbose === true) {
        console.log('[TIMER] start - %s', timer_name);
    }

    timers[timer_name] = Date.now();
};


/**
 * Stop timer and calculate delta.
 *
 */
exports.stop = function(timer_name, verbose) {
    
    var delta = Date.now() - timers[timer_name];

    if (verbose === true) {
        console.log('[TIMER] stop - %s: %s (%s seconds)', timer_name, delta, delta/1000);
    }
    
    delete timers[timer_name];

    return delta;
};
