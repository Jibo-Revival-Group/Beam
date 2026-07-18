import { HostOptions } from './Types';
/**
 * Class containing Jetstream Client Utilities.
 * @class jibo.jetstream.Utils
 * @intdocs
 */
export declare class Utils {
    /**
     * @description Helper method to send post requests to a provided location.
     * @method jibo.jetstream.Utils#sendPostRequest
     * @param hostOptions {jibo.jetstream.types.HostOptions} Hostname and port information.
     * @param path {string} Path/URL to make the request to.
     * @param postData {any} Data to be posted on the request.
     * @return {Promise<any>} Promise containing the result of the request.
     */
    static sendPostRequest(hostOptions: HostOptions, path: string, postData: any, retries?: number): Promise<any>;
}
