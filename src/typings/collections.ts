





// interface IStack<T> {
// 	readonly length: number;
// 	push(item: T): void;
// 	pop(): T | undefined;
// 	peek(): T | undefined;
// }













// class Queue<T> {
// 	private data: Array<T>;
// 	private head:number;
// 	private tail:number;
// 	private length:number;

// 	public constructor () {
// 		this.data = []
// 		this.head = 0
// 		this.tail = 0
// 		this.length = 0
// 	}

// 	public enqueue(value : T) {
// 		this.data[this.tail++] = value;
// 		this.length++;
// 	}
// 	public dequeue () {
// 		let value;
// 		if (this.length > 0) {
// 			this.length--;
// 			value = this.data[this.head];
// 			delete this.data[this.head++]
// 		} else {
// 			this.head = 0
// 			this.tail = 0
// 			value = null
// 		}
// 		return value;
// 	}
// 	public refactor () {
// 		if (this.head > 0) {
// 			for (let i = this.head; i < this.tail; i++) {
// 				this.data[i - this.head] = this.data[i]
// 				delete this.data[i]
// 			}
// 			this.tail = this.length
// 			this.head = 0
// 		}
// 	}
// }





// class Stack<T> implements IStack<T> {
// 	private data: Array<T>;
// 	public get length() { return this.data.length; }
// 	public get Empty() { return this.length <= 0; }

// 	public constructor () {
// 		this.data = []
// 	}

// 	public push(value : T) {
// 		this.data.push(value);
// 	}
// 	public pop() {
// 		return this.data.pop();
// 	}

// 	public peek() {
// 		return this.data[this.length-1];
// 	}
// }



type Callback<V,K> = (value: V, key: K, map: Map<K, V>) => void;

interface IUpdatingMap<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: Callback<V,K>, thisArg?: any): void;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    readonly size: number;
}




class UpdatingMap<K,V> implements IUpdatingMap<K,V> {
	private internalMap = new Map<K,V>();
	private transferMap = new Map<K,V>();
	private SwapMaps() {
		const tempMap = this.transferMap;
		this.transferMap = this.internalMap;
		this.internalMap = tempMap;
	}


	public update(newKeyList : K[]) {
		for (const Key of newKeyList) {
			if (this.internalMap.has(Key)) {
				const Val = this.internalMap.get(Key);
				if (Val) this.transferMap.set(Key, Val);
			}
		}
		this.SwapMaps();
		this.transferMap.clear();
	}

	public has(Key:K) { return this.internalMap.has(Key); }
	public get(Key:K) { return this.internalMap.get(Key); }
	public set(Key:K, Val:V) { this.internalMap.set(Key,Val); return this; }
	public delete(Key:K) { return this.internalMap.delete(Key); }
	public get size() { return this.internalMap.size; }

	


	public keys() { return this.internalMap.keys(); }
	public values() { return this.internalMap.values(); }
	public entries() { return this.internalMap.entries(); }
	public clear() { return this.internalMap.clear(); }
	
	public forEach(callbackfn: Callback<V,K>, thisArg?: any): void {
		return this.internalMap.forEach(callbackfn, thisArg);
	}

    /** Returns an iterable of entries in the map. */
    *[Symbol.iterator](): IterableIterator<[K, V]> {
		for (const Item of this.internalMap) yield Item;
	}

	public toMap() { return this.internalMap; }
}