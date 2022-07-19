





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