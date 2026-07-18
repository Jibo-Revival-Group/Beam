/**
 * Specific type of node for members of the loop. All nodes returned by LoopModel should be UserNodes.
 *
 * @class UserNode
 * @extends jibo.kb.Node
 * @memberof jibo.kb.loop
 */

    /**
     * UUID of the user.
     * @name jibo.kb.loop.UserNode#id
     * @type {String}
     */

    /**
     * First name of the user.
     * @name jibo.kb.loop.UserNode#firstName
     * @type {String}
     */

    /**
     * Last name of the user.
     * @name jibo.kb.loop.UserNode#lastName
     * @type {String}
     */

    /**
     * Nickname of the user.
     * @name jibo.kb.loop.UserNode#nickName
     * @type {String}
     */

    /**
     * Gender of the user.
     * @name jibo.kb.loop.UserNode#gender
     * @type {String}
     */

    /**
     * If this loop member is actually Jibo.
     * @name jibo.kb.loop.UserNode#isJibo
     * @type {Boolean}
     */

    /**
     * The loop member's preferred written name. This will be the nickname or first name
     * of the loop member.
     * @method jibo.kb.loop.UserNode#getWrittenName
     * @return {String} The loop member's preferred written name.
     */

    /**
     * The loop member's preferred spoken name. This will be the `phoneticName`, nickname, or first name
     * of the loop member.
     * @method jibo.kb.loop.UserNode#toString
     * @return {String} The loop member's preferred spoken name.
     */

    /**
     * Calculate the initials of the loop member.
     * @method jibo.kb.loop.UserNode#getInitials
     * @return {String} The loop member's initials.
     */

    /**
     * Outputs data appropriate for unsecure logging.
     * @method jibo.kb.loop.UserNode#toLog
     * @return {String} A safe representation of the UserNode with no identifying info
     */