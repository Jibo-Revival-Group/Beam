export declare type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'none';
export interface LogLevels {
    [namespace: string]: LogLevel;
}
export interface OutputPerNamespace {
    [namespace: string]: LevelPerOutput;
}
export interface LevelPerOutput {
    [output: string]: LogLevel;
}
