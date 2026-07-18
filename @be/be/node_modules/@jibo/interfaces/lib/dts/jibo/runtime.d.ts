/** Possible sensory types. */
export declare type SensoryType = 'PERSON' | 'VOICE' | 'UNKNOWN';
export declare namespace SensoryType {
    /** Motion input */
    const PERSON: SensoryType;
    /** Voice input */
    const VOICE: SensoryType;
    /** Unknown input */
    const UNKNOWN: SensoryType;
}
/** Possible ID status labels for entities. */
export declare type IDLabels = 'NOT_ENROLLED' | 'ANYBODY' | 'IDENTIFIED' | 'UNKNOWN' | 'NOT_TRAINED';
export declare namespace IDLabels {
    /** Speaker is definitely not enrolled. */
    const NOT_ENROLLED: IDLabels;
    /** Speaker could or could not be enrolled. */
    const ANYBODY: IDLabels;
    /** Speaker is in the loop and identified. */
    const IDENTIFIED: IDLabels;
    /** The entity identification is not known. */
    const UNKNOWN: IDLabels;
    /** The entity is definitely not trained. */
    const NOT_TRAINED: IDLabels;
}
/** Interface of elements of a recognized Person Entity */
export interface Person {
    /** UUID of LPS system mapping to entity, including looper ID if recognized. */
    id: string;
    /** Type of entity recognized. */
    type: SensoryType | IDLabels;
    /** Confidence in the recognition. */
    confidence: number;
}
/** Enum of Jibo's possible exterior colors. */
export declare type JiboColor = 'BLACK' | 'WHITE';
export declare namespace JiboColor {
    const BLACK: JiboColor;
    const WHITE: JiboColor;
}
/** Data provided about a given Loop member. */
export interface LooperInfo {
    /** Loop member's first name. */
    firstName: string;
    /** Loop member's last name. */
    lastName: string;
    /** Loop member's phonetic name. */
    phoneticName: string;
    /** Loop member's gender. */
    gender: string;
    /** Unix epoch timestamp of loop member's birthday. */
    birthdate: number;
    /** Loop member's loop ID. */
    id: string;
    /** Loop member's account ID */
    accountId: string;
}
/** Data provided about Jibo himself. */
export interface JiboInfo {
    /** Jibo's exterior color */
    color: JiboColor;
    /** Jibo's birthdate (unix epoch timestamp from the moment he was first turned on) */
    /** ID of the loop Jibo is in */
    birthdate: number;
    id: string;
}
/** Data provided about the Loop and members of it. */
export interface LoopContext {
    /** Information about every Loop member (except Jibo). */
    users: LooperInfo[];
    /** Information about Jibo himself. */
    jibo: JiboInfo;
    /** Loop id of the owner of the Loop. */
    owner: string;
    loopId: string;
}
/** Data provided about Jibo's current emotional state. */
export interface EmotionContext {
    /** Current nearest emotion. */
    name: string;
    /** Current valence. */
    valence: number;
    /** Current confidence. */
    confidence: number;
}
/** Data provided about Jibo's current motivational state. */
export interface MotivationContext {
    /** Current social drive state. */
    social: number;
    /** Current playful drive state. */
    playful: number;
}
/** Data provided about Jibo's current character state. */
export interface CharacterContext {
    /** Current emotion context. */
    emotion: EmotionContext;
    /** Current motivation context. */
    motivation: MotivationContext;
}
/** Data provided about Jibo's current location */
export interface LocationContext {
    /** Jibo's current city (or nearest) */
    city: string;
    /** Jibo's current state */
    state: string;
    /** ISO 3166 1 alpha 2 spec compliant state (or political equivalent) abbreviation of Jibo's current location */
    stateAbbr: string;
    /** Jibo's current country */
    country: string;
    /** ISO 3166 1 alpha 2 spec compliant country code of Jibo's current country. */
    countryCode: string;
    /** Jibo's current latitude */
    lat: number;
    /** Jibo's current longitude */
    lng: number;
    /** ISO 8601 compliant string representing Jibo's current time/timezone. */
    iso: string;
}
/** Data provided about Jibo's current perceptual information. */
export interface PerceptionContext {
    /** ID of the currently active speaker. */
    speaker: string;
    /** Data about currently detected present people. */
    peoplePresent: Person[];
}
/** Data derived from last turn of dialog with Jibo. */
export interface DialogContext {
    /** ID of a loop member that was referred to in utterance. */
    referent?: string;
}
/** On-robot context data */
export interface RuntimeContext {
    /** Information about Jibo's character state. */
    character: CharacterContext;
    /** Information about Jibo's current location. */
    location: LocationContext;
    /** Information about Jibo's loop. */
    loop: LoopContext;
    /** Information about Jibo's perception state. */
    perception: PerceptionContext;
    /** Information derived from the last turn of Dialog with Jibo. */
    dialog: DialogContext;
}
