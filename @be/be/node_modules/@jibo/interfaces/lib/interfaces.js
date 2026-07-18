(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.interfaces = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ASR transcription annotations to label the result at a high level */
var ASRAnnotation;
(function (ASRAnnotation) {
    /** Label used when the ASR transcription shouldn't be acted upon (e.g. non-user speech) */
    ASRAnnotation["GARBAGE"] = "GARBAGE";
    /** Label used when the ASR transcription was stopped early by Fast EOS */
    ASRAnnotation["FAST_EOS"] = "FAST_EOS";
    /** Label used when ASR never detected SOS */
    ASRAnnotation["SOS_TIMEOUT"] = "SOS_TIMEOUT";
    /** Label used when ASR continuously receives speech until the max allowed time */
    ASRAnnotation["MAX_SPEECH_TIMEOUT"] = "MAX_SPEECH_TIMEOUT";
})(ASRAnnotation = exports.ASRAnnotation || (exports.ASRAnnotation = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpeechEventType;
(function (SpeechEventType) {
    SpeechEventType.END_OF_SINGLE_UTTERANCE = 'END_OF_SINGLE_UTTERANCE';
    SpeechEventType.SPEECH_EVENT_UNSPECIFIED = 'SPEECH_EVENT_UNSPECIFIED';
})(SpeechEventType = exports.SpeechEventType || (exports.SpeechEventType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asr = require("./asr");
exports.asr = asr;
const nlu = require("./nlu");
exports.nlu = nlu;

},{"./asr":3,"./nlu":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const skilllaunch = require("./skilllaunch");
exports.skilllaunch = skilllaunch;
const speech = require("./speech");
exports.speech = speech;

},{"./skilllaunch":8,"./speech":10}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventType;
(function (EventType) {
    EventType["SKILL_LAUNCH"] = "SKILL_LAUNCH";
})(EventType = exports.EventType || (exports.EventType = {}));

},{}],8:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./events"));
__export(require("./query"));

},{"./events":7,"./query":9}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RuleField;
(function (RuleField) {
    RuleField["SKILL_ID"] = "skillID";
    RuleField["INTENT"] = "intent";
    RuleField["PERSON_IDS"] = "personIDs";
    RuleField["PAYLOAD"] = "payload";
})(RuleField = exports.RuleField || (exports.RuleField = {}));
exports.ValidRuleFields = ['skillID', 'intent', 'personIDs', 'payload'];
var MatchMethod;
(function (MatchMethod) {
    /** For string fields */
    MatchMethod["EXACT"] = "EXACT";
    /** For string fields */
    MatchMethod["NOT"] = "NOT";
    /** For string fields */
    MatchMethod["ONE_OF"] = "ONE_OF";
    /**
     * For array fields. </br>
     * Contains string
     */
    MatchMethod["CONTAINS"] = "CONTAINS";
    /**
     * For array fields. </br>
     * Does not contain any of strings
     */
    MatchMethod["NOT_CONTAIN"] = "NOT_CONTAIN";
    MatchMethod["CONTAINS_ANY"] = "CONTAINS_ANY";
    MatchMethod["CONTAINS_ALL"] = "CONTAINS_ALL";
})(MatchMethod = exports.MatchMethod || (exports.MatchMethod = {}));

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enumerates the types of error codes that the Hub can
 * emit on response messages of type ERROR.
 */
var HubErrorCode;
(function (HubErrorCode) {
    /** Skill URL not found */
    HubErrorCode["SKILL_NOT_FOUND"] = "SKILL_NOT_FOUND";
    /** Timeout while waiting for skill response */
    HubErrorCode["TIMEOUT_SKILL"] = "TIMEOUT_SKILL";
    /** Timeout while waiting for parser response */
    HubErrorCode["TIMEOUT_PARSER"] = "TIMEOUT_PARSER";
    /** Timeout while waiting for ASR response */
    HubErrorCode["TIMEOUT_ASR"] = "TIMEOUT_ASR";
    /** Timeout while waiting for the context message from jetstream */
    HubErrorCode["TIMEOUT_CONTEXT"] = "TIMEOUT_CONTEXT";
    /** Timeout of complete transaction */
    HubErrorCode["TIMEOUT_TRANSACTION"] = "TIMEOUT_TRANSACTION";
    /** Error from ASR service */
    HubErrorCode["ASR"] = "ASR";
    /** Error from Parser service */
    HubErrorCode["PARSER"] = "PARSER";
    /** General error */
    HubErrorCode["GENERAL"] = "GENERAL";
})(HubErrorCode = exports.HubErrorCode || (exports.HubErrorCode = {}));

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestType;
(function (RequestType) {
    RequestType["LISTEN"] = "LISTEN";
    RequestType["CONTEXT"] = "CONTEXT";
    RequestType["TRIGGER"] = "TRIGGER";
    RequestType["CMD_RESULT"] = "CMD_RESULT";
    RequestType["CLIENT_ASR"] = "CLIENT_ASR";
    RequestType["CLIENT_NLU"] = "CLIENT_NLU";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
var ResponseType;
(function (ResponseType) {
    ResponseType["EOS"] = "EOS";
    ResponseType["SOS"] = "SOS";
    ResponseType["LISTEN"] = "LISTEN";
    ResponseType["SKILL_REDIRECT"] = "SKILL_REDIRECT";
    ResponseType["SKILL_ACTION"] = "SKILL_ACTION";
    ResponseType["NLU"] = "NLU";
    ResponseType["ASR"] = "ASR";
    ResponseType["COMMAND"] = "COMMAND";
    ResponseType["PROACTIVE"] = "PROACTIVE";
    ResponseType["ERROR"] = "ERROR";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("./request");
exports.request = request;
const response = require("./response");
exports.response = response;

},{"./request":14,"./response":15}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageType_1 = require("./MessageType");
exports.MessageType = MessageType_1.RequestType;
var ListenMessageMode;
(function (ListenMessageMode) {
    ListenMessageMode["CLIENT_ASR"] = "CLIENT_ASR";
    ListenMessageMode["CLIENT_NLU"] = "CLIENT_NLU";
})(ListenMessageMode = exports.ListenMessageMode || (exports.ListenMessageMode = {}));

},{"./MessageType":12}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageType_1 = require("./MessageType");
const HubErrorCode_1 = require("./HubErrorCode");
exports.HubErrorCode = HubErrorCode_1.HubErrorCode;
exports.MessageType = MessageType_1.ResponseType;
/**
 * A general state that the result of a listening turn represents.
 */
var ListenResultState;
(function (ListenResultState) {
    /**
     * No input was received - user did not say anything before we stopped listening.
     */
    ListenResultState["noInput"] = "noInput";
    /**
     * User said something, but it didn't match anything that we were listening for.
     */
    ListenResultState["noMatch"] = "noMatch";
    /**
     * User said something that matched what we were listening for. `nlu` can be expected to
     * exist and have valid data.
     */
    ListenResultState["match"] = "match";
})(ListenResultState = exports.ListenResultState || (exports.ListenResultState = {}));
/**
 * Class for wrapping ListenResponseData for less access depth and safer usage within skill code.
 */
class ListenResult {
    /**
     * Safe shorthand for the main ASR result.
     */
    get text() {
        return this.asr ? this.asr.text : '';
    }
    /**
     * Safe shorthand for the main NLU result, if any.
     */
    get intent() {
        return this.nlu ? this.nlu.intent : '';
    }
    /**
     * Safe shorthand for supplimentary NLU results, if any.
     */
    get entities() {
        return this.nlu && this.nlu.entities ? this.nlu.entities : {};
    }
    /**
     * Shorthand for what type of result this response represents.
     */
    get state() {
        //if we have an NLU result that has content, then it is a match
        if (this.nlu && (this.nlu.intent || Object.keys(this.entities).length)) {
            return ListenResultState.match;
        }
        //if we lack an ASR result, then there was no input (aka timeout)
        if (!this.asr || !this.asr.text) {
            return ListenResultState.noInput;
        }
        //otherwise, we have an ASR result but no valid NLU result, so it is not a match at all
        return ListenResultState.noMatch;
    }
    constructor(asr, nlu, match) {
        this.asr = asr;
        this.nlu = nlu;
        this.match = match;
    }
    toJSON() {
        return {
            asr: this.asr,
            nlu: this.nlu,
            match: this.match
        };
    }
}
exports.ListenResult = ListenResult;

},{"./HubErrorCode":11,"./MessageType":12}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = require("./data");
exports.data = data;
const runtime = require("./runtime");
exports.runtime = runtime;
const dialog = require("./dialog");
exports.dialog = dialog;

},{"./data":17,"./dialog":18,"./runtime":20}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SensoryType;
(function (SensoryType) {
    /** Motion input */
    SensoryType.PERSON = 'PERSON';
    /** Voice input */
    SensoryType.VOICE = 'VOICE';
    /** Unknown input */
    SensoryType.UNKNOWN = 'UNKNOWN';
})(SensoryType = exports.SensoryType || (exports.SensoryType = {}));
var IDLabels;
(function (IDLabels) {
    /** Speaker is definitely not enrolled. */
    IDLabels.NOT_ENROLLED = 'NOT_ENROLLED';
    /** Speaker could or could not be enrolled. */
    IDLabels.ANYBODY = 'ANYBODY';
    /** Speaker is in the loop and identified. */
    IDLabels.IDENTIFIED = 'IDENTIFIED';
    /** The entity identification is not known. */
    IDLabels.UNKNOWN = 'UNKNOWN';
    /** The entity is definitely not trained. */
    IDLabels.NOT_TRAINED = 'NOT_TRAINED';
})(IDLabels = exports.IDLabels || (exports.IDLabels = {}));
var JiboColor;
(function (JiboColor) {
    JiboColor.BLACK = 'BLACK';
    JiboColor.WHITE = 'WHITE';
})(JiboColor = exports.JiboColor || (exports.JiboColor = {}));

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Is used in Lasso to format event.start.dateTime and event.end.dateTime */
exports.EVENT_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
/** Google Calendar scopes */
var GoogleCalendarScopes;
(function (GoogleCalendarScopes) {
    GoogleCalendarScopes["read"] = "https://www.googleapis.com/auth/calendar.readonly";
})(GoogleCalendarScopes = exports.GoogleCalendarScopes || (exports.GoogleCalendarScopes = {}));
/** Outlook Calendar scopes */
var OutlookCalendarScopes;
(function (OutlookCalendarScopes) {
    OutlookCalendarScopes["read"] = "Calendars.Read";
    OutlookCalendarScopes["offline_access"] = "offline_access";
})(OutlookCalendarScopes = exports.OutlookCalendarScopes || (exports.OutlookCalendarScopes = {}));

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Namespace for mapping error codes */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode.INVALID_URL = 'INVALID_URL';
    ErrorCode.UNAUTHORIZED = 'UNAUTHORIZED';
    ErrorCode.UNEXPECTED = 'UNEXPECTED';
    ErrorCode.ECONNREFUSED = 'ECONNREFUSED';
    ErrorCode.WRITE_ERROR = 'WRITE_ERROR';
    ErrorCode.READ_ERROR = 'READ_ERROR';
    ErrorCode.ERROR = 'ERROR';
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CategoryName;
(function (CategoryName) {
    CategoryName["general"] = "general";
    CategoryName["technology"] = "technology";
    CategoryName["sports"] = "sports";
    CategoryName["business"] = "business";
    CategoryName["science"] = "science";
    CategoryName["entertainment"] = "entertainment";
    CategoryName["strange"] = "strange";
    CategoryName["health"] = "health";
    CategoryName["international"] = "international";
    CategoryName["national"] = "national";
    CategoryName["politics"] = "politics";
})(CategoryName = exports.CategoryName || (exports.CategoryName = {}));
exports.CATEGORIES = {
    42200: CategoryName.business,
    42201: CategoryName.entertainment,
    42202: CategoryName.international,
    42203: CategoryName.health,
    42204: CategoryName.strange,
    42205: CategoryName.politics,
    42206: CategoryName.science,
    42207: CategoryName.sports,
    42208: CategoryName.technology,
    42209: CategoryName.general,
    42210: CategoryName.national,
};

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Severity;
(function (Severity) {
    Severity["advisory"] = "advisory";
    Severity["watch"] = "watch";
    Severity["warning"] = "warning";
})(Severity = exports.Severity || (exports.Severity = {}));
var PrecipType;
(function (PrecipType) {
    PrecipType["rain"] = "rain";
    PrecipType["snow"] = "snow";
    PrecipType["sleet"] = "sleet";
})(PrecipType = exports.PrecipType || (exports.PrecipType = {}));
var Icon;
(function (Icon) {
    Icon["clearDay"] = "clear-day";
    Icon["clearNight"] = "clear-night";
    Icon["rain"] = "rain";
    Icon["snow"] = "snow";
    Icon["sleet"] = "sleet";
    Icon["wind"] = "wind";
    Icon["fog"] = "fog";
    Icon["cloudy"] = "cloudy";
    Icon["partlyCloudyDay"] = "partly-cloudy-day";
    Icon["partlyCloudyNight"] = "partly-cloudy-night";
})(Icon = exports.Icon || (exports.Icon = {}));

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status["OK"] = "OK";
    Status["NOT_FOUND"] = "NOT_FOUND";
    Status["ZERO_RESULTS"] = "ZERO_RESULTS";
    Status["MAX_WAYPOINTS_EXCEEDED"] = "MAX_WAYPOINTS_EXCEEDED";
    Status["MAX_ROUTE_LENGTH_EXCEEDED"] = "MAX_ROUTE_LENGTH_EXCEEDED";
    Status["INVALID_REQUEST"] = "INVALID_REQUEST";
    Status["OVER_QUERY_LIMIT"] = "OVER_QUERY_LIMIT";
    Status["REQUEST_DENIED"] = "REQUEST_DENIED";
    Status["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(Status = exports.Status || (exports.Status = {}));
var LocationTypes;
(function (LocationTypes) {
    LocationTypes["street_address"] = "street_address";
    LocationTypes["route"] = "route";
    LocationTypes["intersection"] = "intersection";
    LocationTypes["political"] = "political";
    LocationTypes["country"] = "country";
    LocationTypes["administrative_area_level_1"] = "administrative_area_level_1";
    LocationTypes["administrative_area_level_2"] = "administrative_area_level_2";
    LocationTypes["administrative_area_level_3"] = "administrative_area_level_3";
    LocationTypes["administrative_area_level_4"] = "administrative_area_level_4";
    LocationTypes["administrative_area_level_5"] = "administrative_area_level_5";
    LocationTypes["colloquial_area"] = "colloquial_area";
    LocationTypes["locality"] = "locality";
    LocationTypes["ward"] = "ward";
    LocationTypes["sublocality"] = "sublocality";
    LocationTypes["neighborhood"] = "neighborhood";
    LocationTypes["premise"] = "premise";
    LocationTypes["subpremise"] = "subpremise";
    LocationTypes["postal_code"] = "postal_code";
    LocationTypes["natural_feature"] = "natural_feature";
    LocationTypes["airport"] = "airport";
    LocationTypes["park"] = "park";
    LocationTypes["point_of_interest"] = "point_of_interest";
})(LocationTypes = exports.LocationTypes || (exports.LocationTypes = {}));
var VehicleType;
(function (VehicleType) {
    VehicleType["RAIL"] = "RAIL";
    VehicleType["METRO_RAIL"] = "METRO_RAIL";
    VehicleType["SUBWAY"] = "SUBWAY";
    VehicleType["TRAM"] = "TRAM";
    VehicleType["MONORAIL"] = "MONORAIL";
    VehicleType["HEAVY_RAIL"] = "HEAVY_RAIL";
    VehicleType["COMMUTER_TRAIN"] = "COMMUTER_TRAIN";
    VehicleType["HIGH_SPEED_TRAIN"] = "HIGH_SPEED_TRAIN";
    VehicleType["BUS"] = "BUS";
    VehicleType["INTERCITY_BUS"] = "INTERCITY_BUS";
    VehicleType["TROLLEYBUS"] = "TROLLEYBUS";
    VehicleType["SHARE_TAXI"] = "SHARE_TAXI";
    VehicleType["FERRY"] = "FERRY";
    VehicleType["CABLE_CAR"] = "CABLE_CAR";
    VehicleType["GONDOLA_LIFT"] = "GONDOLA_LIFT";
    VehicleType["FUNICULAR"] = "FUNICULAR";
    VehicleType["OTHER"] = "OTHER";
})(VehicleType = exports.VehicleType || (exports.VehicleType = {}));
var CommuteMode;
(function (CommuteMode) {
    CommuteMode["driving"] = "driving";
    CommuteMode["transit"] = "transit";
    CommuteMode["bicycling"] = "bicycling";
    CommuteMode["walking"] = "walking";
})(CommuteMode = exports.CommuteMode || (exports.CommuteMode = {}));

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const darksky = require("./darksky");
exports.darksky = darksky;
const googlecalendar = require("./googlecalendar");
exports.googlecalendar = googlecalendar;
const googlemaps = require("./googlemaps");
exports.googlemaps = googlemaps;
const apnews = require("./apnews");
exports.apnews = apnews;
const settings = require("./settings");
exports.settings = settings;

},{"./apnews":25,"./darksky":26,"./googlecalendar":27,"./googlemaps":28,"./settings":30}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContextField;
(function (ContextField) {
    ContextField["FOCUSED_PERSON"] = "FOCUSED_PERSON";
    ContextField["NUM_PEOPLE_PRESENT"] = "NUM_PEOPLE_PRESENT";
    ContextField["NUM_IDENTIFIED_PEOPLE_PRESENT"] = "NUM_IDENTIFIED_PEOPLE_PRESENT";
    ContextField["PERSON_IDS"] = "PERSON_IDS";
    ContextField["PART_OF_DAY"] = "PART_OF_DAY";
    ContextField["DAY_OF_WEEK"] = "DAY_OF_WEEK";
    ContextField["TRIGGER_SOURCE"] = "TRIGGER_SOURCE";
})(ContextField = exports.ContextField || (exports.ContextField = {}));
var ContextMatchRule;
(function (ContextMatchRule) {
    ContextMatchRule["EXACT"] = "EXACT";
    ContextMatchRule["NOT"] = "NOT";
    ContextMatchRule["CONTAINS_ALL"] = "CONTAINS_ALL";
    ContextMatchRule["CONTAINS_ANY"] = "CONTAINS_ANY";
    ContextMatchRule["NOT_CONTAIN"] = "NOT_CONTAIN";
    ContextMatchRule["GREATER_THAN"] = "GREATER_THAN";
    ContextMatchRule["LESS_THAN"] = "LESS_THAN";
    ContextMatchRule["CONTAINED_IN"] = "CONTAINED_IN";
})(ContextMatchRule = exports.ContextMatchRule || (exports.ContextMatchRule = {}));

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Type of query to make to History Service
 * LastEvent returns full event data, Count returns just an integer
 */
var IHQueryType;
(function (IHQueryType) {
    IHQueryType["LastEvent"] = "LastEvent";
    IHQueryType["Count"] = "Count";
})(IHQueryType = exports.IHQueryType || (exports.IHQueryType = {}));
/**
 * Special values which can be be used
 * in startTimeOffset and endTimeOffset of the query
 */
var IHTimeOffset;
(function (IHTimeOffset) {
    IHTimeOffset["SinceWaking"] = "SinceWaking";
})(IHTimeOffset = exports.IHTimeOffset || (exports.IHTimeOffset = {}));
/**
 * Transformation method which can be used
 * to extract some value from history service response
 */
var IHTransformMethod;
(function (IHTransformMethod) {
    IHTransformMethod["TimeSince"] = "TimeSince";
})(IHTransformMethod = exports.IHTransformMethod || (exports.IHTransformMethod = {}));
/**
 * Match method which can be used in IHRule
 */
var IHMatchMethod;
(function (IHMatchMethod) {
    IHMatchMethod["EXACT"] = "EXACT";
    IHMatchMethod["NOT"] = "NOT";
    IHMatchMethod["GREATER_THAN"] = "GREATER_THAN";
    IHMatchMethod["LESS_THAN"] = "LESS_THAN";
})(IHMatchMethod = exports.IHMatchMethod || (exports.IHMatchMethod = {}));

},{}],33:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./context"));
__export(require("./history"));
__export(require("./settings"));
__export(require("./proactive"));

},{"./context":31,"./history":32,"./proactive":34,"./settings":35}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TriggerSource;
(function (TriggerSource) {
    TriggerSource["NEW_ARRIVAL"] = "NEW_ARRIVAL";
    TriggerSource["SURPRISE"] = "SURPRISE";
})(TriggerSource = exports.TriggerSource || (exports.TriggerSource = {}));

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingsMatchRule;
(function (SettingsMatchRule) {
    SettingsMatchRule["EXACT"] = "EXACT";
    SettingsMatchRule["NOT"] = "NOT";
    // we'll support just these two to begin. Others, such as CONTAINED_IN, may be added later
})(SettingsMatchRule = exports.SettingsMatchRule || (exports.SettingsMatchRule = {}));

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Jibo specific header values that are used to communicate
 * to services data that is needed (or adds value) to our logging
 */
