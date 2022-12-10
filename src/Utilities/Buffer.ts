import { Disposable, Event } from "vscode";
import { TextDecoder, TextEncoder } from "util";

export interface IDisposable {
	dispose(): void;
}





/**
 * Manages a collection of disposable values.
 *
 * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
 * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
 * store that has already been disposed of.
 */
export class DisposableStore extends Disposable {
	static DISABLE_DISPOSED_WARNING = false;

	/** @return `true` if this object has been disposed of. **/
	public get isDisposed(): boolean {return this._isDisposed;}
	private _isDisposed = false;

	private readonly _toDispose = new Set<IDisposable>();

	public constructor() { super(()=> (this._toDispose.size !== 0)&& Disposable.from(...this._toDispose).dispose()); }


	/**
	 * Dispose of all registered disposables and mark this object as disposed.
	 * Any future disposables added to this object will be disposed of on `add`.
	 */
	public dispose(): void {
		if (this._isDisposed) return;
		this._isDisposed = true;
		super.dispose();
		this.clear();
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



export class DisposableArray implements Disposable {
	private disposables = new Array<Disposable>();
  
	public dispose() {
	  this.disposables.forEach((d) => d.dispose());
	  this.disposables = [];
	}
  
	public push(disposable: Disposable) {
	  this.disposables.push(disposable);
	}
  }


export function using<T extends Disposable>(resource: T, func: (resource: T) => void) {
	try { func(resource); } 
	finally { resource.dispose(); }
}




export function dispose<T extends Disposable>(disposables: T[]): T[] {
	disposables.forEach(d => d.dispose());
	return [];
}

export function toDisposable(dispose: () => void): Disposable { return { dispose } }

export function combinedDisposable(disposables: Disposable[]): Disposable {
	return toDisposable(() => dispose(disposables));
}


export const EmptyDisposable = toDisposable(() => null);




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













export function fireEvent<T>(event: Event<T>): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => event(_ => (listener as any).call(thisArgs), null, disposables);
}

export function mapEvent<I, O>(event: Event<I>, map: (i: I) => O): Event<O> {
	return (listener: (e: O) => any, thisArgs?: any, disposables?: Disposable[]) => event(i => listener.call(thisArgs, map(i)), null, disposables);
}

export function filterEvent<T>(event: Event<T>, filter: (e: T) => boolean): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables);
}

export function anyEvent<T>(...events: Event<T>[]): Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]) => {
		const result = combinedDisposable(events.map(event => event(i => listener.call(thisArgs, i))));
		if (disposables) disposables.push(result);
		return result;
	};
}


export function eventToPromise<T>(event: Event<T>): Promise<T> {
	return new Promise<T>(c => onceEvent(event)(c));
}





export function onceEvent<T>(event: Event<T>): Event<T> {
	return (listener, thisArgs = null, disposables?) => {
		const result = event(e => {
			result.dispose();
			return listener.call(thisArgs, e);
		}, null, disposables);
		return result;
	};
}


















declare const Buffer: any;

const hasBuffer = (typeof Buffer !== 'undefined');

let textEncoder: TextEncoder | null;
let textDecoder: TextDecoder | null;

export class VSBuffer {

	/**
	 * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
	 * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
	 */
	static alloc(byteLength: number): VSBuffer {
		return new VSBuffer(hasBuffer?  Buffer.allocUnsafe(byteLength) : new Uint8Array(byteLength));
	}

