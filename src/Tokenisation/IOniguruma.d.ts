
interface IOnigLib {
    createOnigScanner(sources: string[]): IOnigScanner;
    createOnigString(str: string): IOnigString;
}
interface IOnigScanner {
    findNextMatchSync(string: string | IOnigString, startPosition: int, options: number): IOnigMatch | null;
    dispose?(): void;
}
interface IOnigString {
    readonly content: string;
    dispose?(): void;
}
interface IOnigMatch {
    index: int;
    captureIndices: IOnigCaptureIndex[];
}
interface IOnigCaptureIndex {
    start: int;
    end: int;
    length: int;
}