exports.Headers = {
    transID: "x-jibo-transid",
    robotID: "x-jibo-robotid",
    loggingConfig: "x-jibo-logging-config"
};

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// // TODO: Everything below should be moved to Lasso
// /**
//  * CalendarConnected value from settings service.
//  * @interface ValueCalendarConnected
//  * @property {CalendarConnected} value
//  */
// export interface ValueCalendarConnected {
//     value: CalendarConnected;
// }
// /**
//  * PersonalCalendarOAuth value from settings service.
//  * @interface ValuePersonalCalendarOAuth
//  * @property {PersonalCalendarOAuth} value
//  */
// export interface ValuePersonalCalendarOAuth {
//     value: PersonalCalendarOAuth;
// }
// /**
//  * WorkCalendarOAuth value from settings service.
//  * @interface ValueWorkCalendarOAuth
//  * @property {WorkCalendarOAuth} value
//  */
// export interface ValueWorkCalendarOAuth {
//     value: WorkCalendarOAuth;
// }
// /**
//  * CalendarConnected values.
//  * @interface CalendarConnected
//  * @property {boolean} value
//  * @property {string} email
//  */
// export interface CalendarConnected {
//     value: boolean;
//     email: string;
// }
// /**
//  * PersonalCalendarOAuth values.
//  * @interface PersonalCalendarOAuth
//  * @property {string} icon
//  * @property {string} title
//  * @property {string} callbackURL
//  * @property {string} serviceName
//  * @property {string} authorizationUri
//  * @property {string} serverClientId
//  * @property {string} iosClientId
//  * @property {string} androidClientId
//  * @property {string[]} scopes
//  * @property {boolean} state
//  */
// export interface PersonalCalendarOAuth {
//     icon: string;
//     title: string;
//     callbackURL: string;
//     serviceName: string;
//     authorizationUri: string;
//     serverClientId: string;
//     iosClientId: string;
//     androidClientId: string;
//     scopes: string[];
//     state: boolean;
// }
// /**
//  * WorkCalendarOAuth values.
//  * @interface WorkCalendarOAuth
//  * @property {string} icon
//  * @property {string} title
//  * @property {string} oauthURL
//  * @property {string} callbackURL
//  */
// export interface WorkCalendarOAuth {
//     icon: string;
//     title: string;
//     oauthURL: string;
//     callbackURL: string;
// } 

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_VERSION = "1.0.0";
/**
 * Valid Action types supported in Cloud Skills.
 */
