/** ASR transcription annotations to label the result at a high level */
export declare enum ASRAnnotation {
    /** Label used when the ASR transcription shouldn't be acted upon (e.g. non-user speech) */
    GARBAGE = "GARBAGE",
    /** Label used when the ASR transcription was stopped early by Fast EOS */
    FAST_EOS = "FAST_EOS",
    /** Label used when ASR never detected SOS */
    SOS_TIMEOUT = "SOS_TIMEOUT",
    /** Label used when ASR continuously receives speech until the max allowed time */
    MAX_SPEECH_TIMEOUT = "MAX_SPEECH_TIMEOUT",
}
/** ASR config which robot sends in LISTEN message */
export interface ASRConfig {
    /**
     * Type of encoding for the config
     * @default 'LINEAR16'
     */
    encoding?: 'LINEAR16' | 'FLAC';
    /**
     * The sample rate of the audio.
     * @default 16000
     */
    sampleRate?: number;
    /** Time in ms to wait for start of speech */
    sosTimeout?: number;
    /** Maximum time in ms to wait for final response */
    maxSpeechTimeout?: number;
    /** List of hint phrases to add to Google */
    hints?: string[];
    /** A list of words and phrases for fast EOS */
    earlyEOS?: string[];
}
/** The ASR results received */
export interface ASRResult {
    /** String of what Jibo heard */
    text: string;
    /** Jibo's confidence (0-1) that his `text` is correct */
    confidence: number;
    /** Externally applied annotation about the ASRResult (e.g. 'GARBAGE' if thought not to be user speech) */
    annotation?: ASRAnnotation;
}
