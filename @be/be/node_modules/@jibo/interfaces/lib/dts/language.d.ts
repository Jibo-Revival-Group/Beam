/**
 * The currently supported language codes.
 * Currently, only English (`en-US`) and Canadian English (`en-CA`) are supported.
 */
export declare type LanguageCode = 'en-US' | 'en-CA';
/** Interface for language data */
export interface LanguageData {
    /** Language to use */
    lang: LanguageCode;
}
