
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
		mappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : ReadonlyArray<TR>;
		flatMappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : ReadonlyArray<TR>;
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

