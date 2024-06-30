
export type Func<TArgs, TResult> = TArgs extends Array<any> ? (...args : TArgs) => TResult : (arg : TArgs) => TResult; 
// Syntax sugar
export type Action<TArgs extends any[]|any> = Func<TArgs, undefined>; 

export type MappedObject<V> = {[index:string]: V};


declare global {
    interface Map<K,V> {
		newMap<X,Y>(this : Map<K,V>, key : Func<K,X>, val : Func<V,Y>) : Map<X,Y>;

	}


	
	interface MapConstructor {
		MapValues<TI,TO>(obj : MappedObject<TI>, mapper : Func<TI,TO>) : MappedObject<TO>;
	}
}

Map.prototype.newMap = function<K,V,X,Y>(this : Map<K,V>, key : Func<K,X>, val : Func<V,Y>) : Map<X,Y> {
	const ResultMap = new Map<X,Y>();
	this.forEach((v,k) => ResultMap.set(key(k), val(v)));
	return ResultMap;
}


Map.MapValues = function<TI,TO>(obj : MappedObject<TI>, mapper : Func<TI,TO>) : MappedObject<TO> {
	const ResultMap : MappedObject<TO> = {};
	Object.entries(obj).forEach(([Key, Val]) => ResultMap[Key] = mapper(Val));
	return ResultMap;
}

