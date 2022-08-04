export { };





declare global {
	interface String {
		/** Returns the number of sections separated by new line characters there are within the strong. */
		readonly lineCount : number;
		/**
		 * Returns a 32-bit hash value hash function for the String. 
		 * Inspired by Java source.
		**/
		getHashCode(this:string):number;

		/**
		 * Returns true if the string starts with one of the 
		 * prefixes and false otherwise.
		 * @param prefixes  A list of prefixes.
		 * @returns {[boolean, string]}  A tuple of whether a match is found (boolean) and the matched prefix.
		 */
		startsWithOne(this:string, prefixes:string[]): [boolean, string];
	}
}


Object.defineProperty(String.prototype, "lineCount", {
    get (this: String) {return this.match(/[\r\n]+/g)?.length ?? 0;},
    enumerable: false,
    configurable: true
}); 


String.prototype.getHashCode = function (this:string):number {
	if(this.length == 0) return 0;
	let hash = 0;
	for(let i = 0; i < this.length; ++i) {
		const char = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // force convert to 32-bit int
	}
	return hash;
}




String.prototype.startsWithOne = function startsWithOne(this:string, prefixes: string[]): [boolean, string] {
	for (let p of prefixes) {
	  if (/\w/.test(p[0])) p = '\\b' + p;
	  if (/\w/.test(p.slice(-1))) p = p + '\\b';
	  
	  if ((new RegExp('^'+p, 'i')).test(this))
		return [true, p.replace(/\\b/g, '')];
	}
	return [false, this];
  }