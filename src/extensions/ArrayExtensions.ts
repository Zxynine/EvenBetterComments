
export type Func<TArgs extends any[], TResult> = (...args: TArgs) => TResult; 
// Syntax sugar
export type Action<TArgs extends any[]> = Func<TArgs, undefined>; 

export type nulldefined = null|undefined;



declare global {
    interface Array<T> {
		condensedMap<TR>(this : Array<T>, map:Func<[T], TR>) : Array<TR>;
		condensedFlatMap<TR>(this : Array<T>, map:Func<[T], Array<TR>>) : Array<TR>;
		filteredMap<TR>(this : Array<T>, map:Func<[T], TR>, filter:Func<[TR], unknown>) : Array<TR>;
		filteredFlatMap<TR>(this : Array<T>, flatMap:Func<[T], Array<TR>>, filter:Func<[Array<TR>], unknown>) : Array<TR>;
		// mappedFilter<TR>(this : Array<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR>;
		// flatMappedFilter<TR>(this : Array<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR>;
		first<T>(this:Array<T>, predicate:Func<[T], boolean>) : T|undefined;
		last<T>(this:Array<T>, predicate:Func<[T], boolean>) : T|undefined;
		count<T>(this:Array<T>, conditional:Action<[T]>) : number;

		// binarySearch<T>(this : Array<T>, filter:Func<[T], 1|0|-1>) : T|undefined;

    }

    interface ReadonlyArray<T> {
		condensedMap<TR>(this : ReadonlyArray<T>, map:Func<[T], TR>) : Array<TR>;
		condensedFlatMap<TR>(this : ReadonlyArray<T>, map:Func<[T], Array<TR>>) : Array<TR>;
		filteredMap<TR>(this : ReadonlyArray<T>, map:Func<[T], TR>, filter:Func<[TR], unknown>) : Array<TR>;
		filteredFlatMap<TR>(this : ReadonlyArray<T>, flatMap:Func<[T], Array<TR>>, filter:Func<[Array<TR>], unknown>) : Array<TR>;
		// mappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR>;
		// flatMappedFilter<TR>(this : ReadonlyArray<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR>;
		first<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>) : T|undefined;
		last<T>(this:ReadonlyArray<T>, predicate:Func<[T], boolean>) : T|undefined;
		count<T>(this:ReadonlyArray<T>, conditional:Action<[T]>) : number;

		// binarySearch<T>(this : Array<T>, filter:Func<[T], 1|0|-1>) : T|undefined;
    }
}

//Null safe version of a map, its the same as mapping then filtering with a truth check.
Array.prototype.condensedMap = function <T,TR>(this : Array<T>, map:Func<[T], TR|nulldefined>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext) => {
		let mapped = map(ext);
		if (mapped) ResultArray.push(mapped);
	});
	return ResultArray;
}

//Null safe version of a flatmap, its the same as flatmapping then filtering with a truth check.
Array.prototype.condensedFlatMap = function <T,TR>(this : Array<T>, map:Func<[T], Array<TR>|nulldefined>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext) => {
		let mapped = map(ext);
		if (mapped) ResultArray.concat(mapped);
	});
	return ResultArray;
}

Array.prototype.filteredMap = function <T,TR>(this : Array<T>, map:Func<[T], TR|nulldefined>, filter:Func<[TR], unknown>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		let mapped = map(ext);
		if (mapped && filter(mapped)) ResultArray.push(mapped);
	});
	return ResultArray;
}

Array.prototype.filteredFlatMap = function <T,TR>(this : Array<T>, flatMap:Func<[T], Array<TR>|nulldefined>, filter:Func<[Array<TR>], unknown>) : Array<TR> {
	const ResultArray : TR[] = [];
	this.forEach((ext:T) => {
		let mapped = flatMap(ext);
		if (mapped && filter(mapped)) ResultArray.concat(mapped);
	});
	return ResultArray;
}

// Array.prototype.mappedFilter = function <T,TR>(this : Array<T>, filter:Func<[T], unknown>, map:Func<[T], TR>) : Array<TR> {
// 	const ResultArray : TR[] = [];
// 	this.forEach((ext:T) => {
// 		if (filter(ext)) ResultArray.push(map(ext));
// 	});
// 	return ResultArray;
// }

// Array.prototype.flatMappedFilter = function <T,TR>(this : Array<T>, filter:Func<[T], unknown>, flatMap:Func<[T], Array<TR>>) : Array<TR> {
// 	const ResultArray : TR[] = [];
// 	this.forEach((ext:T) => {
// 		if (filter(ext)) ResultArray.concat(flatMap(ext));
// 	});
// 	return ResultArray;
// }

/** Returns the value of the first element in the array where predicate is true, and undefined otherwise.
	@param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
*/
Array.prototype.first = function <T>(this : Array<T>, predicate:Func<[T], boolean>) : T|undefined {
	for (let i=0; i<this.length; i++) {
		if (predicate(this[i])) return this[i];
	}
	return undefined;
}

/** Returns the value of the last element in the array where predicate is true, and undefined otherwise.
	@param predicate find calls predicate once for each element of the array, in decending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
*/
Array.prototype.last = function <T>(this : Array<T>, predicate:Func<[T], boolean>) : T|undefined {
	for (let i=this.length-1; i>=0; i--) {
		if (predicate(this[i])) return this[i];
	}
	return undefined;
}


Array.prototype.count = function <T>(this : Array<T>, conditional:Action<[T]>) : number {
	let count : number = 0;
	for (let i=0; i<this.length; i++) {
		if (conditional(this[i])) count++;
	}
	return count;
}



// Array.prototype.binarySearch = function <T>(this : Array<T>, filter:Func<[T], 1|0|-1>) : T|undefined {
// 	let iterations : number = 0;

// 	for (let i=Math.floor(this.length); iterations<= this.length*0.5; iterations++) {
// 		switch (filter(this[i])) {
// 			case 1: i= Math.floor((this.length-i)*0.5); break;
// 			case 0: return this[i];
// 			case -1: i= Math.floor(i*0.5); break;
// 		}
// 	}
// 	if (iterations > this.length*0.5) console.error("Binary search on array exceded maximum iterations, ensure the array is properly sorted!", this, filter);
// 	return undefined;
// }

