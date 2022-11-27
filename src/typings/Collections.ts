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












type ActionQueueItem = (cb: () => void) => unknown
export class ActionQueue {

	private _running = false;

	private _queue: Array<ActionQueueItem> = [];
	/**
	 * Add a action inside the queue.
	 * The action should take a callback as first parameter and call it
	 * when his work is done in order to start the next action
	 *
	 * @param {Function} f
	 * @returns
	 * @memberOf Queue
	 */
	public push(f: ActionQueueItem): ActionQueue {
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





export class TasksRunner<T> {
	private _currentTask: IterableIterator<T>|null = null;
	
	/**
	 * Add a task to run.
	 * Pushing a new task will cancel the execution of the previous
	 *
	 * @param {Generator} IterableIterator<any>
	 * @returns
	 * @memberOf TasksRunner
	 */
	run(f: () => IterableIterator<T>): TasksRunner<T> {
		this._currentTask?.return?.();
		this._currentTask = f();
		this._run();
		return this; // for chaining fun!
	}
	/**
	 * Cancel the currently running task
	 */
	stop(): void {
		this._currentTask?.return?.();
	}
	
	_run(): void {
		const it: IterableIterator<T> = this._currentTask!;
		function run(args?: any):any {
			try {
				const result: IteratorResult<T> = it.next(args); // deal with errors in generators
				return (result.done)? result.value : Promise.resolve(result.value).then(run);
			} catch (error) {} // do something
		}
		run();
	}
}















//https://github.com/AbmSourav/dataStructure/tree/main/linkedList
//https://github.com/loiane/javascript-datastructures-algorithms/blob/main/src/ts/data-structures/linked-list.ts
//https://github.com/basarat/typescript-collections/blob/release/src/lib/LinkedList.ts

// export type AnyKey = keyof any;
// // data type
// export type DataType<T> = { key: AnyKey, value: T }



// // singly linked list interface
// export interface ILinkedList {
// 	readonly Count: number;
// 	// prepend(data: DataType<any>): boolean;
// 	// append(data: DataType<any>): boolean;
// 	// add(data: DataType<any>, position: number): boolean;
// 	// getFromHead(): object|false;
// 	// getFromTail(): object|false;
// 	// log(): void;
// 	// remove(key: AnyKey): object|boolean;
// 	// update(key: AnyKey, newValue: any): object|boolean;
// 	// search(key: AnyKey): object|boolean
// 	// iterator(): Generator
// 	// clear(): void;
// }




// export type LinkedNode<T> = {
// 	data: T
// 	next: undefined|LinkedNode<T>
// }
// export type DoublyLinkedNode<T> = {
// 	data: T
// 	next: undefined|DoublyLinkedNode<T>
// 	prev: undefined|DoublyLinkedNode<T>
// }



// export class LinkedList<T> implements ILinkedList {
// 	protected count: int = 0;
// 	protected head: LinkedNode<T>|undefined;
// 	protected tail: LinkedNode<T>|undefined;

// 	public EqualityComparer: IEqualityComparer<T> = (LHS,RHS) => LHS === RHS;
	
// 	/** Time Complexity: O(1) */
// 	public get Count() { return this.count; }
// 	/** Time Complexity: O(1) */
// 	public get IsEmpty() { return this.count === 0; }
	

// 	/** Time Complexity: O(1) */
// 	public PeekHead(): T|undefined;
// 	public PeekHead(defaultValue?: T): T|undefined { return this.head?.data ?? defaultValue; }

// 	/** Time Complexity: O(1) */
// 	public PeekTail(): T|undefined;
// 	public PeekTail(defaultValue?:T): T|undefined { return this.tail?.data ?? defaultValue; }


// 	/** Time Complexity: O(1) */
// 	public AddHead(value: T) {
// 		const Node = <LinkedNode<T>>{ data: value, next: undefined };
// 		Node.next = this.head;
// 		this.head = Node;
// 		if (this.IsEmpty) this.tail = Node;
// 		this.count++;
// 	}

// 	/** Time Complexity: O(1) */
// 	public AddTail(value: T) {
// 		const Node = <LinkedNode<T>>{ data: value, next: undefined };
// 		if (this.tail !== undefined) this.tail.next = Node;
// 		this.tail = Node;
// 		if (this.IsEmpty) this.head = Node;
// 		this.count++;
// 	}

// 	/** Time Complexity: O(n) */
// 	public Add(value:T, index:int) {
// 		const IndexNode = this.GetNodeAtIndex(index);
// 		if (IndexNode === undefined) return;
// 		const NewNode = <LinkedNode<T>>{ data: IndexNode.data, next: IndexNode.next };
// 		IndexNode.data = value;
// 		IndexNode.next = NewNode;
// 		this.count++;
// 	}



// 	/** Time Complexity: O(n) */
// 	public GetAtIndex(index:int, defaultValue?:T): T|undefined {
// 		if (index < 0 || this.count >= index) return defaultValue;
// 		let current:LinkedNode<T>|undefined = this.head;
// 		for (let currentIndex = 0; currentIndex<index && current!==undefined; ++currentIndex, current = current.next);
// 		return current?.data ?? defaultValue;
// 	}

// 	/** Time Complexity: O(n) */
// 	public IndexOf(value: T): number|-1 {
// 		let index = 0;
// 		for (let current = this.head; current!==undefined; current = current.next, ++index) 
// 			if (this.EqualityComparer(current.data, value)) return index;
// 		return -1;
// 	}


// 	/** Time Complexity: O(n) */
// 	public Contains(value:T) : bool {
// 		for (let current = this.head; current!==undefined; current = current.next) 
// 			if (this.EqualityComparer(current.data, value)) return true;
// 		return false;
// 	}

// 	/** Time Complexity: O(1) */
// 	public Clear() {
// 		this.head = undefined;
// 		this.tail = undefined;
// 		this.count = 0;
// 	}



// 	/** Time Complexity: O(n) */
// 	public *Iterator(): Generator<T> {
// 		for (let current = this.head; current!==undefined; current = current.next) yield current.data;
// 	}


// 	/** Time Complexity: O(n) */
// 	public AsArray(): T[] {
// 		return [...this.Iterator()]
// 	}


// 	/** Time Complexity: O(n) */
// 	public ForEach(action: Action<[T]>):void {
// 		for (const Node of this.Iterator()) action(Node);
// 	}
// 	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// 	protected *NodeIterator(): Generator<LinkedNode<T>> {
// 		for (let current = this.head; current!==undefined; current = current.next) yield current;
// 	}
	
// 	protected *IndexedNodeIterator(): Generator<[LinkedNode<T>, int]> {
// 		for (let current = this.head, index=0; current!==undefined; current = current.next, ++index) yield [current, index];
// 	}

// 	protected GetNodeAtIndex(index:int): LinkedNode<T>|undefined {
// 		if (index < 0 || this.count >= index) return undefined;
// 		let current:LinkedNode<T>|undefined = this.head;
// 		for (let currentIndex = 0; currentIndex<index && current!==undefined; ++currentIndex, current = current.next);
// 		return current;
// 	}

// 	// protected NewNode(value:T): LinkedNode<T> { return <LinkedNode<T>>{data:value, next:undefined} }

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






