/** @promisify method decorator
 * Assumes the last argument is suppose to be a callback.  If the last
 * argument isn't a function, then assume the callback was left off on
 * purpose to receive a promise instead. Call the method, wrap it in a
 * promise, and return the promise.
 * Note: only works with callbacks that have one argument or less
 * (other than the err object)
 * @private
 */

/** @promisify_4 method decorator
 * Like @promisify, except specifically checks if the 4th argument is
 * a function.
 * @private
 */

/** @deprecate method decorator
 * Outputs a warning message that a method has been deprecated.  Takes
 * one argument, a message string describing the deprecation.
 *
 * The decorator takes the argument just like a function:
 *   @deprecate('foo is bad, use method bar instead')
 * @private
 */