import Database from './Database';
import Node from './Node';
export declare type ErrCallback = (err) => void;
export declare type NodeCallback = (err, node?: Node) => void;
export declare type NodesCallback = (err, nodes?: Node[]) => void;
export declare type CountCallback = (err, count?: number) => void;
export declare type NodeConstructor = new (...args: any[]) => Node;
/** KnowledgeDatabase Class. Represents a single KB instance or
 * "slice" (e.g. `/jibo.loop` or `/snap`) with all it's nodes and
 * assets. Uses a Database class instance (i.e. Node Embedded Database [NeDB]) to load/store
 * the nodes.
 *
 * Not usually used directly. Instead A Model assembles one or more
 * KnowledgeDatabase objects into a model and interaction with the
 * databases is done through the Model.
 *
 * This version of the class is intended for the server side of the KB
 * service which maniplates the on disk files using the Database class
 * (which uses itself NeDB).  WebClient is a subclass of this class
 * and is what is used client side.
 *
 * @class KnowledgeDatabase
 * @memberof jibo.kb
 * @param {string} kbName Name of this KB slice.
 * @intdocs
 */
declare class KnowledgeDatabase {
    kbName: string;
    dbDirectory: string;
    dbFilename: string;
    database: Database;
    /** Return the root directory for all KnowledgeDatabases.
     *
     * @method jibo.kb.KnowledgeDatabase.getRootDirectory
     * @static
     * @returns {string} Full path to the root directory of all
     * KnowledgeDatabases.
     * @intdocs
     */
    static getRootDirectory(): string;
    /** Calculate the full path to the directory of a KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase.getKbDirectory
     * @static
     * @param {string} kbName Name of KB slice.
     * @returns {string} Full path to the KB slice directory.
     * @intdocs
     */
    static getKbDirectory(kbName: string): string;
    /** Calculate the full path to the NeDB file of a KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase.getKbFilename
     * @static
     * @param {string} kbName Name of KB slice.
     * @returns {string} Full path to the NeDB `nodes` file.
     * @intdocs
     */
    static getKbFilename(kbName: string): string;
    constructor(kbName: string);
    /** Initalize this KnowledgeDatabase slice - Attach to or create
     * the underlying file on disk (via the Database class).
     *
     * @method jibo.kb.KnowledgeDatabase#init
     * @param {Function} callback Called with (err) when done.
     */
    init(callback: ErrCallback): void;
    /** Load a node of a given ID.
     *
     * @method jibo.kb.KnowledgeDatabase#load
     * @param {string} id ID of node to load via the KB service.
     * @param {Function} callback Called with (err, node).
     * @intdocs
     */
    load(id: string, callback: NodeCallback): void;
    /** Load a nodes of the given array of IDs.
     *
     * @method jibo.kb.KnowledgeDatabase#loadList
     * @param {string[]} ids IDs of nodes to load via the KB service.
     * @param {Function} callback Called with (err, nodes).
     * @intdocs
     */
    loadList(ids: string[], callback: NodesCallback): void;
    /** Load the root node of this KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase#loadRoot
     * @param {Function} callback Called with (err, rootNode).
     * @intdocs
     */
    loadRoot(callback: NodeCallback): void;
    /** Save a given node into this KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase#save
     * @param {jibo.kb.Node} node The node to be saved.
     * @param {Function} callback Called with (err) when done.
     * @intdocs
     */
    save(node: Node, callback: ErrCallback): void;
    /** Remove a node from this KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase#remove
     * @param {string|jibo.kb.Node} idOrNode Id string or Node object to be
     * removed.
     * @param {Function} callback Called with (err) when done.
     * @intdocs
     */
    remove(idOrNode: string | Node, callback: CountCallback): void;
    /** Given an object from a Database (or from a web request),
     * convert into a full Node object. Uses the Node Class registry
     * on the `kb` object to find the proper Node subclass, if any.
     * Also binds the Node to this KnowledgeDatabase.
     *
     * @method jibo.kb.KnowledgeDatabase#createNodeFromObject
     * @param {Object} object Object to be converted to a Node
     * object. Must have an `_id` property, should have a `type`
     * property (defaults to `node`).
     * @returns {jibo.kb.Node} The Node object, or a Node subclass object.
     * @intdocs
     */
    createNodeFromObject(object: {
        type: string;
    }): Node;
    /** Create a new Node object. Uses the Node Class registry on the
     * `kb` object to find a proper Node subclass, if any. Also binds
     * the Node to this KnowledgeDatabase.
     *
     * @method jibo.kb.KnowledgeDatabase#createNode
     * @param {string|Class} nodeTypeOrClass A string stating the node
     * type, or a Node Class constructor.
     * @param {Object} [data] Inital node.data.
     * @returns {jibo.kb.Node} The new Node or Node subclass object.
     * @intdocs
     */
    createNode(nodeTypeOrClass: string | NodeConstructor, data?: any): Node;
    /** Bind a given node to this KB slice.
     *
     * @method jibo.kb.KnowledgeDatabase#adoptNodeAsOurOwn
     * @param {jibo.kb.Node} node Node to be adopted.
     * @intdocs
     */
    adoptNodeAsOurOwn(node: Node): void;
    /** Return the directory for this KnowledgeDatabase.
     *
     * @method jibo.kb.KnowledgeDatabase#getDirectory
     * @returns {string} Full path to the directory of this
     * KnowledgeDatabase.
     * @intdocs
     */
    getDirectory(): string;
}
export default KnowledgeDatabase;
