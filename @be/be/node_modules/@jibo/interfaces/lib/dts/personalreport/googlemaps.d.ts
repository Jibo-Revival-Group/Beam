export interface Maps {
    status: Status;
    error_message?: string;
    geocoded_waypoints: GeocodedWaypoint[];
    routes: Route[];
    available_travel_modes?: string[];
}
export interface GeocodedWaypoint {
    geocoder_status: 'OK' | 'ZERO_RESULTS';
    partial_match?: boolean;
    place_id: string;
    types: LocationTypes;
}
export interface Route {
    summary: string;
    legs: Leg[];
    waypoint_order?: GeocodedWaypoint[];
    overview_polyline?: {
        points: string;
    };
    bounds?: {
        northeast: LatLong;
        southwest: LatLong;
    };
    copyrights?: string;
    warnings?: string[];
    fare?: {
        currency: string;
        value: number;
        text: string;
    };
}
export interface Leg {
    steps?: Step[];
    distance?: DistanceDuration;
    duration?: DistanceDuration;
    duration_in_traffic?: DistanceDuration;
    arrival_time?: Time;
    departure_time?: Time;
    start_location?: LatLong;
    end_location?: LatLong;
    start_address?: string;
    end_address?: string;
}
export interface Step {
    html_instructions?: string;
    distance?: DistanceDuration;
    duration?: DistanceDuration;
    start_location?: LatLong;
    end_location?: LatLong;
    polyline?: {
        points: string;
    };
    steps?: Step;
    travel_mode: string;
    transit_details?: TransitDetails;
}
export interface TransitDetails {
    arrival_stop?: {
        name: string;
        location: LatLong;
    };
    departure_stop?: {
        name: string;
        location: LatLong;
    };
    arrival_time?: {
        text?: string;
        value?: number;
        time_zone?: string;
    };
    departure_time?: {
        text?: string;
        value?: number;
        time_zone?: string;
    };
    headsign?: string;
    headway?: number;
    num_stops?: number;
    line?: {
        name?: string;
        short_name?: string;
        color?: string;
        agencies?: TransitAgency[];
        url?: string;
        icon?: string;
        text_color?: string;
        vehicle?: {
            name?: string;
            type?: VehicleType;
            icon?: string;
            local_icon?: string;
        };
    };
}
export interface Time {
    value?: Date;
    text?: string;
    time_zone?: string;
}
export interface DistanceDuration {
    value: number;
    text: string;
}
export interface LatLong {
    lat: number;
    lng: number;
}
export interface TransitAgency {
    name: string;
    phone: string;
    url: string;
}
export declare enum Status {
    OK = "OK",
    NOT_FOUND = "NOT_FOUND",
    ZERO_RESULTS = "ZERO_RESULTS",
    MAX_WAYPOINTS_EXCEEDED = "MAX_WAYPOINTS_EXCEEDED",
    MAX_ROUTE_LENGTH_EXCEEDED = "MAX_ROUTE_LENGTH_EXCEEDED",
    INVALID_REQUEST = "INVALID_REQUEST",
    OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
    REQUEST_DENIED = "REQUEST_DENIED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}
export declare enum LocationTypes {
    street_address = "street_address",
    route = "route",
    intersection = "intersection",
    political = "political",
    country = "country",
    administrative_area_level_1 = "administrative_area_level_1",
    administrative_area_level_2 = "administrative_area_level_2",
    administrative_area_level_3 = "administrative_area_level_3",
    administrative_area_level_4 = "administrative_area_level_4",
    administrative_area_level_5 = "administrative_area_level_5",
    colloquial_area = "colloquial_area",
    locality = "locality",
    ward = "ward",
    sublocality = "sublocality",
    neighborhood = "neighborhood",
    premise = "premise",
    subpremise = "subpremise",
    postal_code = "postal_code",
    natural_feature = "natural_feature",
    airport = "airport",
    park = "park",
    point_of_interest = "point_of_interest",
}
export declare enum VehicleType {
    RAIL = "RAIL",
    METRO_RAIL = "METRO_RAIL",
    SUBWAY = "SUBWAY",
    TRAM = "TRAM",
    MONORAIL = "MONORAIL",
    HEAVY_RAIL = "HEAVY_RAIL",
    COMMUTER_TRAIN = "COMMUTER_TRAIN",
    HIGH_SPEED_TRAIN = "HIGH_SPEED_TRAIN",
    BUS = "BUS",
    INTERCITY_BUS = "INTERCITY_BUS",
    TROLLEYBUS = "TROLLEYBUS",
    SHARE_TAXI = "SHARE_TAXI",
    FERRY = "FERRY",
    CABLE_CAR = "CABLE_CAR",
    GONDOLA_LIFT = "GONDOLA_LIFT",
    FUNICULAR = "FUNICULAR",
    OTHER = "OTHER",
}
export declare enum CommuteMode {
    driving = "driving",
    transit = "transit",
    bicycling = "bicycling",
    walking = "walking",
}