var ActionType;
(function (ActionType) {
    /** JCP action type */
    ActionType["JCP"] = "JCP";
})(ActionType = exports.ActionType || (exports.ActionType = {}));

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Analytics events mapping for internal, automatically created events.
 * @hidden
 */
exports.EVENTS = {
    SKILL_ENTRY: 'Skill Entry',
    SKILL_OFFER: 'Skill Offer'
};

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Supplemental behavior types.
 */
var SupplementalBehaviorType;
(function (SupplementalBehaviorType) {
    /** Supplemental behavior that is consumed in parallel with the main action */
    SupplementalBehaviorType["Parallel"] = "Parallel";
    /** Supplemental behavior that is consumed in sequence with the main action */
    SupplementalBehaviorType["Sequence"] = "Sequence";
})(SupplementalBehaviorType = exports.SupplementalBehaviorType || (exports.SupplementalBehaviorType = {}));

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingValueTarget;
(function (SettingValueTarget) {
    SettingValueTarget[SettingValueTarget["loop"] = 0] = "loop";
    SettingValueTarget[SettingValueTarget["person"] = 1] = "person";
    SettingValueTarget[SettingValueTarget["lasso"] = 2] = "lasso";
})(SettingValueTarget = exports.SettingValueTarget || (exports.SettingValueTarget = {}));

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("./request");
exports.request = request;
const response = require("./response");
exports.response = response;
const action = require("./action");
exports.action = action;
const config = require("./config");
exports.config = config;
const analytics = require("./analytics");
exports.analytics = analytics;
const behaviors = require("./behaviors");
exports.behaviors = behaviors;

},{"./action":38,"./analytics":39,"./behaviors":40,"./config":41,"./request":43,"./response":44}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType["LISTEN_LAUNCH"] = "LISTEN_LAUNCH";
    MessageType["LISTEN_UPDATE"] = "LISTEN_UPDATE";
    MessageType["PROACTIVE_LAUNCH"] = "PROACTIVE_LAUNCH";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
