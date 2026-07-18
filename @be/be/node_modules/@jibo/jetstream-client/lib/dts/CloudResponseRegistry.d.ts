import * as types from './Types';
export declare class CloudResponseRegistry {
    private registry;
    /**
     * Add a cloud response entry
     * @param transID
     */
    add(transID: string): Promise<any>;
    /**
     * Resolve a skill response when it arrives
     * @param transID
     * @param skillResponse
     */
    resolve(transID: string, skillResponse: types.SkillActionData): void;
    /**
     * Cull all old entries and reject outstanding promises
     * @param maxAgeMs
     */
    cull(maxAgeMs: number): void;
    private createEntry(id);
}
