import KnowledgeDatabase from './KnowledgeDatabase';
export declare type CreateCallback = (err, created?: boolean) => void;
export declare type ExistsCallback = (err, exists?: boolean) => void;
export declare type KnowledgeDatabaseCallback = (err, database?: KnowledgeDatabase) => void;
/** Manager to keep track of created KnowledgeDatabase objects by name
 * to ensure they have a single instance. Only important for file
 * based KnowledgeDatabases, not really needed for the Web Client.
 *
 * Instantiated once as a singleton when imported by {@link jibo.kb.Model}.
 *
 * @class DatabaseManager
 * @memberof jibo.kb
 * @intdocs
 */
export declare class DatabaseManager {
    static databases: {
        [kbName: string]: KnowledgeDatabase;
    };
    static get(kbName: string, callback: KnowledgeDatabaseCallback): void;
    static exists(kbName: string, callback: ExistsCallback): void;
    readonly databases: {
        [kbName: string]: KnowledgeDatabase;
    };
    /** Create a KB slice if it doesn't exist.
     *
     * @method jibo.kb.DatabaseManager#create
     * @param {string} kbName KB slice name.
     * @param {Function} callback Called when done with (err,
     * created). `created` will be `true` if the KB slice needed to be
     * created, `false` if it already existsed.
     * @intdocs
     */
    create(kbName: string, callback: CreateCallback): void;
    /** Check if a KB slice was already created.
     *
     * @method jibo.kb.DatabaseManager#exists
     * @param {string} kbName KB slice name.
     * @param {Function} callback Called when done with (err, exists).
     * @intdocs
     */
    exists(kbName: string, callback: ExistsCallback): void;
    /** Fetch or instantiate a new
     * [KnowledgeDatabase]{@link jibo.kb.KnowledgeDatabase}
     * based on the name. The KB slice must already exist.
     *
     * @method jibo.kb.DatabaseManager#get
     * @param {string} kbName KB slice name.
     * @param {Function} callback Called when done with (err, database).
     * @intdocs
     */
    get(kbName: string, callback: KnowledgeDatabaseCallback): void;
    /** Delete a KnowledgeDatabase from the in-memory cache.
     *
     * @method jibo.kb.DatabaseManager#release
     * @param {string} kbName Name of kb slice to release.
     * @intdocs
     */
    release(kbName: string): void;
}
export default DatabaseManager;
