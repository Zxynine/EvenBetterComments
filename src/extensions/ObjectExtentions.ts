
export type key = string | number | symbol;

export type MappedObject<V> = {[index:string]: V};




declare global {
	interface Object {
		mapObject<T, K extends keyof any, V>(this: {[index:string]: T}|Object, map: Func<[string, T], [K,V]>): MappedObject<V>;

		merge(obj: Record<string, unknown>): Record<string, unknown>;
		mergeAll(...obj: Record<string, unknown>[]): Record<string, unknown>;

		
		mergeInto(...objs: Record<string, unknown>[]): void;
		
	}

	interface MappedObject<T> {
		mapObject<K extends keyof any, V>(this: MappedObject<T>, map: Func<[string, T], [K,V]>): MappedObject<V>;


	}
}



Object.prototype.mapObject = function <K extends keyof any, V>(map: Func<[string, any], [K,V]>) : MappedObject<V> {
	return Object.fromEntries(Object.entries(this).map(([k,v], i) => map(k,v)));
}

Object.prototype.merge = function (obj: Record<string, unknown>) {
	return { ...this, ...obj };
};


Object.prototype.mergeAll = function (this : any, ...objs: Record<string, unknown>[]) {
	return { ...this, ...objs.reduce((acc, cur) => ({...acc, ...cur}))};
};




Object.prototype.mergeInto = function (this : any, ...objs: Record<string, unknown>[]) {
	objs.forEach(source => { for (const key in source) this[key] = source[key]; });
	return this;
};
