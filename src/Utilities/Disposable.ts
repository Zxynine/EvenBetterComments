import { Disposable } from "vscode";

/** Disposable interface */
export interface IDisposable {
	dispose(): void;
}

export const DISPOSER = (D : IDisposable) => D.dispose();

export abstract class DisposableContext implements Disposable {
	protected readonly subscriptions: Disposable[] = [];
	public readonly dispose = () =>	{
		this.subscriptions.forEach(DISPOSER);
		this.subscriptions.length = 0;
	}
}

export class DisposableArray extends Array<Disposable> implements Disposable  {
	public popDispose(): void {
		super.pop()?.dispose();
	}

	public spliceDispose(start: number, deleteCount: number = 1): void {
		super.splice(start, deleteCount).forEach(DISPOSER);
	}

	public clearDispose() {
		Disposable.prototype.dispose
		super.forEach(DISPOSER);
		super.length = 0;
	}

	public dispose() {
		super.forEach(DISPOSER);
		super.length = 0;
	}
}

/**
 * Manages a collection of disposable values.
 *
 * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
 * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
 * store that has already been disposed of.
 */
export class DisposableStore extends Disposable {
	private static readonly DISABLE_DISPOSED_WARNING = false;

	/** @return `true` if this object has been disposed of. **/
	public get isDisposed(): boolean {return this._isDisposed;}
	private _isDisposed = false;

	private readonly _toDispose = new Set<IDisposable>();

	public constructor() { super(() => this.clear()); }


	/**
	 * Dispose of all registered disposables and mark this object as disposed.
	 * Any future disposables added to this object will be disposed of on `add`.
	 */
	public dispose(): void {
		if (this._isDisposed) return;
		this._isDisposed = true;
		super.dispose();
	}


	/** Dispose of all registered disposables but do not mark this object as disposed. **/
	public clear(): void {
		if (this._toDispose.size === 0) return;
 		else try { Disposable.from(...this._toDispose).dispose(); } 
		finally { this._toDispose.clear(); }
	}

	/** Add a new {@link IDisposable disposable} to the collection. **/
	public add<T extends IDisposable>(o: T): T {
		if (!o) return o;
		if ((o as unknown as DisposableStore) === this) throw new Error('Cannot register a disposable on itself!');

		if (this._isDisposed) {
			if (!DisposableStore.DISABLE_DISPOSED_WARNING) console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
		} else this._toDispose.add(o);
		return o;
	}
}



// export class Disposable implements vscode.Disposable {
// 	private disposables: vscode.Disposable[] = [];
// 	private disposed: boolean = false;

// 	/**
// 	 * Disposes the resources used by the subclass.
// 	 */
// 	public dispose() {
// 		this.disposed = true;
// 		this.disposables.forEach((disposable) => {
// 			try {
// 				disposable.dispose();
// 			} catch (_) { }
// 		});
// 		this.disposables = [];
// 	}

// 	/**
// 	 * Register a single disposable.
// 	 */
// 	protected registerDisposable(disposable: vscode.Disposable) {
// 		this.disposables.push(disposable);
// 	}

// 	/**
// 	 * Register multiple disposables.
// 	 */
// 	protected registerDisposables(...disposables: vscode.Disposable[]) {
// 		this.disposables.push(...disposables);
// 	}

// 	/**
// 	 * Is the Disposable disposed.
// 	 * @returns `TRUE` => Disposable has been disposed, `FALSE` => Disposable hasn't been disposed.
// 	 */
// 	protected isDisposed() {
// 		return this.disposed;
// 	}
// }












// export function using<T extends Disposable>(resource: T, func: (resource: T) => void) {
// 	try { func(resource); } 
// 	finally { resource.dispose(); }
// }




// export function dispose<T extends Disposable>(disposables: T[]): T[] {
// 	disposables.forEach(d => d.dispose());
// 	return new Array<T>();
// }

// export function toDisposable(dispose: Action): Disposable { return { dispose } }

// export function combinedDisposable(disposables: Disposable[]): Disposable {
// 	return toDisposable(() => dispose(disposables));
// }


// export const EmptyDisposable = toDisposable(() => null);




// export function dispose<T extends Disposable>(disposable: T): T | undefined;
// export function dispose<T extends Disposable>(...disposables: T[]): T[] | undefined;
// export function dispose<T extends Disposable>(disposables: T[]): T[] | undefined;
// export function dispose<T extends Disposable>(first: T | T[], ...rest: T[]): T | T[] | undefined {
//     if (Array.isArray(first)) {
//         first.forEach(d => d && d.dispose());
//         return [];
//     } else if (rest.length === 0) {
//         if (first) {
//             first.dispose();
//             return first;
//         }
//         return undefined;
//     } else {
//         dispose(first);
//         dispose(rest);
//         return [];
//     }
// }





