import * as types from './Types';
import { Request } from './Request';
import { Events } from './Events';
import { Log as JiboLog } from 'jibo-log';
/**
 * The Client to the Jetstream on-robot service
 * @class jibo.jetstream.Client
 * @intdocs
 */
export declare class Client {
    /**
     * @name jibo.jetstream.Client#events
     * @type jibo.jetstream.Events
     */
    events: Events;
    /**
     * @name jibo.jetstream.Client#options
     * @type {jibo.jetstream.types.HostOptions}
     */
    options: types.HostOptions;
    /**
     * @name jibo.jetstream.Client._requests
     * @type {Map}
     * @description `Map<string, Request>`
     */
    _requests: Map<string, Request>;
    private cloudSkillResponseRegistry;
    private cullInterval;
    private eventWS;
    private vadWS;
    /**
     * Initializes client. Connects to WS server in Jetstream
     * @returns {Promise<void>}
     * @method jibo.jetstream.Client#init
     * @param options {jibo.jetstream.types.HostOptions}
     * @param [log] {JiboLog}
     */
    init(options: types.HostOptions, log?: JiboLog): Promise<void>;
    /**
     * Closes websocket connection
     * @method jibo.jetstream.Client#close
     */
    close(): void;
    /**
     * Gets the requestID from the response (if it exists).
     * @method jibo.jetstream.Client#getRequestID
     * @param  {any} response Response from the Jetstream request.
     * @return {string}
     */
    getRequestID(response: any): string;
    /**
     * Gets a promise for a cloud skill response from a skill launch. Provided so that skill
     * launches can be handled in the SSM but cloud responses handled in Be.
     * @method jibo.jetstream.Client#getCloudSkillResponse
     * @param {string} transID
     * @return {Promise<any>}
     * @intdocs
     */
    getCloudSkillResponse(transID: string): Promise<any>;
    private handleMessage;
    private handleVAD;
    private emitError(error);
    private emitSkillSwitch(match, asr, nlu, transID);
    private cancelAllRequests();
}
