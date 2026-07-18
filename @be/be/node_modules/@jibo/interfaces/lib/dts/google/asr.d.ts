export declare type SpeechEventType = 'END_OF_SINGLE_UTTERANCE' | 'SPEECH_EVENT_UNSPECIFIED';
export declare namespace SpeechEventType {
    const END_OF_SINGLE_UTTERANCE: SpeechEventType;
    const SPEECH_EVENT_UNSPECIFIED: SpeechEventType;
}
export interface ASRResultOuter {
    isFinal: boolean;
    alternatives: ASRResult[];
    stability: number;
}
export interface ASRResult {
    confidence: number;
    transcript: string;
    words: string[];
}
/**
 * The output from the google speech service
 */
export interface ASROutput {
    speechEventType: SpeechEventType;
    results?: ASRResultOuter[];
    error?: {
        code: number;
        message: string;
        details: string[];
    };
}
