
export type Func<TArgs extends any[], TResult> = (...args: TArgs) => TResult; 
// Syntax sugar
export type Action<TArgs extends any[]> = Func<TArgs, undefined>; 

export type nulldefined = null|undefined;

export type MappedObject<V> = {[index:string]: V};


declare global {
    interface Array<T> {
		/** Returns if the array contains no items */
		readonly IsEmpty : bool;

		/** 
		 * Null safe version of a map, its the same as mapping then filtering with a truth check. 
		**/
		condensedMap<TR>(this : Array<T>, map:Func<[T], TR>) : Array<TR>;
		/** Null safe version of a flatMap, its the same as flatMapping then filtering with a truth check. */
		condensedFlatMap<TR>(this : Array<T>, map:Func<[T], Array<TR>>) : Array<TR>;
		filteredMap<TR>(this : Array<T>, map:Func<[T], TR>, filter:Func<[TR], unknown>) : Array<TR>;
		filteredFlatMap<TR>(this : Array<T>, flatMap:Func<[T], Array<TR>>, filter:Func<[Array<TR>], unknown>) : Array<TR>;
		mappedFilter<TR>(this : Array<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR>;
		flatMappedFilter<TR>(this : Array<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR>;
		binarySearch<T>(this : Array<T>, filter:Func<[T], 1|0|-1>) : T|undefined;
		
		/**
		 * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
		 * @param {Func<[T], boolean>} predicate - find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
		**/
		first<T>(this:Array<T>, predicate:Func<[T], boolean>) : T|undefined;
		
		/** 
		 * Returns the value of the last element in the array where predicate is true, and undefined otherwise.
		 * @param {Func<[T], boolean>} predicate - find calls predicate once for each element of the array, in decending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
		**/
		last<T>(this:Array<T>, predicate:Func<[T], boolean>) : T|undefined;
		
		firstOrDefault<T, NotFound = T>(array: Array<T>, notFoundValue: NotFound): T | NotFound;
		firstOrDefault<T>(array: Array<T>): T | undefined;
		firstOrDefault<T, NotFound = T>(array: Array<T>, notFoundValue?: NotFound): T | NotFound | undefined;

		lastOrDefault<T, NotFound = T>(array: Array<T>, notFoundValue: NotFound): T | NotFound;
		lastOrDefault<T>(array: Array<T>): T | undefined;
		lastOrDefault<T, NotFound = T>(array: Array<T>, notFoundValue?: NotFound): T | NotFound | undefined;

		firstIndex<T>(this:Array<T>, predicate:Func<[T], boolean>, failReturn?:number) : number;
		lastIndex<T>(this:Array<T>, predicate:Func<[T], boolean>, failReturn?:number) : number;

		count<T>(this:Array<T>, conditional:Action<[T]>) : number;

		collect<C,T>(this:Array<T>, initialValue:C, callback : ((collector:C, currentValue:T)=>C)) : C;

		chunkArray<T>(this: Array<T>, chunkSize: number): Array<T[]>;

		insertArray<T>(this: Array<T>, insertIndex: number, insertArray: Array<T>): Array<T>;

		forEachIf<T>(this: Array<T>, conditional:Func<[T], bool>, foreach:Action<[T]>): void;

		safeRemove<T>(this: Array<T>, item: T): void;

		mapObject<TK extends keyof any, TV>(this: Array<T>, map:Func<[T], [TK,TV]>): MappedObject<TV>;

		toDefault<T>(this: Array<T>, defaultValue: T): void;
    }

    interface ReadonlyArray<T> {
		/** Returns if the array contains no items */
		readonly IsEmpty : bool;

		/** Null safe version of a map, its the same as mapping then filtering with a truth check. */
		condensedMap<TR>(this : ReadonlyArray<T>, map:Func<[T], TR>) : Array<TR>;
		/** Null safe version of a flatMap, its the same as flatMapping then filtering with a truth check. */
		condensedFlatMap<TR>(this : ReadonlyArray<T>, map:Func<[T], Array<TR>>) : Array<TR>;
		filteredMap<TR>(this : ReadonlyArray<T>, map:Func<[T], TR>, filter:Func<[TR], unknown>) : Array<TR>;
		filteredFlatMap<TR>(this : ReadonlyArray<T>, flatMap:Func<[T], Array<TR>>, filter:Func<[Array<TR>], unknown>) : Array<TR>;
		// mappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR>;
		// flatMappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR>;
		binarySearch<T>(this : ReadonlyArray<T>, filter:Func<[T], 1|0|-1>) : T|undefined;
		/**
		 * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
		 * @param {Func<[T], boolean>} predicate - find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
		**/
		first<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>) : T|undefined;
		/** 
		 * Returns the value of the last element in the array where predicate is true, and undefined otherwise.
		 * @param {Func<[T], boolean>} predicate - find calls predicate once for each element of the array, in decending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
		**/
		last<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>) : T|undefined;

		firstOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue: NotFound): T | NotFound;
		firstOrDefault<T>(array: ReadonlyArray<T>): T | undefined;
		firstOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined;

		lastOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue: NotFound): T | NotFound;
		lastOrDefault<T>(array: ReadonlyArray<T>): T | undefined;
		lastOrDefault<T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined;

		firstIndex<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>, failReturn?:number) : number;
		lastIndex<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>, failReturn?:number) : number;

		count<T>(this:ReadonlyArray<T>, conditional:Action<[T]>) : number;

		collect<C,T>(this:ReadonlyArray<T>, initialValue:C, callback : ((collector:C, currentValue:T)=>C)) : C;
		
		forEachIf<T>(this: ReadonlyArray<T>, conditional:Func<[T], bool>, foreach:Action<[T]>): void;

		mapObject<TK extends keyof any, TV>(this: ReadonlyArray<T>, map:Func<[T], [TK,TV]>): MappedObject<TV>;
    }
}







