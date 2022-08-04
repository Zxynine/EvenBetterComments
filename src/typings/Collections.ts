






export interface KeyValPair<K,V> {Key:K, Val:V}




// interface IEnumerable<T> {

// }








export class HashSet<T> {
	private dict : Map<T,bool>;
	public constructor(...Initial: Array<T>) {
		this.dict = new Map<T,bool>();
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
}









export function *Counter(start:int, stop:int, step:int =1) : Generator<number> {
	for (let i=start; i<stop; i+=step) yield i;
}



// interface IList<T> extends Array<T> {
// 	length : int;
// 	[index:int] : T;
// }