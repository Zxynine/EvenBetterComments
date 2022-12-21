import { ExtensionContext } from 'vscode';


type CacheMap = Record<string, CacheRecord>;
type CacheRecord = {
	value: any
	expiration?: number
}

/**
 * @class Cache
 * @desc A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.
 * @param {vscode.ExtensionContext} context - The Visual Studio Code extension context
 * @param {string} [namespace] - Optional namespace for cached items. Defaults to "cache"
 * @returns {Cache} The cache object
 */
export class Cache {
	public context: ExtensionContext;
	public namespace: string;
	public cache: CacheMap;

	public constructor(context : ExtensionContext, namespace: string) {
		// ExtensionContext
		this.context = context
		// Namespace of the context's globalState
		this.namespace = namespace || 'cache'
		// Local cache object
		this.cache = this.context.globalState.get(this.namespace, {})
	}



	/**
	 * @desc Store an item in the cache, with optional expiration
	 * @param {string} key - The unique key for the cached item
	 * @param {any} value - The value to cache
	 * @param {number} [expiration] - Optional expiration time in seconds
	 * @returns {Promise} Visual Studio Code Thenable (Promise)
	 */
	public Set(key:string, value:any, expiration?:number) : Promise<void|bool>|Thenable<void|bool> {
		// Parameter type checking
		if (typeof value === 'undefined') return Promise.resolve(false);
	
		// Save to local cache object
		this.cache[key] = <CacheRecord>{
			value: value,
			expiration: (expiration && Number.isInteger(expiration))? (now() + expiration) : undefined
		}
	
		// Save to extension's globalState
		return this.context.globalState.update(this.namespace, this.cache)

	}

	/**
	 * @desc Get an item from the cache, or the optional default value
	 * @param {string} key - The unique key for the cached item
	 * @param {any} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
	 * @returns {any} Returns the cached value or optional defaultValue
	 */
	public Get(key:string, defaultValue?: any): any {
		return ((key in this.cache && !this.IsExpired(key))
			// Return the value is exists and not expired
			? this.cache[key].value 
			// Return default value If doesn't exist or expired
			: (defaultValue ?? undefined)
		);
	}
	
	/**
	 * @desc Checks to see if unexpired item exists in the cache
	 * @param {string} key - The unique key for the cached item
	 * @return {boolean}
	 */
	public Has(key:string): bool {
		return (key in this.cache && !this.IsExpired(key));
	}
	
	/**
	 * @desc Removes an item from the cache
	 * @param {string} key - The unique key for the cached item
	 * @returns {Thenable} Visual Studio Code Thenable (Promise)
	 */
	public Remove(key:string): Promise<bool>|Thenable<void>  {
		// Does item exist?
		if (key in this.cache) {
			// Delete from local object
			delete this.cache[key]
			// Update the extension's globalState
			return this.context.globalState.update(this.namespace, this.cache)
		} else return Promise.resolve(true);
	}
	
	/**
	 * @desc Get an array of all cached item keys
	 */
	public get Keys(): Array<string> { return Object.keys(this.cache) }
	
	/**
	 * @desc Get an array of all cached item values
	 */
	 public get Values(): Array<any> { return Object.values(this.cache).map(Record => Record.value) }
	
	/**
	 * @desc Returns object of all cached items
	 */
	public get All(): Record<string, any> { return this.cache.mapObject((Key, Record) => [Key, Record.value]) }
	
	/**
	 * @desc Clears all items from the cache
	 * @returns {Thenable} Visual Studio Code Thenable (Promise)
	 */
	public Flush(): Thenable<void> {
		this.cache = {};
		return this.context.globalState.update(this.namespace, undefined);
	}
	
	/**
	 * @desc Gets the expiration time for the cached item
	 * @param {string} key - The unique key for the cached item
	 * @return {number} Unix Timestamp in seconds
	 */
	public GetExpiration(key:string): number|undefined {
		return (key in this.cache)? this.cache[key].expiration : undefined;
	}
	
	/**
	 * @desc Checks to see if cached item is expired
	 * @param {string} key - The unique key for the cached item to check
	 * @return {boolean}
	 */
	public IsExpired(key:string): bool {
		if (key in this.cache) {
			const Cached = this.cache[key];
			// Is expiration >= right now?
			return (typeof Cached.expiration !== 'undefined') && (now() >= Cached.expiration);
		// If key doesn't exist or it has no expiration
		} return false;
	}
	
	
	
	
}








/**
 * @name now
 * @desc Helper function to get the current timestamp
 * @function
 * @private
 * @return {number} Current Unix Timestamp in seconds
 */
const now = ():number => Math.floor(Date.now() / 1000);





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










// class Cache {
// 	private cache: { [key: string]: unknown };

// 	constructor(private storage: Memento, private namespace: string) {
// 		this.cache = storage.get(this.namespace, {});
// 	}

// 	public put(key: string, value: unknown): void {
// 		this.cache[key] = value;
// 		this.storage.update(this.namespace, this.cache);
// 	}

// 	public get<T>(key: string, defaultValue?: unknown): T {
// 		return (key in this.cache ? this.cache[key] : defaultValue) as T;
// 	}
// }









/**
 * All cached data will lost on vscode reload.
 */
const cache: any = {}

function hasCache(key: string): boolean {
	return Object.hasOwnProperty.call(cache, key)
}

function setCache<T>(key: string, value: T): T {
	cache[key] = value
	return value
}

function getCache<T = any>(key: string, value?: T): T {
	if (cache[key] === undefined) cache[key] = value

	return cache[key]
}

export { hasCache, getCache, setCache }