/**
 * Registration Record
 * @class RegistrationRecord
 */
interface RegistrationRecord {
    /**
     * Name
     * @name RegistrationRecord#name
     * @type {String}
     */
    name: string;
    /**
     * Host
     * @name RegistrationRecord#host
     * @type {String}
     */
    host: string;
    /**
     * Port
     * @name RegistrationRecord#port
     * @type {Number}
     */
    port: number;
    /**
     * Path
     * @name RegistrationRecord#path
     * @type {String}
     */
    path: string;
    /**
     * TTL
     * @name RegistrationRecord#ttl
     * @type {Number}
     */
    ttl?: number;
    /**
     * TLS
     * @name RegistrationRecord#tls
     * @type {String}
     */
    tls?: string;
}
export default RegistrationRecord;
