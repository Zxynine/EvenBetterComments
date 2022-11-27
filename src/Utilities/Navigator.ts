


export interface INavigator<T> {
	current(): T | null;
	previous(): T | null;
	first(): T | null;
	last(): T | null;
	next(): T | null;
}



export abstract class AbstactNavigator {
	public get position(): int { return this.index; }
	public get bounded(): bool { return (this.index < this.start && this.stop <= this.index); }

	public constructor(
		protected start: int, 
		protected stop: int,
		protected index: int
	) {}

	protected _Update_(start: int, stop:int, index:int) {
		this.start = start; 
		this.stop = stop; 
		this.index = index;
	}

	protected _ShiftLatter_() { this.index = (this.index < this.stop)? this.index+1 : this.stop; }
	protected _ShiftFormer_() { this.index = (this.index >= this.start)? this.index-1 : this.start; }
	protected _ShiftFirst_() { this.index = this.start; }
	protected _ShiftLast_() { this.index = this.stop-1; }
	protected _ShiftTo_(index:int) { this.index = this.ClampIndex(index, false); }
	protected _ShiftBy_(delta:int) { this.index = this.ClampIndex(this.index+delta, false); }

	public ClampIndex(index:int, clampToValid:bool = true) { return (
		(index >= this.stop)? (clampToValid? this.stop-1 : this.stop) :
		(index < this.start)? (clampToValid? this.start : this.start-1) :
		index
	)}
}


export abstract class AbstractArrayNavigator<T> extends AbstactNavigator implements INavigator<T> {
	
	public abstract current(): T|null;
	
	public previous(): T|null { this._ShiftFormer_(); return this.current(); }
	public first(): T|null { this._ShiftFirst_(); return this.current(); }
	public next(): T|null { this._ShiftLatter_(); return this.current(); }
	public last(): T|null { this._ShiftLast_(); return this.current(); }
}



export class ArrayNavigator<T> extends AbstractArrayNavigator<T> {
	public constructor(items: readonly T[]);
	public constructor(items: readonly T[], start:int, end:int, index:int);
	public constructor(private readonly items: readonly T[],
		start: int = 0, 
		stop: int = items.length, 
		index: int = start-1
	) { super (start, stop, index) }

	public current(): T|null { return (this.bounded? this.items[this.index] : null); }
}





export class MutableArrayNavigator<T> extends AbstractArrayNavigator<T> {
	public constructor(items: readonly T[]);
	public constructor(items: readonly T[], start:int, end:int, index:int);
	public constructor(private items: readonly T[],
		start: int = 0, 
		stop: int = items.length, 
		index: int = start-1
	) { super(start, stop, index) }

	public update(items: readonly T[]) : void;
	public update(items: readonly T[], start:int, end:int, index:int) : void;
	public update(items: readonly T[], start: int = 0, end:int = items.length, index = start-1) {
		this._Update_(start, this.stop, index);
		this.items = items;
	}

	public clear(): void { this.update([], 0, 0, 0); }
	public current(): T | null { return (this.bounded? this.items[this.index] : null); }
}







export class HistoryNavigator<T> extends AbstactNavigator implements INavigator<T> {
	private readonly _limit: number;

	private _history!: Set<T>;
	private _items!: readonly T[];

	public get count() { return this._history.size; }

	public constructor();
	public constructor(history: readonly T[], limit: number);
	public constructor(history: readonly T[] = [], limit: number = 10) {
		super(0, 0, 0);
		this._limit = limit;
		this._updateHistory(history);
		this._onChange();
	}

	public getHistory(): T[] { return [...this._history]; }

	public add(t: T) {
		this._history.delete(t); //Cycles old record to front if already existed.
		this._history.add(t);
		this._onChange();
	}

	// public next(): T | null {
	// 	if (this._currentPosition() !== this._elements.length - 1) {
	// 		return this._navigator.next();
	// 	}
	// 	return null;
	// }

	// public previous(): T | null {
	// 	if (this._currentPosition() !== 0) {
	// 		return this._navigator.previous();
	// 	}
	// 	return null;
	// }

	public next(): T|null { this._ShiftLatter_(); return this.current(); }
	public previous(): T|null { this._ShiftFormer_(); return this.current(); }
	public current(): T|null { return (this.bounded? this._items[this.index] : null); }
	public first(): T|null { this._ShiftFirst_(); return this.current(); }
	public last(): T|null { this._ShiftLast_(); return this.current(); }
	
	public has(t: T): boolean { return this._history.has(t); }


	public clear(): void {
		this._history = new Set();
		this._items = [];
		this._Update_(0, 0, 0);
	}

	private _onChange() {
		((this._history.size > this._limit)
			? this._updateHistory([...this._history].slice(-this._limit))
			: this._Update_(0, this._history.size, this._history.size)
		);
	}


