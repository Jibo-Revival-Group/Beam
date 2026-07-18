import { ValueBoolean, ValueNumber, Location, Time } from '../settings';
/**
 * Response from Settings service for report-skill.
 * @property {PersonalReportSettingsData} data
 * @property {string} skillId
 */
export interface PersonalReportSettingsResponse {
    data: PersonalReportSettingsData;
    skillId: string;
}
/**
 * Data in Settings response for report-skill.
 * @interface PersonalReportSettingsData
 * @property {ValueBoolean} locationEnabled
 * @property {ValueBoolean} weatherEnabled
 * @property {ValueNumber} weather
 * @property {ValueLocation} homeLocation
 * @property {ValueLocation} workLocation
 * @property {ValueBoolean} commuteEnabled
 * @property {ValueNumber} commuteType
 * @property {ValueTime} commuteTime
 * @property {ValueBoolean} calendarEnabled
 * @property {ValueBoolean} newsEnabled
 * @property {ValueBoolean} newsNational
 * @property {ValueBoolean} newsBusiness
 * @property {ValueBoolean} newsEntertainment
 * @property {ValueBoolean} newsInternational
 * @property {ValueBoolean} newsSports
 * @property {ValueBoolean} newsHealth
 * @property {ValueBoolean} newsPolitics
 * @property {ValueBoolean} newsScience
 * @property {ValueBoolean} newsTechnology
 * @property {ValueBoolean} newsStrange
 */
export interface PersonalReportSettingsData {
    locationEnabled: ValueBoolean;
    weatherEnabled: ValueBoolean;
    weather: ValueNumber;
    homeLocation: Location;
    workLocation: Location;
    commuteEnabled: ValueBoolean;
    commuteType: ValueNumber;
    commuteTime: Time;
    calendarEnabled: ValueBoolean;
    newsEnabled: ValueBoolean;
    newsNational: ValueBoolean;
    newsBusiness: ValueBoolean;
    newsEntertainment: ValueBoolean;
    newsInternational: ValueBoolean;
    newsSports: ValueBoolean;
    newsHealth: ValueBoolean;
    newsPolitics: ValueBoolean;
    newsScience: ValueBoolean;
    newsTechnology: ValueBoolean;
    newsStrange: ValueBoolean;
}
