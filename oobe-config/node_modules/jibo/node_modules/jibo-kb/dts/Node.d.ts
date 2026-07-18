import Asset from './Asset';
import KnowledgeDatabase from './KnowledgeDatabase';
export declare type ErrCallback = (err) => void;
export declare type NodeConstructor = new (...args: any[]) => Node;
/** Knowledge Base document store object. This is where data lives.
 * Nodes have edges which point to other nodes in any KB slice
 * (possibly even slices not in your current model). Edges have names
 * to group them into layers.
 *
 * All user specified data goes into `node.data`.
 *
 * `model.createNode()` is typically used to create new nodes so the
 * nodes will be bound to a KB slice for saving.
 *
 * @class Node
 * @memberof jibo.kb
 * @param {string} [nodeType] Type of node. Defaults to 'node'.
 * @param {Object} [data] Initial data.
 * @param {Object} [cloneFrom] Object or node to clone from.
 */
export default class Node {
    private static nodeClassRegistry;
    _id: string;
    type: string;
    data: any;
    created: number;
    updated: number;
    edges: {
        [id: string]: string[];
    };
    assets: {
        [id: string]: string[];
    };
    getKb: () => KnowledgeDatabase;
    /** Register a Node subclass to be instantiated when a node of a
     * given type is loaded or created.
     *
     * @method jibo.kb.Node.registerNodeClass
     * @static
     * @param {string|string[]} nodeType Node type to use this
     * subclass for.
     * @param {Function} classConstruction The constructor function
     * for the subclass.
     * @param {string} [kbName] Name of KB to limit the use
     * of this subclass to. Defaults to all KBs.
     * @intdocs
     */
    static registerNodeClass(nodeType: string, classConstructor: NodeConstructor, kbName?: string): void;
    /** Use the node type to find a Node subclass in the Node Class
     * registry. Default to the plain `Node` object if nothing
     * matches.
     *
     * @method jibo.kb.Node.findNodeClass
     * @static
     * @param {string} nodeType Type of node.
     * @param {string} kbName Name of KB slice.
     * @returns {Function} Node class constructor.
     * @intdocs
     */
    static findNodeClass(nodeType: string, kbName: string): NodeConstructor;
    constructor(nodeType?: string, data?: any, cloneFrom?: any);
    /** Save the node into KB slice it is bound to.
     * Also sets the `node.updated` timestamp.
     *
     * @method jibo.kb.Node#save
     * @param {Function} [callback] Called when node is finished
     * saving. If callback is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    save(callback: ErrCallback): any;
    save(): Promise<any>;
    /** Remove the node from KB slice it is bound to.
     *
     * @method jibo.kb.Node#remove
     * @param {Function} [callback] Called when node is finished being
     * removed. If callback is omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    remove(callback: ErrCallback): any;
    remove(): Promise<any>;
    /** Add edges to this node. Edges will have the name given by
     * layer, or will be taken from the node types (but nodes must be
     * given in that case, no id strings).
     *
     * @method jibo.kb.Node#addEdges
     * @param {string|jibo.kb.Node|string[]|jibo.kb.Node[]} idsOrNodes Ids of edges to
     * add to this node. Ids will be gotten from any nodes provided.
     * @param {string} [layer] Added edges will have this name. If
     * Nodes are given and layer is not specified, the edge name will
     * be taken from the node type.
     */
    addEdges(idsOrNodes: string | string[] | Node | Node[], layer?: string): void;
    /** Remove edges of the given layer name from this node. Layer can
     * be omitted if nodes are given and the node types match the
     * layer names of the edges to be removed.
     *
     * @method jibo.kb.Node#removeEdges
     * @param {string|jibo.kb.Node|string[]|jibo.kb.Node[]} idsOrNodes Ids of edges to
     * remove from this node. Ids will be gotten from any nodes
     * provided.
     * @param {string} [layer] Remove edges with this name. If Nodes
     * are given and layer is not specified, the edge name will be
     * taken from the node type for each node id.
     */
    removeEdges(idsOrNodes: string | string[] | Node | Node[], layer?: string): void;
    /** Remove all edges of a given name.
     *
     * @method jibo.kb.Node#clearEdges
     * @param {string|string[]} layers The layer names (edge names) to remove.
     */
    clearEdges(layers: string | string[]): void;
    /** Get edges of given layer names.  Duplicates are removed (this
     * may change). Order of edges are preserved for a single layer
     * name (except for duplicate removal). Order gets even messier for
     * multiple layers (because of duplicate removal).
     *
     * @method jibo.kb.Node#getEdges
     * @param {string|string[]} layers Nmes of layers to return edges for.
     * @returns {string[]} Array of IDs.
     */
    getEdges(layers: string | string[]): string[];
    /** All layers (edge names) on this node
     * @method jibo.kb.Node#getLayers
     * @returns {string[]} Array of layer names.
     */
    getLayers(): string[];
    /** Create a new asset object and add it to the list of assets on
     * this node.
     *
     * @method jibo.kb.Node#createAsset
     * @param {string} [subtype] Subtype name for this asset.
     * @param {string} [ext] Optional filename extension.
     * @returns {jibo.kb.Asset} New asset object.
     */
    createAsset(subtype?: string, ext?: string): Asset;
    /** Add existing asset objects to the list of assets on this
     * node. The asset objects root directory needs to match this node
     * object.
     *
     * @method jibo.kb.Node#addAssets
     * @param {jibo.kb.Asset|jibo.kb.Asset[]} assets Asset objects to add to node.
     * @param {string} [subtype] Subtype string to force assets to be
     * added as. Subtype comes from each asset object unless this is
     * specified.
     */
    addAssets(assets: Asset | Asset[], subtype?: string): void;
    /** Get all asset objects of given subtype from the assets listed
     * on this node.
     *
     * @method jibo.kb.Node#getAssets
     * @param {string} [subtype] Asset subtype to get. Defaults to `asset`.
     * @returns {jibo.kb.Asset[]} Array of asset objects.
     */
    getAssets(subtype?: string): Asset[];
    /** Get all asset objects from the assets listed on this node,
     * regardless of subtype.
     *
     * @method jibo.kb.Node#getAllAssets
     * @returns {jibo.kb.Asset[]} Array of asset objects.
     */
    getAllAssets(): Asset[];
    /** List of all asset subtypes on this node.
     *
     * @method jibo.kb.Node#getAssetSubtypes
     * @returns {string[]} Array of subtype name strings.
     */
    getAssetSubtypes(): string[];
    /** Delete an asset from disk and remove it from this node.
     *
     * @method jibo.kb.Node#removeAsset
     * @param {jibo.kb.Asset} asset Asset object to remove.
     * @param {Function} [callback] Called when done. If callback is
     * omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    removeAsset(asset: Asset, callback: ErrCallback): any;
    removeAsset(asset: Asset): Promise<any>;
    /** Delete from disk and remove all assets from the node.
     *
     * @method jibo.kb.Node#removeAllAssets
     * @param {Function} [callback] Called when done. If callback is
     * omitted a promise is returned instead.
     * @returns {Promise} A promise if the callback is omitted.
     */
    removeAllAssets(callback: ErrCallback): any;
    removeAllAssets(): Promise<any>;
    /** Bind this node to a given KB slice.
     *
     * @method jibo.kb.Node#setKb
     * @param {jibo.kb.KnowledgeDatabase} knowledgeDatabase KB "slice" to bind this node to
     * @returns {jibo.kb.Node} `this`
     * @intdocs
     */
    setKb(knowledgeDatabase: KnowledgeDatabase): this;
    /** Set the 'updated' timestamp on this node.
     *
     * @method jibo.kb.Node#setUpdated
     * @param {number} [timestamp] Milliseconds since 1 January 1970
     * 00:00:00 UTC. Defaults to now.
     */
    setUpdated(timestamp?: number): void;
}
