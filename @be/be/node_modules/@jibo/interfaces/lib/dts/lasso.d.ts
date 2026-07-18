/**
 * Lasso relay adds these properties to the response
 */
export interface LassoRelayParams {
    /** If data is taken from Redis or not */
    'lassoDataFromRedis': boolean;
    /** Date string, when data was inserted into Redis */
    'lassoInsertedIntoRedisAt'?: string;
}
export interface CalendarRequest {
    /** ID of the skill which makes a request, necessary to find credentials in Lasso */
    skillId: string;
    /** User account ID */
    accountId: string;
    /** workCalendar, personalCalendar or any other */
    calendar: string;
    /** End date for events, like 2017-12-18T23:59:59-07:00 or 2017-12-18T23:59:59-05:00 */
    endDate?: string;
}
export interface CalendarResponse {
    events: CalendarEvent[];
}
/** Is used in Lasso to format event.start.dateTime and event.end.dateTime */
export declare const EVENT_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";
/** Google Calendar scopes */
export declare enum GoogleCalendarScopes {
    read = "https://www.googleapis.com/auth/calendar.readonly",
}
/** Outlook Calendar scopes */
export declare enum OutlookCalendarScopes {
    read = "Calendars.Read",
    offline_access = "offline_access",
}
export interface CalendarEvent {
    /** Event description */
    summary: string;
    /** Is it full day event or not */
    fullDay: boolean;
    /** Start date */
    start: CalendarEventDate;
    /** End date, optional */
    end?: CalendarEventDate;
}
export declare type CalendarEventDate = {
    /** Date timestamp */
    timestamp: number;
    /** Date in EVENT_DATETIME_FORMAT */
    dateTime: string;
};
