/**
 * The output from API.ai
 */
export interface APIAIOutput {
    id: string;
    timestamp: string;
    lang: string;
    result: {
        source: string;
        resolvedQuery: string;
        action: string;
        actionIncomplete: boolean;
        parameters: {
            [key: string]: string | string[];
        };
        contexts: any[];
        metadata: {
            intentName: string;
            intentId: string;
        };
        fulfillment: any;
        score: number;
    };
    status: {
        code: number;
    };
    sessionId: string;
}