Object.defineProperty(Array.prototype, "IsEmpty", {
    get (this: Array<any>) {return this.length === 0;},
    enumerable: false,
    configurable: true
}); 






/** Null safe version of a map, its the same as mapping then filtering with a truth check. */
Array.prototype.condensedMap = function <T,TR>(this : Array<T>, map:Func<[T], TR|nulldefined>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext) => {
		const mapped = map(ext);
		if (mapped) ResultArray.push(mapped);
	});
	return ResultArray;
}

/** Null safe version of a flatMap, its the same as flatMapping then filtering with a truth check. */
Array.prototype.condensedFlatMap = function <T,TR>(this : Array<T>, map:Func<[T], Array<TR>|nulldefined>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext) => {
		const mapped = map(ext);
		if (mapped) ResultArray.concat(mapped);
	});
	return ResultArray;
}

Array.prototype.filteredMap = function <T,TR>(this : Array<T>, map:Func<[T], TR|nulldefined>, filter:Func<[TR], unknown>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		const mapped = map(ext);
		if (mapped && filter(mapped)) ResultArray.push(mapped);
	});
	return ResultArray;
}

Array.prototype.filteredFlatMap = function <T,TR>(this : Array<T>, flatMap:Func<[T], Array<TR>|nulldefined>, filter:Func<[Array<TR>], unknown>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		const mapped = flatMap(ext);
		if (mapped && filter(mapped)) ResultArray.concat(mapped);
	});
	return ResultArray;
}



Array.prototype.mappedFilter = function <T,TR>(this : Array<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		if (filter(ext)) ResultArray.push(map(ext));
	});
	return ResultArray;
}

Array.prototype.flatMappedFilter = function <T,TR>(this : Array<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		if (filter(ext)) ResultArray.concat(flatMap(ext));
	});
	return ResultArray;
}














Array.prototype.first = function <T>(this : Array<T>, predicate:Func<[T], boolean>) : T|undefined {
	for (let i=0; i<this.length; i++) {
		if (predicate(this[i])) return this[i];
	}
	return undefined;
}

Array.prototype.last = function <T>(this : Array<T>, predicate:Func<[T], boolean>) : T|undefined {
	for (let i=this.length-1; i>=0; i--) {
		if (predicate(this[i])) return this[i];
	}
	return undefined;
}

Array.prototype.firstIndex = function <T>(this : Array<T>, predicate:Func<[T], boolean>, failReturn:number=-1) : number {
	for (let i=0; i<this.length; i++) {
		if (predicate(this[i])) return i;
	}
	return failReturn;
}

Array.prototype.lastIndex = function <T>(this : Array<T>, predicate:Func<[T], boolean>, failReturn:number=-1) : number {
	for (let i=this.length-1; i>=0; i--) {
		if (predicate(this[i])) return i;
	}
	return failReturn;
}


Array.prototype.firstOrDefault = function <T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined {
	return array.length > 0 ? array[0] : notFoundValue;
}

