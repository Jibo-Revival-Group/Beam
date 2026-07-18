import Node from './Node';
export declare type AccountData = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    birthday: number;
    photoUrl?: string;
    facebookAccessToken?: string;
    isChild?: boolean;
    phoneNumber?: string;
    messagingAllowed?: boolean;
};
/**
 * Specific type of node for members of the loop. All nodes returned by LoopModel should be UserNodes.
 *
 * @class UserNode
 * @extends jibo.kb.Node
 * @memberof jibo.kb.loop
 */
export default class UserNode extends Node {
    data: {
        loopId: string;
        accountId: string;
        account: AccountData;
        enrolled: {
            voice: boolean;
            face: boolean;
        };
        status: string;
        type: string;
        agreementId: string;
        nickName: string;
        phoneticName: string;
        legalGuardianId: string;
        created: number;
        email: string;
        firstName: string;
        lastName: string;
        gender: 'male' | 'female' | 'other';
        birthday: number;
        photoUrl: string;
        facebookAccessToken: string;
        isChild: boolean;
        phoneNumber: string;
        messagingAllowed: boolean;
    };
    /**
     * UUID of the user.
     * @name jibo.kb.loop.UserNode#id
     * @type {String}
     */
    readonly id: string;
    /**
     * First name of the user.
     * @name jibo.kb.loop.UserNode#firstName
     * @type {String}
     */
    readonly firstName: string;
    /**
     * Last name of the user.
     * @name jibo.kb.loop.UserNode#lastName
     * @type {String}
     */
    readonly lastName: string;
    /**
     * Nickname of the user.
     * @name jibo.kb.loop.UserNode#nickName
     * @type {String}
     */
    readonly nickName: string;
    /**
     * Gender of the user.
     * @name jibo.kb.loop.UserNode#gender
     * @type {String}
     */
    readonly gender: "male" | "female" | "other";
    /**
     * If this loop member is actually Jibo.
     * @name jibo.kb.loop.UserNode#isJibo
     * @type {Boolean}
     */
    readonly isJibo: boolean;
    /**
     * The loop member's preferred written name. This will be the nickname or first name
     * of the loop member.
     * @method jibo.kb.loop.UserNode#getWrittenName
     * @return {String} The loop member's preferred written name.
     */
    getWrittenName(): string;
    /**
     * The loop member's preferred spoken name. This will be the `phoneticName`, nickname, or first name
     * of the loop member.
     * @method jibo.kb.loop.UserNode#toString
     * @return {String} The loop member's preferred spoken name.
     */
    toString(): string;
    /**
     * Calculate the initials of the loop member.
     * @method jibo.kb.loop.UserNode#getInitials
     * @return {String} The loop member's initials.
     */
    getInitials(): string;
    /**
     * Outputs data appropriate for unsecure logging.
     * @method jibo.kb.loop.UserNode#toLog
     * @return {String} A safe representation of the UserNode with no identifying info
     */
    toLog(): string;
}
