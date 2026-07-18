import { ASRResult } from '../../asr';
import { NLUResult } from '../../nlu';
import { GlobalMatchResponseData } from '../../common';
import * as hub from '../../hub';
import * as skill from '../../skill';
export interface SpeechHistoryBaseData {
    robotID: string;
    accountID: string;
    transID: string;
    timestamp: number;
}
export interface SpeechHistoryUpdate {
    audioFileURL?: string;
    personIDs?: string[];
    asr?: ASRResult;
    nlu?: NLUResult;
    match?: GlobalMatchResponseData;
    redirect?: skill.response.SkillRedirectData;
    skill?: skill.request.SkillRequestOutput;
    error?: hub.response.HubErrorData;
}
export interface SpeechHistoryRecordData extends SpeechHistoryBaseData, SpeechHistoryUpdate {
}
export interface SpeechHistoryRecord extends SpeechHistoryBaseData, SpeechHistoryUpdate {
    id: string;
}
