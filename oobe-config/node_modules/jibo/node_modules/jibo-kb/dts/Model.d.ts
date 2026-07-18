import Cache from './Cache';
import KnowledgeDatabase from './KnowledgeDatabase';
import Node from './Node';
export declare type ErrCallback = (err) => void;
export declare type NodeCallback = (err, node?: Node) => void;
export declare type NodesCallback = (err, nodes?: Node[]) => void;
export declare type ModelConstructor = new (kbNames: string | string[], httpUrl: string) => Model;
/** Combine multiple KB slices into one. Model instances are the main
 * interaction point with the Knowledge Base. Methods for following
 * edges between nodes are here.
 *
 * Extend this class to add model specific methods to a Model.
 *
 * @class Model
 * @memberof jibo.kb
 * @param {string|string[]} kbNames KB slice names to use in this
 * model.
 * @param {string} httpUrl Base URL of KB service to use.
 */
export default class Model {
    private static modelClassRegistry;
    pool: KnowledgeDatabase[];
    cache: Cache;
    roots: {
        [kbName: string]: Node;
    };
    kbNames: string[];
    httpUrl: string;
    /** Register a Model subclass to be instantiated for a given KB name
     * list.
     *
     * @method jibo.kb.Model.registerModelClass
     * @static
     * @param {string|string[]} kbNames KB name or name list use this
     * subclass for.
     * @param {Function} classConstructor The constructor function for
     * the subclass.
     * @intdocs
     */
    static registerModelClass(kbNames: string | string[], classConstructor: ModelConstructor): void;
    /** Use the given KB slice names to find a Model subclass in the
     * Model subclass registry. Defaults to the plain `Model` object
     * if nothing matches.
     *
     * @method jibo.kb.Model.findModelClass
     * @static
     * @param {string|string[]} kbNames Array of knowledge base slice
     * names.
     * @returns {Function} Model class constructor.
     * @intdocs
     */
    static findModelClass(kbNames: string | string[]): ModelConstructor;
    constructor(kbNames: string | string[], httpUrl?: string);
    /** Initalize the model and all its kb slices.
     * Not needed when using the KB service as a client.
     *
     * @method jibo.kb.Model#init
     * @param {Function} callback Callback for the method.
     * @intdocs
     */
    init(callback: ErrCallback): void;
    /** Create a new Model object.
     *
     * This behaves the same as `kb.createModel()`, except the KB
     * names are not required to start with /. KB names that don't
     * start with / will be relative to this Model. Specifically, they
     * will relative to the KB name of the first KB in this model.
     *
     * For example, if this Model has the KB names `['/snap',
     * '/snap/albums']` and this method is called as
     * `model.createModel(['history', '/jibo.loop'])`, then the new
     * model returned by this method will have the KB names
     * `['/snap/history', '/jibo.loop']`.
     *
     * @method jibo.kb.Model#createModel
     * @param {string|string[]} kbNames KB slice names to use in new
     * model.
     * @param {string} [httpUrl] Base URL of KB service to use
     * (defaults to same URL as `this`).
     * @returns {jibo.kb.Model} New Model object
     */
    createModel(kbNames: string | string[], httpUrl?: string): Model;
    /** Create a new empty node on this Model. Will be attached to the
     * first KB in this Model.
     *
     * @method jibo.kb.Model#createNode
     * @param {string} nodeType Node type.
     * @param {Object} [data] Initial data.
     * @returns {jibo.kb.Node} New node object
     */
    createNode(nodeType: string, data?: any): Node;
    /** Load a node or array of nodes, by their IDs. All KBs in this
     * Model slices are searched in order until found. If node is not
     * found result will be `null`.  If an array is supplied, then
     * multiple IDs are searched for, and an array of results is
     * returned. If callback is omitted, a promise is returned
     * instead.
     *
     * @method jibo.kb.Model#load
     * @param {string|string[]} ids ID or array of IDs to load.
     * @param {Function} [callback] `(err, nodes) => {}`. If callback is
     * omitted, a promise that resolves to `nodes` is returned instead.
     * @returns {Promise} A promise that resolves with the value of
     * `node` if the callback is omitted.
     */
    load(id: string, callback: NodeCallback): any;
    load(ids: string[], callback: NodesCallback): any;
    load(id: string): Promise<Node>;
    load(ids: string[]): Promise<Node[]>;
    loadList(ids: string[], callback: NodesCallback): any;
    fetchList(ids: string[], quietly?: boolean): Node[];
    /** Load the root node of the first KB. If a KB slice name is
     * given, then load the root node for that KB instead. If callback
     * is omitted a promise is returned instead.
     *
     * @method jibo.kb.Model#loadRoot
     * @param {string} [kbName] Name of KB slice to load root node
     * from. Default is first slice.
     * @param {Function} [callback] (err, rootNode) => {}. If callback
     * is omitted a promise that resolves to `rootNode` is returned
     * instead.
     * @returns {Promise} A promise that resolves with the value of
     * `rootNode` if the callback is omitted.
     */
    loadRoot(callback: NodeCallback): any;
    loadRoot(kbName: string, callback: NodeCallback): any;
    loadRoot(): Promise<Node>;
    loadRoot(kbName: string): Promise<Node>;
    /** Preload all nodes connected by the layer names into the
     * cache. Does not return the nodes. If callback is omitted a
     * promise is returned instead.
     *
     * @method jibo.kb.Model#loadLayers
     * @param {jibo.kb.Node} node Initial node to start from.
     * @param {string|string[]} layers Edge names to follow.
     * @param {Function} [callback] Callback for the method. If callback
     * is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    loadLayers(node: Node, layers: string | string[], callback: Function): any;
    loadLayers(node: Node, layers: string | string[]): Promise<any>;
    /** Save all nodes connected by the layer names. Only used after
     * activating the cache and preloading the given layers with
     * loadLayers(). If callback is omitted a promise is returned
     * instead.
     *
     * @method jibo.kb.Model#saveLayers
     * @param {jibo.kb.Node} node Initial node to start from.
     * @param {string|string[]} layers Edge names to follow.
     * @param {Function} [callback] Callback for the method. If callback
     * is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    saveLayers(node: Node, layers: string | string[], callback: Function): any;
    saveLayers(node: Node, layers: string | string[]): Promise<any>;
    /** Load all nodes connected by the layer names. Execute the given
     * action once on each node. If callback is omitted a promise is
     * returned instead.
     *
     * @method jibo.kb.Model#visitLayers
     * @param {jibo.kb.Node} node Initial node to start from.
     * @param {string|string[]} layers Edge names to follow.
     * @param {Function} action `(eachNode, callback) => {}`
     * @param {Function} [callback] Callback for the method. If callback
     * is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    visitLayers(node: Node, layers: string | string[], action: Function, callback: Function): any;
    visitLayers(node: Node, layers: string | string[], action: Function): Promise<any>;
    /** Create a clone of this Model object and its slices, but with
     * the cache enabled. Cache based operations are intended to be
     * short term in nature. Release the clone for garbage collection
     * when finished.
     *
     * @method jibo.kb.Model#begin
     * @returns {jibo.kb.Model} A new Model object.
     */
    begin(): Model;
    /** Synchronously fetch a node, or array of nodes, from the
     * cache. Use on models created with `begin()` and preloaded with
     * nodes. Nodes searched for but not found during preloading will
     * be null. Nodes not preloaded will be undefined.
     *
     * @method jibo.kb.Model#fetch
     * @param {string|string[]} ids ID or array of IDs node to fetch.
     * @param {boolean} [quietly] Suppress warning if node not found
     * in cache.
     * @throws Exception if cache is not enabled.
     * @returns {jibo.kb.Node} Node or `null` if not found. If
     * an array of IDs is supplied, then an array of nodes is
     * returned.
     */
    fetch(id: string, quietly?: boolean): Node;
    fetch(ids: string[], quietly?: boolean): Node[];
    /** Synchronously fetch the root node of the first KB from cache.
     * If a KB slice name is given, then load the root node for that
     * KB instead.
     *
     * @method jibo.kb.Model#fetchRoot
     * @param {string} [kbName] Name of KB slice to load root node
     * from. Default is first slice.
     * @param {boolean} [quietly] Suppress warning if root node not
     * found in cache.
     * @throws Exception if cache is not enabled.
     * @returns {jibo.kb.Node} Root node or `null` if not in cache.
     */
    fetchRoot(kbName?: string, quietly?: boolean): Node;
}