// Hub->skill communication errors
var SkillRequestError;
(function (SkillRequestError) {
    SkillRequestError["SKILL_NOT_FOUND"] = "SKILL_NOT_FOUND";
    SkillRequestError["TIMEOUT"] = "TIMEOUT";
})(SkillRequestError = exports.SkillRequestError || (exports.SkillRequestError = {}));

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResponseType;
(function (ResponseType) {
    ResponseType["SKILL_ACTION"] = "SKILL_ACTION";
    ResponseType["SKILL_REDIRECT"] = "SKILL_REDIRECT";
    ResponseType["ERROR"] = "ERROR";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeUnit;
(function (TimeUnit) {
    TimeUnit["msec"] = "msec";
    TimeUnit["sec"] = "sec";
    TimeUnit["min"] = "min";
    TimeUnit["minute"] = "minute";
    TimeUnit["minutes"] = "minutes";
    TimeUnit["hour"] = "hour";
    TimeUnit["hours"] = "hours";
    TimeUnit["day"] = "day";
    TimeUnit["days"] = "days";
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service = require("./service");
exports.service = service;
const personalreport = require("./personalreport");
exports.personalreport = personalreport;
const settings = require("./settings");
exports.settings = settings;
const google = require("./google");
exports.google = google;
const hub = require("./hub");
exports.hub = hub;
const jibo = require("./jibo");
exports.jibo = jibo;
const jibo_log = require("./jibo-log");
exports.jibo_log = jibo_log;
const skill = require("./skill");
exports.skill = skill;
const nlu = require("./nlu");
exports.nlu = nlu;
const asr = require("./asr");
exports.asr = asr;
const network = require("./network");
exports.network = network;
const proactive = require("./proactive");
exports.proactive = proactive;
const language = require("./language");
exports.language = language;
const common = require("./common");
exports.common = common;
const history = require("./history");
exports.history = history;
const time = require("./time");
exports.time = time;
const lasso = require("./lasso");
exports.lasso = lasso;

},{"./asr":1,"./common":2,"./google":4,"./history":6,"./hub":13,"./jibo":19,"./jibo-log":16,"./language":21,"./lasso":22,"./network":23,"./nlu":24,"./personalreport":29,"./proactive":33,"./service":36,"./settings":37,"./skill":42,"./time":45}]},{},[46])(46)
});

//# sourceMappingURL=interfaces.js.map
