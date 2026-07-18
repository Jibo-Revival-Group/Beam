import Node from './Node';
export declare type NodeCallback = (err, node?: Node) => void;
export declare type LoadCallback = (id: string, callback: NodeCallback) => void;
/** Cache Class. Holds loaded nodes for a model that `begin()` has been
 * called on.
 *
 * @class Cache
 * @memberof jibo.kb
 * @intdocs
 */
declare class Cache {
    /** Retreive a node object from the cache.
     *
     * @method jibo.kb.Cache#fetch
     * @param {string} id ID of node to fetch.
     * @param {boolean} [quietly=false] Suppress warning message about node not found in cache.
     * @returns {jibo.kb.Node} Node object if found in cache or undefined if not.
     * @intdocs
     */
    fetch(id: string, quietly?: boolean): Node;
    /** Add a node object to the cache.
     *
     * @method jibo.kb.Cache#add
     * @param {jibo.kb.Node} node Node object to add.
     * @param {boolean} [quietly=false] Suppress warning message if node was already in cache (first in cache wins).
     * @intdocs
     */
    add(node: Node, quietly?: boolean): void;
    /** Remove a node object from the cache.
     *
     * @method jibo.kb.Cache#remove
     * @param {string|jibo.kb.Node} idOrNode ID string or Node object to be removed.
     * @param {boolean} [quietly=false] Suppress warning message about node not found in cache.
     * @intdocs
     */
    remove(idOrNode: string | Node, quietly?: boolean): void;
    /** Check if node is present in cache.
     *
     * @method jibo.kb.Cache#isPresent
     * @param {string|jibo.kb.Node} idOrNode ID string or Node object to check cache for.
     * @returns {boolean} `true` if node is in cache.
     */
    isPresent(idOrNode: string | Node): boolean;
    /** If a node is present in cache, return it (via callback),
     * otherwise use the given `load` function to load it and put the
     * loaded node into the cache before calling `callback`.
     *
     * @method jibo.kb.Cache#interceptLoad
     * @param {string} id ID of node to fetch or load.
     * @param {Function} callback Called with found or loaded node, (err, node).
     * @param {Function} load Function to call to load the node if not already in cache, (id, callback).
     * @intdocs
     */
    interceptLoad(id: string, callback: NodeCallback, load: LoadCallback): void;
}
export default Cache;
