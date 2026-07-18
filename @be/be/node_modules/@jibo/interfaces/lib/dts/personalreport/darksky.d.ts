export interface DataBlock {
    summary: string;
    icon: Icon;
    data: DataPoint[];
}
export interface Alert {
    title: string;
    time: number;
    expires: number;
    description: string;
    uri: string;
    regions: string[];
    severity: Severity;
}
export interface DarkSkyData {
    latitude: number;
    longitude: number;
    timezone: string;
    currently?: DataPoint;
    minutely?: DataBlock;
    hourly?: DataBlock;
    daily?: DataBlock;
    alerts?: Alert[];
    flags?: {
        'darksky-unavailable': boolean;
        sources: string[];
        units: string;
    };
}
export interface DataPoint {
    apparentTemperature?: number;
    apparentTemperatureHigh?: number;
    apparentTemperatureHighTime?: number;
    apparentTemperatureLow?: number;
    apparentTemperatureLowTime?: number;
    cloudCover?: number;
    dewPoint?: number;
    humidity?: number;
    icon?: Icon;
    moonPhase?: number;
    nearestStormBearing?: number;
    nearestStormDistance?: number;
    ozone?: number;
    precipAccumulation?: number;
    precipIntensity?: number;
    precipIntensityMax?: number;
    precipIntensityMaxTime?: number;
    precipProbability?: number;
    precipType?: PrecipType;
    pressure?: number;
    summary?: string;
    sunriseTime?: number;
    sunsetTime?: number;
    temperature?: number;
    temperatureHigh?: number;
    temperatureHighTime?: number;
    temperatureLow?: number;
    temperatureLowTime?: number;
    time: number;
    uvIndex?: number;
    uvIndexTime?: number;
    visibility?: number;
    windBearing?: number;
    windGust?: number;
    windSpeed?: number;
}
export declare enum Severity {
    advisory = "advisory",
    watch = "watch",
    warning = "warning",
}
export declare enum PrecipType {
    rain = "rain",
    snow = "snow",
    sleet = "sleet",
}
export declare enum Icon {
    clearDay = "clear-day",
    clearNight = "clear-night",
    rain = "rain",
    snow = "snow",
    sleet = "sleet",
    wind = "wind",
    fog = "fog",
    cloudy = "cloudy",
    partlyCloudyDay = "partly-cloudy-day",
    partlyCloudyNight = "partly-cloudy-night",
}
