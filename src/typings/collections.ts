





export interface IDisposable {
	dispose(): void;
}

export interface IReference<T> extends IDisposable {
	readonly object: T;
}

