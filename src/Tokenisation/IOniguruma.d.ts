
interface IOnigLib {
    createOnigScanner(sources: string[]): IOnigScanner;
    createOnigString(str: string): IOnigString;
}
interface IOnigScanner {
    findNextMatchSync(string: string | IOnigString, startPosition: number, options: number): IOnigMatch | null;
    dispose?(): void;
}
interface IOnigString {
    readonly content: string;
    dispose?(): void;
}
interface IOnigCaptureIndex {
    start: number;
    end: number;
    length: number;
}
interface IOnigMatch {
    index: number;
    captureIndices: IOnigCaptureIndex[];
}

// interface IMatchResult {
// 	readonly captureIndices: IOnigCaptureIndex[];
// 	readonly matchedRuleId: RuleId | typeof endRuleId;
// }