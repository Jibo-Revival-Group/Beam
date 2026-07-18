/**
 * Boolean value from settings service.
 * @interface ValueBoolean
 * @property {boolean} value
 */
export interface ValueBoolean {
    value: boolean;
}
/**
 * Number value from settings service.
 * @interface ValueNumber
 * @property {number} value
 */
export interface ValueNumber {
    value: number;
}
/**
 * Location values.
 * @interface Location
 * @property {number} lat
 * @property {number} lng
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} timezone
 */
export interface Location {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    timezone: string;
}
/**
 * Time values.
 * @interface Time
 * @property {number} hour
 * @property {number} minute
 */
export interface Time {
    hour: number;
    minute: number;
}
