import Node from './Node';
import KnowledgeDatabase from './KnowledgeDatabase';
export declare type ErrCallback = (err) => void;
export declare type NodeCallback = (err, node?: Node) => void;
export declare type NodesCallback = (err, nodes?: Node[]) => void;
/**
 * @description KB service client version of KnowledgeDatabase Class.
 *
 * @class WebClient
 * @memberof jibo.kb
 * @extends {jibo.kb.KnowledgeDatabase}
 * @param {string} kbName Name of this KB slice.
 * @param {string} Base URL of KB service to attach to.
 * @intdocs
 */
export default class WebClient extends KnowledgeDatabase {
    httpUrl: string;
    constructor(kbName: string, httpUrl: string);
    /**
     * Initalize this KnowledgeDatabase slice - currenty does
     * nothing, you do not need to call this.
     *
     * @method jibo.kb.WebClient#init
     * @param {Function} callback Called when finshed.
     * @intdocs
     */
    init(callback: ErrCallback): void;
    /**
     * Load a node of a given ID.
     *
     * @method jibo.kb.WebClient#load
     * @param {string} id ID of node to load via the KB service.
     * @param {Function} callback Called with (err, node).
     * @intdocs
     */
    load(id: string, callback: NodeCallback): void;
    /**
     * Load an array of nodes of the given array of IDs.
     *
     * @method jibo.kb.WebClient#loadList
     * @param {string[]} ids IDs of nodes to load via the KB service.
     * @param {Function} callback Called with (err, nodes).
     * @intdocs
     */
    loadList(ids: string[], callback: NodesCallback): void;
    /**
     * Load the root node of this KB slice.
     *
     * @method jibo.kb.WebClient#loadRoot
     * @param {Function} callback Called with (err, rootNode).
     * @intdocs
     */
    loadRoot(callback: NodeCallback): void;
    /**
     * Save a given node into this KB slice.
     *
     * @method jibo.kb.WebClient#save
     * @param {jibo.kb.Node} node The node to be saved.
     * @param {Function} callback Called with (err) when done.
     * @intdocs
     */
    save(node: Node, callback: ErrCallback): void;
    /**
     * Remove a node from this KB slice.
     *
     * @method jibo.kb.WebClient#remove
     * @param {string|jibo.kb.Node} idOrNode ID string or Node object to be removed.
     * @param {Function} callback Called with (err) when done.
     * @intdocs
     */
    remove(idOrNode: string | Node, callback: ErrCallback): void;
    /**
     * Returns the root directory for this KB slice. Not needed for
     * this Web Client version.
     *
     * @method jibo.kb.WebClient#getDirectory
     * @returns {string} URL for this KB slice just in case something
     * calls this expecting a directory.
     * @intdocs
     */
    getDirectory(): string;
}