	private _updateHistory(history: readonly T[]): void {
		this._history = new Set(history);
		this._items = [...this._history];
		this._Update_(0, this._history.size, this._history.size);
	}
}






// interface HistoryNode<T> {
// 	value: T;
// 	previous: HistoryNode<T> | undefined;
// 	next: HistoryNode<T> | undefined;
// }



// export class HistoryNavigator2<T> {

// 	private head: HistoryNode<T>;
// 	private tail: HistoryNode<T>;
// 	private cursor: HistoryNode<T>;
// 	private size: number;

// 	public constructor(history: readonly T[], private capacity: number = 10) {
// 		if (history.length < 1) throw new Error('not supported');

// 		this.size = 1;
// 		this.head = this.tail = this.cursor = <HistoryNode<T>>{
// 			value: history[0],
// 			previous: undefined,
// 			next: undefined
// 		};

// 		for (let i = 1; i < history.length; i++) {
// 			this.add(history[i]);
// 		}
// 	}

// 	public add(value: T): void {
// 		const node  = <HistoryNode<T>>{
// 			value,
// 			previous: this.tail,
// 			next: undefined
// 		};

// 		this.tail.next = node;
// 		this.tail = node;
// 		this.cursor = this.tail;
// 		this.size++;

// 		while (this.size > this.capacity) {
// 			this.head = this.head.next!;
// 			this.head.previous = undefined;
// 			this.size--;
// 		}
// 	}

// 	/**
// 	 * @returns old last value
// 	 */
// 	public replaceLast(value: T): T {
// 		const oldValue = this.tail.value;
// 		this.tail.value = value;
// 		return oldValue;
// 	}

// 	public isAtEnd(): boolean {
// 		return this.cursor === this.tail;
// 	}

// 	public current(): T {
// 		return this.cursor.value;
// 	}

// 	public previous(): T {
// 		if (this.cursor.previous) this.cursor = this.cursor.previous;
// 		return this.cursor.value;
// 	}

// 	public next(): T {
// 		if (this.cursor.next) this.cursor = this.cursor.next;
// 		return this.cursor.value;
// 	}

// 	public has(t: T): boolean {
// 		for (let current: HistoryNode<T>|undefined = this.head; current; current = current.next) {
// 			if (current.value === t) return true;
// 		}
// 		return false;
// 	}

// 	public resetCursor(): T {
// 		this.cursor = this.tail;
// 		return this.cursor.value;
// 	}

// 	public *[Symbol.iterator](): Iterator<T> {
// 		for (let node: HistoryNode<T> | undefined = this.head; node; node = node.next) {
// 			yield node.value;
// 		}
// 	}
// }


























// export class HistoryNavigator<T> implements INavigator<T> {

// 	private _history!: Set<T>;
// 	private _limit: number;
// 	private _navigator!: MutableArrayNavigator<T>;

// 	constructor(history: readonly T[] = [], limit: number = 10) {
// 		this._initialize(history);
// 		this._limit = limit;
// 		this._onChange();
// 	}

// 	public getHistory(): T[] {
// 		return this._elements;
// 	}

// 	public add(t: T) {
// 		this._history.delete(t);
// 		this._history.add(t);
// 		this._onChange();
// 	}

// 	public next(): T | null {
// 		if (this._currentPosition() !== this._elements.length - 1) {
// 			return this._navigator.next();
// 		}
// 		return null;
// 	}

// 	public previous(): T | null {
// 		if (this._currentPosition() !== 0) {
// 			return this._navigator.previous();
// 		}
// 		return null;
// 	}

// 	public current(): T | null {
// 		return this._navigator.current();
// 	}

// 	public first(): T | null {
// 		return this._navigator.first();
// 	}

// 	public last(): T | null {
// 		return this._navigator.last();
// 	}

// 	public has(t: T): boolean {
// 		return this._history.has(t);
// 	}

// 	public clear(): void {
// 		this._initialize([]);
// 		this._onChange();
// 	}

// 	private _onChange() {
// 		this._reduceToLimit();
// 		const elements = this._elements;
// 		this._navigator.update(elements, 0, elements.length, elements.length);
// 	}

// 	private _reduceToLimit() {
// 		const data = this._elements;
// 		if (data.length > this._limit) {
// 			this._initialize(data.slice(data.length - this._limit));
// 		}
// 	}

// 	private _currentPosition(): number {
// 		return this._navigator.position;
// 	}

// 	private _initialize(history: readonly T[]): void {
// 		this._history = new Set(history);
// 		const elements = this._elements;
// 		this._navigator = new MutableArrayNavigator(elements, 0, elements.length, elements.length);
// 	}

// 	private get _elements(): T[] {
// 		return [...this._history];
// 	}
// }
