import { Memento } from "vscode";




export interface KeyValPair<K,V> {Key:K, Val:V}




// interface IEnumerable<T> {

// }


export class Cache {
		private cache: { [key: string]: unknown };

		constructor(private storage: Memento, private namespace: string) {
			this.cache = storage.get(this.namespace, {});
		}

		public put(key: string, value: unknown): void {
			this.cache[key] = value;
			this.storage.update(this.namespace, this.cache);
		}

		public get<T>(key: string, defaultValue?: unknown): T {
			return (key in this.cache ? this.cache[key] : defaultValue) as T;
		}
}





export class HashSet<T> {
	private dict : Map<T,bool>;
	public constructor(...Initial: Array<T>) {
		this.dict = new Map<T,bool>();
		this.dict.set
		for(const item of Initial) this.dict.set(item, true);
	}
	
	public get length() { return this.dict.size; }

	public add(val : T) { this.dict.set(val, true); }
	public remove(val : T) { return this.dict.delete(val); }
	public has(val : T) { return Boolean(this.dict.get(val)); }

	public addRange(...range: Array<T>) {
		for(const item of range) this.dict.set(item, true);
	}

	public removeRange(...range: Array<T>) {
		for(const item of range) this.dict.delete(item);
	}

	public getValues() { return this.dict.keys(); }

	public clear() { return this.dict.clear(); }
}



type QueueItem = (cb: () => void) => unknown
export class Queue {

	private _running = false;

	private _queue: Array<QueueItem> = [];
	/**
	 * Add a action inside the queue.
	 * The action should take a callback as first parameter and call it
	 * when his work is done in order to start the next action
	 *
	 * @param {Function} f
	 * @returns
	 * @memberOf Queue
	 */
	public push(f: QueueItem): Queue {
		this._queue.push(f);
		if (!this._running) this._next();
		return this; // for chaining fun!
	}

	private _next() {
		this._running = false;
		const action = this._queue.shift();
		if (action) {
			this._running = true;
			try { action(this._next.bind(this)); } 
			catch { this._next.call(this); }
		}
	}
}














// export class TasksRunner<T> {
// 	private _currentTask: IterableIterator<T>|null = null;
	
// 	/**
// 	 * Add a task to run.
// 	 * Pushing a new task will cancel the execution of the previous
// 	 *
// 	 * @param {Generator} IterableIterator<any>
// 	 * @returns
// 	 * @memberOf TasksRunner
// 	 */
// 	run(f: () => IterableIterator<T>): TasksRunner<T> {
// 		this._currentTask?.return?.();
// 		this._currentTask = f();
// 		this._run();
// 		return this; // for chaining fun!
// 	}
// 	/**
// 	 * Cancel the currently running task
// 	 */
// 	stop(): void {
// 		this._currentTask?.return?.();
// 	}
	
// 	_run(): void {
// 		const it: IterableIterator<T> = this._currentTask!;
// 		function run(args?: any):any {
// 			try {
// 				const result: IteratorResult<T> = it.next(args); // deal with errors in generators
// 				return (result.done)? result.value : Promise.resolve(result.value).then(run);
// 			} catch (error) {} // do something
// 		}
// 		run();
// 	}
// }





















export function *Counter(start:int, stop:int, step:int =1) : Generator<number> {
	for (let i=start; i<stop; i+=step) yield i;
}



// interface IList<T> extends Array<T> {
// 	length : int;
// 	[index:int] : T;
// }









/**
 * An array that avoids being sparse by always
 * filling up unused indices with a default value.
 */
export class ContiguousGrowingArray<T> {
	private _store: T[] = new Array<T>();

	constructor(private readonly _default: T) { }

	public get length():int { return this._store.length; }
	public validIndex(index: int): bool { return (0 <= index && index < this._store.length); }

	public get(index: number): T { 
		return ((index < this._store.length)? this._store[index] : this._default);
	}

	public set(index: number, value: T): void {
		if (index >= this._store.length) 
			for (let i=this._store.length; i<index; ++i) 
				this._store[i] = this._default;
		this._store[index] = value;
	}

	public delete(deleteIndex: number, deleteCount: number): void {
		if (deleteCount === 0 || deleteIndex >= this._store.length) return;
		else this._store.splice(deleteIndex, deleteCount);
	}

	public insert(insertIndex: number, insertCount: number): void {
		if (insertCount === 0 || insertIndex >= this._store.length) return;
		const arr: T[] = new Array<T>(insertCount);
		for (let i = 0; i < insertCount; i++) arr[i] = this._default;
		this._store = this._store.insertArray(insertIndex, arr);
	}

	public clear(): void {
		this._store.length = 0;
	}
}