Array.prototype.lastOrDefault = function <T, NotFound = T>(array: ReadonlyArray<T>, notFoundValue?: NotFound): T | NotFound | undefined {
	return array.length > 0 ? array[array.length - 1] : notFoundValue;
}




Array.prototype.count = function <T>(this : Array<T>, conditional:Action<[T]>) : number {
	let count : number = 0;
	for (let i=0; i<this.length; i++) {
		if (conditional(this[i])) count++;
	}
	return count;
}



Array.prototype.binarySearch = function <T>(this : Array<T>, filter:Func<[T], 1|0|-1>) : T|undefined {
	const half = this.length*0.5;
	let iterations : number = 0;

	let startIndex = 0;
	let endIndex = this.length-1;
	for (; iterations<=half; iterations++) {
		const mid = startIndex + ((endIndex - startIndex)>>1);
		switch (filter(this[mid])) {
			case +1: endIndex = mid-1; break; //Too Far
			case 0: return this[mid]; //Just right
			case -1: startIndex = mid+1; break; //Too Short
		}
	}
	if (iterations > half) console.error("Binary search on array exceded maximum iterations, ensure the array is properly sorted!", this, filter);
	return undefined;
}





Array.prototype.collect = function <C,T>(this:Array<T>, initialValue:C, callback : ((collector:C, currentValue:T)=>C)) : C {
	let collector = initialValue;
	for (const item of this) collector = callback(collector, item);
	return collector;
}



/**
 * Return equal parts of an array
 * @template T
 * @param chunkSize Size of each part.
 */
Array.prototype.chunkArray = function sliceArray<T>(this: Array<T>, chunkSize: number): Array<T[]> {
	if(chunkSize == 0) return [];

	// let slices = Array<T[]>(Math.ceil(this.length/chunkSize));
	let slices = Array<T[]>();
	for (let i = 0; i < this.length; i += chunkSize) {
		slices.push(this.slice(i, i+chunkSize));
	}
	return slices;
}








/**
 * Insert `insertArr` inside the array at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
Array.prototype.insertArray = function arrayInsert<T>(this: T[], insertIndex: number, insertArr: T[]): T[] {
	const before = this.slice(0, insertIndex);
	const after = this.slice(insertIndex);
	return before.concat(insertArr, after);
}




 Array.prototype.forEachIf = function forEachIf<T>(this: Array<T>, conditional:Func<[T], bool>, foreach:Action<[T]>): void {
	for (const Item of this) conditional(Item) && foreach(Item);
}




Array.prototype.safeRemove = function safeRemove<T>(this: Array<T>, item: T): void {
	const index = this.indexOf(item);
	if (index !== -1) this.splice(index, 1);
}





Array.prototype.mapObject = function <T, K extends keyof any, V>(this : Array<T>, map: Func<[T], [K,V]>) : MappedObject<V> {
	return Object.fromEntries(this.map(map));
}



Array.prototype.toDefault = function <T>(this: Array<T>, defaultValue: T) {
	for (let i = this.length; i >= 0; --i) this[i] = defaultValue;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



/**
 * Returns the first mapped value of the array which is not undefined.
 */
 export function mapFind<T, R>(array: Iterable<T>, mapFn: (value: T) => R | undefined): R | undefined {
	for (const value of array) {
		const mapped = mapFn(value);
		if (mapped !== undefined) return mapped;
	}

	return undefined;
}






export function getRandomElement<T>(arr: T[]): T | undefined {
	return arr[Math.floor(Math.random() * arr.length)];
}



/**
 * Pushes an element to the start of the array, if found.
 */
 export function prepend<T>(arr: T[], value: T): void {
	const index = arr.indexOf(value);

	if (index > -1) {
		arr.splice(index, 1);
		arr.unshift(value);
	}
}

/**
 * Pushes an element to the end of the array, if found.
 */
export function append<T>(arr: T[], value: T): void {
	const index = arr.indexOf(value);

	if (index > -1) {
		arr.splice(index, 1);
		arr.push(value);
	}
}

export function pushRange<T>(arr: T[], items: ReadonlyArray<T>): void {
	for (const item of items) arr.push(item);
}






/**
 * Uses Fisher-Yates shuffle to shuffle the given array
 */
 export function shuffle<T>(array: T[], _seed?: number): void {
	let rand: () => number;

	if (typeof _seed === 'number') {
		let seed = _seed;
		// Seeded random number generator in JS. Modified from: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
		rand = () => {
			const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
			return x - Math.floor(x);
		};
	} else rand = Math.random;

	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rand() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}


