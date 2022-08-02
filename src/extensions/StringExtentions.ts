export { };





declare global {
	interface String {
		/** Returns the number of sections separated by new line characters there are within the strong. */
		readonly lineCount : number;
	}
}


Object.defineProperty(String.prototype, "lineCount", {
    get (this: String) {return this.match(/[\r\n]+/g)?.length ?? 0;},
    enumerable: false,
    configurable: true
}); 