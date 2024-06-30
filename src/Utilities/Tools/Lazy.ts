'use strict';






export namespace Lazy {
	export function Value<T>(getValue: () => T) {
		return new LazyValue<T>(getValue);
	}
}


export interface Lazy<T> {
	readonly Value: T;
	readonly Loaded: boolean;
	Map<R>(f: (x: T) => R): Lazy<R>;
}


class LazyValue<T> implements Lazy<T> {
	private _hasValue = false;
	private _value?: T;

	constructor(
		private readonly getter: () => T
	) { }

	public get Value(): T {
		if (!this._hasValue) this._hasValue = true, this._value = this.getter();
		return this._value!;
	}

	public get Loaded(): boolean { return this._hasValue; }

	public Map<R>(f: (x: T) => R): Lazy<R> { return new LazyValue(() => f(this.Value)); }
}