	/**
	 * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
	 * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
	 * which is not transferrable.
	 */
	static wrap(actual: Uint8Array): VSBuffer {
		return new VSBuffer((hasBuffer && !(Buffer.isBuffer(actual)))
			// https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
			// Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
			? Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength) 
			: actual
		);
	}

	/**
	 * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
	 * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
	 */
	static fromString(source: string, options?: { dontUseNodeBuffer?: boolean }): VSBuffer {
		const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
		return new VSBuffer((!dontUseNodeBuffer && hasBuffer)
			? Buffer.from(source)
			: (textEncoder ??= new TextEncoder()).encode(source)
		);
	}

	/**
	 * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
	 * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
	 */
	static fromByteArray(source: number[]): VSBuffer {
		const result = VSBuffer.alloc(source.length);
		for (let i = 0, len = source.length; i < len; i++) result.buffer[i] = source[i];
		return result;
	}

	/**
	 * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
	 * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
	 */
	static concat(buffers: VSBuffer[], totalLength?: number): VSBuffer {
		if (totalLength === undefined) {
			totalLength = 0;
			for (let i = 0, len = buffers.length; i < len; i++) {
				totalLength += buffers[i].byteLength;
			}
		}

		const ret = VSBuffer.alloc(totalLength);
		for (let i = 0, offset = 0, len = buffers.length; i < len; i++) {
			const element = buffers[i];
			ret.set(element, offset);
			offset += element.byteLength;
		}

		return ret;
	}

	readonly buffer: Uint8Array;
	readonly byteLength: number;

	private constructor(buffer: Uint8Array) {
		this.buffer = buffer;
		this.byteLength = this.buffer.byteLength;
	}

	/**
	 * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
	 * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
	 */
	clone(): VSBuffer {
		const result = VSBuffer.alloc(this.byteLength);
		result.set(this);
		return result;
	}

	toString(): string { return ((hasBuffer)
			? this.buffer.toString()
			: (textDecoder ??= new TextDecoder()).decode(this.buffer)
		);
	}

	slice(start?: number, end?: number): VSBuffer {
		// IMPORTANT: use subarray instead of slice because TypedArray#slice
		// creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
		// ensures the same, performance, behaviour.
		return new VSBuffer(this.buffer.subarray(start, end));
	}

	set(array: VSBuffer, offset?: number): void;
	set(array: Uint8Array, offset?: number): void;
	set(array: ArrayBuffer, offset?: number): void;
	set(array: ArrayBufferView, offset?: number): void;
	set(array: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void;
	set(array: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void {
		this.buffer.set(
			(array instanceof VSBuffer)? array.buffer :
			(array instanceof Uint8Array)? array :
			(array instanceof ArrayBuffer)? new Uint8Array(array) :
			(ArrayBuffer.isView(array))? new Uint8Array(array.buffer, array.byteOffset, array.byteLength)
		: array, offset);
	}

	readUInt32BE(offset: number): number { return readUInt32BE(this.buffer, offset); }
	writeUInt32BE(value: number, offset: number): void { writeUInt32BE(this.buffer, value, offset); }

	readUInt32LE(offset: number): number { return readUInt32LE(this.buffer, offset); }
	writeUInt32LE(value: number, offset: number): void { writeUInt32LE(this.buffer, value, offset); }

	readUInt8(offset: number): number { return readUInt8(this.buffer, offset); }
	writeUInt8(value: number, offset: number): void { writeUInt8(this.buffer, value, offset); }
}

export function readUInt16LE(source: Uint8Array, offset: number): number {
	return (
		((source[offset + 0] << 0) >>> 0) |
		((source[offset + 1] << 8) >>> 0)
	);
}

export function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void {
	destination[offset + 0] = ((value>>>0) & 0b11111111);
	destination[offset + 1] = ((value>>>8) & 0b11111111);
}

export function readUInt32BE(source: Uint8Array, offset: number): number {
	return (
		source[offset] * 2 ** 24
		+ source[offset + 1] * 2 ** 16
		+ source[offset + 2] * 2 ** 8
		+ source[offset + 3]
	);
}

export function writeUInt32BE(destination: Uint8Array, value: number, offset: number): void {
	destination[offset + 3] = (value >>>= 0);
	destination[offset + 2] = (value >>>= 8);
	destination[offset + 1] = (value >>>= 8);
	destination[offset + 0] = (value >>>= 8);
}

export function readUInt32LE(source: Uint8Array, offset: number): number {
	return (
		((source[offset + 0] <<  0) >>> 0) |
		((source[offset + 1] <<  8) >>> 0) |
		((source[offset + 2] << 16) >>> 0) |
		((source[offset + 3] << 24) >>> 0)
	);
}

export function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void {
	destination[offset + 0] = ((value >>>= 0) & 0b11111111);
	destination[offset + 1] = ((value >>>= 8) & 0b11111111);
	destination[offset + 2] = ((value >>>= 8) & 0b11111111);
	destination[offset + 3] = ((value >>>= 8) & 0b11111111);
}

export function readUInt8(source: Uint8Array, offset: number): number { return source[offset]; }
export function writeUInt8(destination: Uint8Array, value: number, offset: number): void { destination[offset] = value; }

export interface VSBufferReadable extends Stream.Readable<VSBuffer> { }
export interface VSBufferReadableStream extends Stream.ReadableStream<VSBuffer> { }
export interface VSBufferWriteableStream extends Stream.WriteableStream<VSBuffer> { }
export interface VSBufferReadableBufferedStream extends Stream.ReadableBufferedStream<VSBuffer> { }

export function readableToBuffer(readable: VSBufferReadable): VSBuffer { return Stream.consumeReadable<VSBuffer>(readable, VSBuffer.concat); }
export function bufferToReadable(buffer: VSBuffer): VSBufferReadable { return Stream.toReadable<VSBuffer>(buffer); }

export function streamToBuffer(stream: Stream.ReadableStream<VSBuffer>): Promise<VSBuffer> {
	return Stream.consumeStream<VSBuffer>(stream, VSBuffer.concat);
}

export async function bufferedStreamToBuffer(bufferedStream: Stream.ReadableBufferedStream<VSBuffer>): Promise<VSBuffer> {
	return VSBuffer.concat((bufferedStream.ended)
		? bufferedStream.buffer
		: [ // Include already read chunks...
			...bufferedStream.buffer,
			// ...and all additional chunks
			await streamToBuffer(bufferedStream.stream)
		]
	);
}

export function bufferToStream(buffer: VSBuffer): Stream.ReadableStream<VSBuffer> {
	return Stream.toStream<VSBuffer>(buffer, VSBuffer.concat);
}

export function streamToBufferReadableStream(stream: Stream.ReadableStreamEvents<Uint8Array | string>): Stream.ReadableStream<VSBuffer> {
	return Stream.transform<Uint8Array | string, VSBuffer>(stream, { data: data => typeof data === 'string' ? VSBuffer.fromString(data) : VSBuffer.wrap(data) }, VSBuffer.concat);
}

export function newWriteableBufferStream(options?: Stream.WriteableStreamOptions): Stream.WriteableStream<VSBuffer> {
	return Stream.newWriteableStream<VSBuffer>(VSBuffer.concat, options);
}

export function prefixedBufferReadable(prefix: VSBuffer, readable: VSBufferReadable): VSBufferReadable { return Stream.prefixedReadable(prefix, readable, VSBuffer.concat); }
export function prefixedBufferStream(prefix: VSBuffer, stream: VSBufferReadableStream): VSBufferReadableStream { return Stream.prefixedStream(prefix, stream, VSBuffer.concat); }

/** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
export function decodeBase64(encoded: string) {
	let building = 0;
	let remainder = 0;
	let bufi = 0;

	// The simpler way to do this is `Uint8Array.from(atob(str), c => c.charCodeAt(0))`,
	// but that's about 10-20x slower than this function in current Chromium versions.

	const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
	const append = (value: number) => {
		switch (remainder) {
			case 3:
				buffer[bufi++] = building | (value >>> 0);
				remainder = 0;
				break;
			case 2:
				buffer[bufi++] = building | (value >>> 2);
				building = value << 6;
				remainder = 3;
				break;
			case 1:
				buffer[bufi++] = building | (value >>> 4);
				building = value << 4;
				remainder = 2;
				break;
			default:
				building = value << 2;
				remainder = 1;
				break;
		}
	};

	for (let i = 0; i < encoded.length; i++) {
		const code = encoded.charCodeAt(i);
		// See https://datatracker.ietf.org/doc/html/rfc4648#section-4
		// This branchy code is about 3x faster than an indexOf on a base64 char string.
		if (code === CharCode.Equals) break; // "="
		else if (CharCode.A      <= code && code <=      CharCode.Z)      append(code - 65); // A-Z starts ranges from char code 65 to 90
		else if (CharCode.a      <= code && code <=      CharCode.z)      append(code - 97 + 26); // a-z starts ranges from char code 97 to 122, starting at byte 26
		else if (CharCode.Digit0 <= code && code <= CharCode.Digit9)      append(code - 48 + 52); // 0-9 starts ranges from char code 48 to 58, starting at byte 52
		else if (code === CharCode.Plus  || code ===     CharCode.Minus)  append(62); // "+" or "-" for URLS
		else if (code === CharCode.Slash || code === CharCode.Underline)  append(63); // "/" or "_" for URLS
		else throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
	}

	const unpadded = bufi;
	while (remainder > 0) append(0);

	// slice is needed to account for overestimation due to padding
	return VSBuffer.wrap(buffer).slice(0, unpadded);
}

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64UrlSafeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Encodes a buffer to a base64 string. */
export function encodeBase64({ buffer }: VSBuffer, padded = true, urlSafe = false) {
	const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
	let output = '';

	const remainder = buffer.byteLength % 3;

	let i = 0;
	for (; i < buffer.byteLength - remainder; i += 3) {
		const a = buffer[i + 0];
		const b = buffer[i + 1];
		const c = buffer[i + 2];

		output += dictionary[a >>> 2];
		output += dictionary[(a << 4 | b >>> 4) & 0b111111];
		output += dictionary[(b << 2 | c >>> 6) & 0b111111];
		output += dictionary[c & 0b111111];
	}

	if (remainder === 1) {
		const a = buffer[i + 0];
		output += dictionary[a >>> 2];
		output += dictionary[(a << 4) & 0b111111];
		if (padded) output += '==';
	} else if (remainder === 2) {
		const a = buffer[i + 0];
		const b = buffer[i + 1];
		output += dictionary[a >>> 2];
		output += dictionary[(a << 4 | b >>> 4) & 0b111111];
		output += dictionary[(b << 2) & 0b111111];
		if (padded) output += '=';
	}

	return output;
}










































export namespace Stream {
	
	/** The payload that flows in readable stream events. **/
	export type ReadableStreamEventPayload<T> = T | Error | 'end';

		
	/**
	 * A interface that emulates the API shape of a node.js readable
	 * for use in native and web environments.
	 */
	export interface Readable<T> {
		/**
		 * Read data from the underlying source. Will return null to indicate that no more data can be read.
		 */
		read(): T | null;
	}

	export interface ReadableStreamEvents<T> {

		/**
		 * The 'data' event is emitted whenever the stream is
		 * relinquishing ownership of a chunk of data to a consumer.
		 *
		 * NOTE: ADDING A DATA LISTENER CAN TURN THE STREAM INTO FLOWING MODE. 
		 * IT IS THEREFORE THE LAST LISTENER THAT SHOULD BE ADDED AND NOT THE FIRST
		 *
		 * Use `listenStream` as a helper method to listen to stream events in the right order.
		 */
		on(event: 'data', callback: (data: T) => void): void;
		/** Emitted when any error occurs. **/
		on(event: 'error', callback: (err: Error) => void): void;

		/**
		 * The 'end' event is emitted when there is no more data to be consumed from the stream. 
		 * It will not be emitted unless the data is completely consumed.
		 */
		on(event: 'end', callback: () => void): void;
	}

	/**
	 * A interface that emulates the API shape of a node.js readable
	 * stream for use in native and web environments.
	 */
	export interface ReadableStream<T> extends ReadableStreamEvents<T> {
		/** Stops emitting any events until resume() is called. **/
		pause(): void;
		/** Starts emitting events again after pause() was called. **/
		resume(): void;
		/** Destroys the stream and stops emitting any event. **/
		destroy(): void;
		/** Allows to remove a listener that was previously added. **/
		removeListener(event: string, callback: Function): void;
	}


		
	/**
	 * A stream that has a buffer already read. Returns the original stream
	 * that was read as well as the chunks that got read.
	 *
	 * The `ended` flag indicates if the stream has been fully consumed.
	 */
	export interface ReadableBufferedStream<T> {
		/** The original stream that is being read. **/
		stream: ReadableStream<T>;
		/** An array of chunks already read from this stream. **/
		buffer: T[];

		/**
		 * Signals if the stream has ended or not. If not, consumers
		 * should continue to read from the stream until consumed.
		 */
		ended: boolean;
	}

	export function isReadable<T>(obj: unknown): obj is Readable<T> {
		const candidate = obj as Readable<T> | undefined;
		return (candidate)? typeof candidate.read === 'function' : false;
	}

	export function isReadableStream<T>(obj: unknown): obj is ReadableStream<T> {
		const candidate = obj as ReadableStream<T> | undefined;
		return (candidate)? [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function') : false;
	}
	
	export function isReadableBufferedStream<T>(obj: unknown): obj is ReadableBufferedStream<T> {
		const candidate = obj as ReadableBufferedStream<T> | undefined;
		return (candidate)? (isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean') : false;
	}
	
	/**
	 * A interface that emulates the API shape of a node.js writeable
	 * stream for use in native and web environments.
	 */
	export interface WriteableStream<T> extends ReadableStream<T> {

		/**
		 * Writing data to the stream will trigger the on('data')
		 * event listener if the stream is flowing and buffer the
		 * data otherwise until the stream is flowing.
		 *
		 * If a `highWaterMark` is configured and writing to the
		 * stream reaches this mark, a promise will be returned
		 * that should be awaited on before writing more data.
		 * Otherwise there is a risk of buffering a large number
		 * of data chunks without consumer.
		 */
		write(data: T): void | Promise<void>;

		/**
		 * Signals an error to the consumer of the stream via the
		 * on('error') handler if the stream is flowing.
		 *
		 * NOTE: call `end` to signal that the stream has ended,
		 * this DOES NOT happen automatically from `error`.
		 */
		error(error: Error): void;

		/**
		 * Signals the end of the stream to the consumer. If the
		 * result is provided, will trigger the on('data') event
		 * listener if the stream is flowing and buffer the data
		 * otherwise until the stream is flowing.
		 */
		end(result?: T): void;
	}


	export interface WriteableStreamOptions {
		/**
		 * The number of objects to buffer before WriteableStream#write()
		 * signals back that the buffer is full. Can be used to reduce
		 * the memory pressure when the stream is not flowing.
		 */
		highWaterMark?: number;
	}
	

	export function newWriteableStream<T>(reducer: IReducer<T>, options?: WriteableStreamOptions): WriteableStream<T> {
		return new WriteableStreamImpl<T>(reducer, options);
	}


	class WriteableStreamImpl<T> implements WriteableStream<T> {

		private readonly state = {
			flowing: false,
			ended: false,
			destroyed: false
		};
	
		private readonly buffer = {
			data: [] as T[],
			error: [] as Error[]
		};
	
		private readonly listeners = {
			data: [] as { (data: T): void }[],
			error: [] as { (error: Error): void }[],
			end: [] as { (): void }[]
		};
	
		private readonly pendingWritePromises: Function[] = [];
	
		public constructor(private reducer: IReducer<T>, private options?: WriteableStreamOptions) { }
	
		public pause(): void {
			if (this.state.destroyed) return;
			this.state.flowing = false;
		}
	
		public resume(): void {
			if (this.state.destroyed) return;
			if (!this.state.flowing) {
				this.state.flowing = true;
	
				// emit buffered events
				this.flowData();
				this.flowErrors();
				this.flowEnd();
			}
		}
	
		public write(data: T): void | Promise<void> {
			if (this.state.destroyed) return;
	
			// flowing: directly send the data to listeners
			if (this.state.flowing) this.emitData(data);
			// not yet flowing: buffer data until flowing
			else {
				this.buffer.data.push(data);
	
				// highWaterMark: if configured, signal back when buffer reached limits
				if (typeof this.options?.highWaterMark === 'number' && this.buffer.data.length > this.options.highWaterMark) {
					return new Promise(resolve => this.pendingWritePromises.push(resolve));
				}
			}
		}
	
		public error(error: Error): void {
			if (this.state.destroyed) return;
	
			// flowing: directly send the error to listeners
			if (this.state.flowing) this.emitError(error);
			// not yet flowing: buffer errors until flowing
			else this.buffer.error.push(error);
		}
	
		public end(result?: T): void {
			if (this.state.destroyed) return;
	
			// end with data if provided
			if (typeof result !== 'undefined') this.write(result);
	
			// flowing: send end event to listeners
			if (this.state.flowing) {
				this.emitEnd();
				this.destroy();
			// not yet flowing: remember state
			} else this.state.ended = true;
		}
	
		private emitData(data: T): void {
			this.listeners.data.slice(0).forEach(listener => listener(data)); // slice to avoid listener mutation from delivering event
		}
	
		private emitError(error: Error): void {
			if (this.listeners.error.length === 0) throw error; // nobody listened to this error
			else this.listeners.error.slice(0).forEach(listener => listener(error)); // slice to avoid listener mutation from delivering event
		}
	
		private emitEnd(): void {
			this.listeners.end.slice(0).forEach(listener => listener()); // slice to avoid listener mutation from delivering event
		}
	
		on(event: 'data', callback: (data: T) => void): void;
		on(event: 'error', callback: (err: Error) => void): void;
		on(event: 'end', callback: () => void): void;
		on(event: 'data' | 'error' | 'end', callback: (arg0?: any) => void): void {
			if (this.state.destroyed) return;
	
			switch (event) {
				case 'data':
					this.listeners.data.push(callback);
	
					// switch into flowing mode as soon as the first 'data'
					// listener is added and we are not yet in flowing mode
					this.resume();
	
					break;
				case 'end':
					this.listeners.end.push(callback);
	
					// emit 'end' event directly if we are flowing
					// and the end has already been reached
					//
					// finish() when it went through
					if (this.state.flowing && this.flowEnd()) this.destroy();
	
					break;
				case 'error':
					this.listeners.error.push(callback);
	
					// emit buffered 'error' events unless done already
					// now that we know that we have at least one listener
					if (this.state.flowing) this.flowErrors();
	
					break;
			}
		}
	
		removeListener(event: string, callback: Function): void {
			if (this.state.destroyed) return;
	
			let listeners: unknown[] | undefined = undefined;
	
			switch (event) {
				case 'data': listeners = this.listeners.data; break;
				case 'end': listeners = this.listeners.end; break;
				case 'error': listeners = this.listeners.error; break;
			}
	
			if (listeners) {
				const index = listeners.indexOf(callback);
				if (index >= 0) listeners.splice(index, 1);
			}
		}
	
		private flowData(): void {
			if (this.buffer.data.length > 0) {
				const fullDataBuffer = this.reducer(this.buffer.data);
	
				this.emitData(fullDataBuffer);
	
				this.buffer.data.length = 0;
	
				// When the buffer is empty, resolve all pending writers
				const pendingWritePromises = [...this.pendingWritePromises];
				this.pendingWritePromises.length = 0;
				pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
			}
		}
	
		private flowErrors(): void {
			if (this.listeners.error.length > 0) {
				for (const error of this.buffer.error) this.emitError(error);
				this.buffer.error.length = 0;
			}
		}
	
		private flowEnd(): boolean {
			if (this.state.ended) {
				this.emitEnd();
				return this.listeners.end.length > 0;
			} else return false;
		}
	
		destroy(): void {
			if (!this.state.destroyed) {
				this.state.destroyed = true;
				this.state.ended = true;
	
				this.buffer.data.length = 0;
				this.buffer.error.length = 0;
	
				this.listeners.data.length = 0;
				this.listeners.error.length = 0;
				this.listeners.end.length = 0;
	
				this.pendingWritePromises.length = 0;
			}
		}
	}
	













	export interface IReducer<T, R = T> {(data: T[]): R;}
	export interface IDataTransformer<Original, Transformed> {(data: Original): Transformed;}
	export interface IErrorTransformer {(error: Error): Error;}
	export interface ITransformer<Original, Transformed> {
		data: IDataTransformer<Original, Transformed>;
		error?: IErrorTransformer;
	}

	/** Helper to fully read a T readable into a T. **/
	export function consumeReadable<T>(readable: Readable<T>, reducer: IReducer<T>): T {
		const chunks: T[] = [];
		for (let chunk=readable.read(); chunk !== null; chunk = readable.read()) chunks.push(chunk);
		return reducer(chunks);
	}

	/**
	 * Helper to read a T readable up to a maximum of chunks. If the limit is
	 * reached, will return a readable instead to ensure all data can still
	 * be read.
	 */
	export function peekReadable<T>(readable: Readable<T>, reducer: IReducer<T>, maxChunks: number): T | Readable<T> {
		const chunks: T[] = [];

		let chunk: T | null | undefined = undefined;
		while ((chunk = readable.read()) !== null && chunks.length < maxChunks) chunks.push(chunk);

		// If the last chunk is null, it means we reached the end of
		// the readable and return all the data at once
		if (chunk === null && chunks.length > 0) return reducer(chunks);
		// Otherwise, we still have a chunk, it means we reached the maxChunks
		// value and as such we return a new Readable that first returns
		// the existing read chunks and then continues with reading from
		// the underlying readable.
		else return { read: () => {
				// First consume chunks from our array
				if (chunks.length > 0) return chunks.shift()!;
				// Then ensure to return our last read chunk
				if (typeof chunk !== 'undefined') {
					const lastReadChunk = chunk;

					// explicitly use undefined here to indicate that we consumed
					// the chunk, which could have either been null or valued.
					chunk = undefined;

					return lastReadChunk;
				}

				// Finally delegate back to the Readable
				return readable.read();
		}};
	}

	/**
	 * Helper to fully read a T stream into a T or consuming
	 * a stream fully, awaiting all the events without caring
	 * about the data.
	 */
	export function consumeStream<T, R = T>(stream: ReadableStreamEvents<T>, reducer: IReducer<T, R>): Promise<R>;
	export function consumeStream(stream: ReadableStreamEvents<unknown>): Promise<undefined>;
	export function consumeStream<T, R = T>(stream: ReadableStreamEvents<T>, reducer?: IReducer<T, R>): Promise<R | undefined> {
		return new Promise((resolve, reject) => {
			const chunks: T[] = [];

			listenStream(stream, {
				onData:  (chunk) => (reducer)&& chunks.push(chunk),
				onError: (error) => (reducer)?  reject(error) : resolve(undefined),
				onEnd:   (     ) => (reducer)?  resolve(reducer(chunks)) : resolve(undefined)
			});
		});
	}

	export interface IStreamListener<T> {

		/**
		 * The 'data' event is emitted whenever the stream is
		 * relinquishing ownership of a chunk of data to a consumer.
		 */
		onData(data: T): void;

		/** Emitted when any error occurs. **/
		onError(err: Error): void;

		/**
		 * The 'end' event is emitted when there is no more data
		 * to be consumed from the stream. The 'end' event will
		 * not be emitted unless the data is completely consumed.
		 */
		onEnd(): void;
	}

	/** Helper to listen to all events of a T stream in proper order. **/
	export function listenStream<T>(stream: ReadableStreamEvents<T>, listener: IStreamListener<T>): IDisposable {
		let destroyed = false;

		stream.on('error', (error => (!destroyed)&& listener.onError(error)));

		stream.on('end', (() => (!destroyed)&& listener.onEnd()));

		// Adding the `data` listener will turn the stream into flowing mode. 
		// As such it is important to add this listener last (DO NOT CHANGE!)
		stream.on('data', (data => (!destroyed)&& listener.onData(data)));

		return new Disposable(() => destroyed = true);
	}

	/**
	 * Helper to peek up to `maxChunks` into a stream. The return type signals if
	 * the stream has ended or not. If not, caller needs to add a `data` listener
	 * to continue reading.
	 */
	export function peekStream<T>(stream: ReadableStream<T>, maxChunks: number): Promise<ReadableBufferedStream<T>> {
		return new Promise((resolve, reject) => {
			const streamListeners = new DisposableStore();
			const buffer: T[] = [];

			// Data Listener
			const dataListener = (chunk: T) => {
				// Add to buffer
				buffer.push(chunk);

				// We reached maxChunks and thus need to return
				if (buffer.length > maxChunks) {

					// Dispose any listeners and ensure to pause the
					// stream so that it can be consumed again by caller
					streamListeners.dispose();
					stream.pause();

					return resolve({ stream, buffer, ended: false });
				}
			};

			// Error Listener
			const errorListener = (error: Error) => reject(error);

			// End Listener
			const endListener = () => resolve({ stream, buffer, ended: true });

			streamListeners.add(new Disposable(() => stream.removeListener('error', errorListener)));
			stream.on('error', errorListener);

			streamListeners.add(new Disposable(() => stream.removeListener('end', endListener)));
			stream.on('end', endListener);

			// Important: leave the `data` listener last because
			// this can turn the stream into flowing mode and we
			// want `error` events to be received as well.
			streamListeners.add(new Disposable(() => stream.removeListener('data', dataListener)));
			stream.on('data', dataListener);
		});
	}

	/** Helper to create a readable stream from an existing T. **/
	export function toStream<T>(t: T, reducer: IReducer<T>): ReadableStream<T> {
		const stream = newWriteableStream<T>(reducer);
		stream.end(t);
		return stream;
	}

	/** Helper to create an empty stream **/
	export function emptyStream(): ReadableStream<never> {
		const stream = newWriteableStream<never>(() => { throw new Error('not supported'); });
		stream.end();
		return stream;
	}

	/** Helper to convert a T into a Readable<T>. **/
	export function toReadable<T>(t: T): Readable<T> {
		let consumed = false;

		return { read: () => {
			if (consumed) return null;
			consumed = true;
			return t;
		}};
	}

	/** Helper to transform a readable stream into another stream. **/
	export function transform<Original, Transformed>(stream: ReadableStreamEvents<Original>, transformer: ITransformer<Original, Transformed>, reducer: IReducer<Transformed>): ReadableStream<Transformed> {
		const target = newWriteableStream<Transformed>(reducer);

		listenStream(stream, {
			onData: data => target.write(transformer.data(data)),
			onError: error => target.error(transformer.error ? transformer.error(error) : error),
			onEnd: () => target.end()
		});

		return target;
	}

	/**
	 * Helper to take an existing readable that will
	 * have a prefix injected to the beginning.
	 */
	export function prefixedReadable<T>(prefix: T, readable: Readable<T>, reducer: IReducer<T>): Readable<T> {
		let prefixHandled = false;

		return { read: () => {
			const chunk = readable.read();

			// Handle prefix only once
			if (!prefixHandled) {
				prefixHandled = true;

				// If we have also a read-result, make sure to reduce it to a single result
				// Otherwise, just return prefix directly
				return (chunk !== null)? reducer([prefix, chunk]) : prefix;
			} else return chunk;
		}};
	}

	/**
	 * Helper to take an existing stream that will
	 * have a prefix injected to the beginning.
	 */
	export function prefixedStream<T>(prefix: T, stream: ReadableStream<T>, reducer: IReducer<T>): ReadableStream<T> {
		let prefixHandled = false;

		const target = newWriteableStream<T>(reducer);

		listenStream(stream, {
			onData: (data) => {
				// Handle prefix only once
				if (!prefixHandled) {
					prefixHandled = true;
					return target.write(reducer([prefix, data]));
				} else return target.write(data);
			},
			onError: error => target.error(error),
			onEnd: () => {
				// Handle prefix only once
				if (!prefixHandled) {
					prefixHandled = true;
					target.write(prefix);
				} else target.end();
			}
		});

		return target;
	}

}