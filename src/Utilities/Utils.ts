

/**
 * A union of given const enum values.
*/
export type OrMask<T extends number> = number;



/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}








export class CachedFn<TKey, TValue> {
	private readonly cache = new Map<TKey, TValue>();
	constructor(private readonly fn: (key: TKey) => TValue) {}

	public get(key: TKey): TValue {
		if (this.cache.has(key)) return this.cache.get(key)!;
		else {
			const value = this.fn(key);
			this.cache.set(key, value);
			return value;
		}
	}
}




export function basename(path: string): string {
	const idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
	if (idx === 0) {
		return path;
	} else if (~idx === path.length - 1) {
		return basename(path.substring(0, path.length - 1));
	} else {
		return path.substring(~idx + 1);
	}
}






export function clone<T>(something: T): T {
	return doClone(something);
}

function doClone(something: any): any {
	if (Array.isArray(something)) {
		return cloneArray(something);
	} else if (typeof something === 'object') {
		return cloneObj(something);
	} else return something;
}

function cloneArray(arr: any[]): any[] {
	let r: any[] = [];
	for (let i = 0, len = arr.length; i < len; i++) r[i] = doClone(arr[i]);
	return r;
}

function cloneObj(obj: any): any {
	let r: any = {};
	for (let key in obj) r[key] = doClone(obj[key]);
	return r;
}




export function mergeObjects(target: any, ...sources: any[]): any {
	sources.forEach(source => {
		for (let key in source) target[key] = source[key];
	});
	return target;
}