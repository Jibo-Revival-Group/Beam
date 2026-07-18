import { Event } from 'jibo-typed-events';
import { HotwordListenMode as Mode, SuccessTurnResult } from './Types';
/**
 * Token representing a call to jibo.jetstream.setHotwordMode().
 * @class jibo.jetstream.HotwordModeToken
 */
export declare class HotwordModeToken {
    /**
     * Promise for when the mode is fully active, if you wanted to wait on it.
     * @name jibo.jetstream.HotwordModeToken#activated
     * @type {Promise<void>}
     */
    activated: Promise<void>;
    /**
     * `Global match`
     * @name jibo.jetstream.HotwordModeToken#match
     * @type {Event<jibo.jetstream.types.SuccessTurnResult>}
     */
    match: Event<SuccessTurnResult>;
    /**
     * @hideConstructor
     */
    constructor(mode: Mode, rules?: string[]);
    /**
     * Releases the token, permanently disabling it.
     * @method jibo.jetstream.HotwordModeToken#release
     * @returns {Promise<void>}
     */
    release(): Promise<void>;
    private onGlobalResult(result);
}
export declare function generateToken(mode: Mode, rules?: string[]): HotwordModeToken;
export declare function resetMode(): Promise<void>;
