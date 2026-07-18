import HTTPClient from './HTTPClient';
export declare class SingletonEnforcer {
}
declare class SystemManagerClient extends HTTPClient {
    host: string;
    port: number;
    static NAME: string;
    private static _instance;
    static createInstance(host: string, port: number): SystemManagerClient;
    static readonly instance: SystemManagerClient;
    constructor(enforcer: SingletonEnforcer, host: string, port: number);
    get(path: string, callback: (error: Error, response?: any) => void): void;
    sendRequest(method: string, path: string, body: string, callback: (error: Error, response?: any) => void): void;
    getVersion(callback: (error: Error, response?: any) => void): void;
    list(callback: (error: Error, skills: Array<SkillRecord>) => void): void;
    getSkillRecordByName(name: string, callback: (error: Error, skill?: SkillRecord) => void): void;
    launch(name: string, callback: (error: Error) => void): void;
    terminate(name: string, callback: (error: Error) => void): void;
    getMode(callback: (error: Error, mode?: string) => void): void;
    syncTime(callback: (error: Error, response?: any) => void): void;
    getTimeZone(callback: (error, timezone?: string) => void): void;
    setTimeZone(zone: string, callback: (error, response?: any) => void): void;
    getCredentials(callback: any): void;
    sendWifiRequest(method: string, path: string, body: string, callback: WifiCallback): void;
    addNetwork(callback: WifiCallback): void;
    removeNetwork(networkId: string, callback: WifiCallback): void;
    saveConfig(callback: WifiCallback): void;
    disconnect(callback: WifiCallback): void;
    signalPoll(callback: WifiCallback): void;
    setNetwork(networkData: string, callback: WifiCallback): void;
    selectNetwork(networkId: string, callback: WifiCallback): void;
    enableNetwork(networkId: string, callback: WifiCallback): void;
    setInterface(interfaceData: InterfaceData, callback: WifiCallback): void;
    getInterface(callback: WifiCallback): void;
    listNetworks(callback: WifiCallback): void;
    wifiStatus(callback: WifiCallback): void;
    scan(callback: WifiCallback): void;
    scanResults(callback: WifiCallback): void;
    /**
     * Does background scanning for better networks/access points to connect to.
     * @param strengthThreshold db of current connection signal strength
     * @param weakRescanDelay seconds between scans if strength is weaker than strengthThreshold
     * @param strongRescanDelay seconds between if strength is stronger than strengthThreshold
     */
    bgScan(weakRescanDelay: number, strengthThreshold: number, strongRescanDelay: number, callback: WifiCallback): void;
    /**
     * Does active scanning automatically. Should replace most usage of scan().
     * @param scanDelay seconds between scans
     */
    activeAutoScan(rescanDelay: number, callback: WifiCallback): void;
    getSemanticStorage(callback: SemanticStorageCallback): void;
}
export interface SkillRecord {
    name: string;
    path: string;
    running?: boolean;
    lastStartTime?: {
        time_since_epoch: {
            count: number;
        };
    };
}
export interface InterfaceData {
    method: string;
    address: string;
    network: string;
    netmask: string;
    broadcast: string;
    gateway: string;
    dns: string;
}
export declare type WifiCallback = (err: Error, response?: any) => void;
export interface SemanticStorageData {
    usage: SemanticStorageUsageRecord[];
}
export interface SemanticStorageUsageRecord {
    type: string;
    path: string;
    size: number;
}
export declare type SemanticStorageCallback = (err: Error, storage?: SemanticStorageData) => void;
export default SystemManagerClient;