export function range(to: number): number[];
export function range(from: number, to: number): number[];
export function range(arg: number, to?: number): number[] {
	let from = (typeof to === 'number') ? arg : 0;
	if ((typeof to !== 'number')) to = arg;

	const result: number[] = [];


	if (from <= to) {
		for (let i = from; i < to; i++) result.push(i);
	} else {
		for (let i = from; i > to; i--) result.push(i);
	}

	return result;
}








/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
 export function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[] {
	return <T[]>array.filter(e => !!e);
}



/**
 * Remove all falsy values from `array`. The original array IS modified.
 */
 export function coalesceInPlace<T>(array: Array<T | undefined | null>): void {
	let to = 0;
	for (let i = 0; i < array.length; i++) {
		if (!!array[i]) {
			array[to] = array[i];
			to += 1;
		}
	}
	array.length = to;
}





/**
 * Remove the element at `index` by replacing it with the last element. This is faster than `splice`
 * but changes the order of the array
 */
 export function removeFastWithoutKeepingOrder<T>(array: T[], index: number) {
	const last = array.length - 1;
	if (index < last) array[index] = array[last];
	array.pop();
}







/**
 * Performs a binary search algorithm over a sorted array.
 *
 * @param array The array being searched.
 * @param key The value we search for.
 * @param comparator A function that takes two array elements and returns zero
 *   if they are equal, a negative number if the first element precedes the
 *   second one in the sorting order, or a positive number if the second element
 *   precedes the first one.
 * @return See {@link binarySearch2}
 */
 export function binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number {
	return binarySearch2(array.length, i => comparator(array[i], key));
}

/**
 * Performs a binary search algorithm over a sorted collection. Useful for cases
 * when we need to perform a binary search over something that isn't actually an
 * array, and converting data to an array would defeat the use of binary search
 * in the first place.
 *
 * @param length The collection length.
 * @param compareToKey A function that takes an index of an element in the
 *   collection and returns zero if the value at this index is equal to the
 *   search key, a negative number if the value precedes the search key in the
 *   sorting order, or a positive number if the search key precedes the value.
 * @return A non-negative index of an element, if found. If not found, the
 *   result is -(n+1) (or ~n, using bitwise notation), where n is the index
 *   where the key should be inserted to maintain the sorting order.
 */
export function binarySearch2(length: number, compareToKey: (index: number) => number): number {
	let low = 0, high = length-1;

	while (low <= high) {
		const mid = ((low + high) / 2) | 0;
		const comp = compareToKey(mid);
		if (comp === 0) return mid;
		else if (comp < 0) low = mid + 1;
		else if (0 < comp) high = mid - 1;
		else return mid;
	}
	return -(low + 1);
}





/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
 export function tail<T>(array: ArrayLike<T>, n: number = 0): T {
	return array[array.length - (1 + n)];
}

export function del<T>(array: T[], e: T): void {
	const idx = array.indexOf(e);
	if (idx >= 0) array.splice(idx, 1);
}








export function groupBy<T>(array: T[], keyGetter: (...args: any[]) => string): Map<string, T[]> {
	const map = new Map<string, T[]>();
	array.forEach((item: T) => {
		const key = keyGetter(item);
		const collection = map.get(key);
		(!collection)? map.set(key, [item]) : collection.push(item);
	});
	return map;
  }
  









  export function find<T>(array: T[], fn: (t: T) => boolean): T | undefined {
	let result: T | undefined = undefined;

	array.some(e => {
		if (fn(e)) {
			result = e;
			return true;
		} else return false;
	});

	return result;
}

// export function groupBy<T>(arr: T[], fn: (el: T) => string): { [key: string]: T[] } {
// 	return arr.reduce((result, el) => {
// 		const key = fn(el);
// 		result[key] = [...(result[key] || []), el];
// 		return result;
// 	}, Object.create(null));
// }


export function uniqBy<T>(arr: T[], fn: (el: T) => string): T[] {
	const seen : Record<string, bool> = Object.create(null);

	return arr.filter(el => {
		const key = fn(el);
		if (seen[key]) return false;
		else return seen[key] = true;
	});
}












  //https://github.com/gitkraken/vscode-gitlens/blob/main/src/system/array.ts