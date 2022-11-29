
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
interface IOnigMatch {
    index: number;
    captureIndices: IOnigCaptureIndex[];
}
interface IOnigCaptureIndex {
    start: number;
    end: number;
    length: number;
}