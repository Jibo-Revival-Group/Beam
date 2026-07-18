import * as nlu from '../nlu';
export interface Dialog {
    /** Dialog history */
    history: DialogTurn[];
}
/** An extension of IDNLUResp adding skill and MIM info */
export interface DialogTurn extends nlu.NLUResult {
    skillID?: string;
    mimID?: string;
    personID?: string;
}
