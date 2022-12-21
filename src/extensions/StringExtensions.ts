export { };





declare global {
	interface String {
		/** Returns the number of sections separated by new line characters there are within the strong. */
		readonly lineCount : number;
		
		/** Returns if the string contains no characters */
		readonly IsEmpty : bool;

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
		startsWithAny(this:string, prefixes:string[]): [boolean, string];

		join(this:string, ...args: any[]): string;


        /**
         * Takes a predicate and returns the index of the first rightest char in the string satisfying the predicate,
         * or -1 if there is no such char.
         *
         * @param {number} columnNumber the column index starts testing
         * @param {(theChar: string) => Boolean} predicate to test the char
         * @returns {number} -1 if there is no such char
         *
         * @memberOf String
         */
        findLastIndex(predicate: (theChar: string) => Boolean, columnNumber?: number, ): number;



						
		/**
		 * Convert string to PascalCase.  
		 * first_second_third => FirstSecondThird  
		 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/snippet/snippetParser.ts}  
		 * 
		 * @returns {string} transformed value  
		 */
		toPascalCase() : string;

		
		/**
		 * Convert string to camelCase.  
		 * first_second_third => firstSecondThird  
		 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/snippet/snippetParser.ts}  
		 * 
		 * @returns {string} transformed value  
		 */
		toCamelCase() : string;
		
		
		/**
		 * Convert string to snakeCase.  
		 * first_second_third => firstSecondThird  
		 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts}  
		 * 
		 * @returns {string} transformed value  
		 */
		toSnakeCase(): string;

		/** TitleCase all words in a string */
		toTitleCase(): string;

		/**
		 * Returns a boolean indicating if the provided sequence is contained within the string.
		**/
		contains(match:string): bool;

		
	}

	interface StringConstructor {
		Equals(LHS:string, RHS:string, ignoreCase:bool): bool;

		
        /**
         * Takes two strings and does a comparison between them.
         * @returns {number} 1 for greater-than, -1 for less-than, and 0 for equal-to
         * @memberOf String
         */
		Compare(LHS:string, RHS:string): CompareResult;
        /**
         * Takes two strings and does a comparison between them.
         * @param {Boolean} invert Set to false to compate LHS to RHS; Set to true to compare RHS to LHS;
		 * 
		 * E.g: 
		 * ```
		 * 		//Expected output: -1 (LHS<RHS)
		 * 		String.Compare('Hello', 'World!', false);
		 * ```
         * @returns {number} 1 for greater-than, -1 for less-than, and 0 for equal-to
         */
		Compare(LHS:string, RHS:string, invert:bool): CompareResult;

		CompareInsensitive(LHS:string, RHS:string): CompareResult;
		CompareArrays(LHS:string[], RHS:string[]): CompareResult;


		Format(message: string, ...args: Printable[]) : string;

		/** Iterates over each character in the two strings and returns the index at which they are different. */
		IndexOfDifference(LHS:string, RHS:string): int;
		IndexOfDifference(LHS:string, RHS:string, ignoreCase:bool): int;

		Similarity(LHS:string, RHS:string): int;

		IsWhiteSpace(input:string): bool;
	}

}
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Properties

Object.defineProperty(String.prototype, "lineCount", {
    get (this: String) {return this.match(/[\r\n]+/g)?.length ?? 0;},
    enumerable: false,
    configurable: true
}); 


Object.defineProperty(String.prototype, "IsEmpty", {
    get (this: String) {return this.length === 0;},
    enumerable: false,
    configurable: true
}); 

//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//instance methods

String.prototype.join = function join(this:string, ...args : any[]): string { return (args.length !== 0)? args.join(this) : ""; }



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




String.prototype.startsWithAny = function startsWithOne(this:string, prefixes: string[]): [boolean, string] {
	for (let p of prefixes) {
	  if (/\w/.test(p[0])) p = '\\b' + p;
	  if (/\w/.test(p.slice(-1))) p = p + '\\b';
	  
	  if ((new RegExp('^'+p, 'i')).test(this))
		return [true, p.replace(/\\b/g, '')];
	}
	return [false, this];
  }


  
String.prototype.findLastIndex = function (predicate: Func<[theChar: char], bool>, columnNumber?: number) {
    if (typeof columnNumber === 'undefined') columnNumber = this.length;
	
    for (let i = columnNumber; i >= 0; i--) {
        if (predicate(this[i])) return i;
    }

    return -1;
};








String.prototype.toPascalCase = function toPascalCase(this : string) : string {
	const match = this.match(/[a-z0-9]+/gi);
	if (!match) return this;
	return match.map((word) => 
		word.charAt(0).toUpperCase()
		+ word.substring(1).toLowerCase()
	).join('');
}
	

 String.prototype.toCamelCase = function toCamelCase(this : string) : string {
	const match = this.match(/[a-z0-9]+/gi);
	if (!match) return this;
	return match.map(
		(word, index) => ((index === 0)
			? word.toLowerCase()
			: word.charAt(0).toUpperCase()
				+ word.substring(1).toLowerCase()
		)
	).join('');
}


String.prototype.toSnakeCase = function toSnakeCase (this : string): string {
	const caseBoundary = /(\p{Ll})(\p{Lu})/gmu;
	const singleLetters = /(\p{Lu}|\p{N})(\p{Lu})(\p{Ll})/gmu;
	
	return (this
		.replace(caseBoundary, '$1_$2')
		.replace(singleLetters, '$1_$2$3')
		.toLocaleLowerCase()
	);
};

String.prototype.toTitleCase = function toTitleCase(this: string):string {
	return this.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

}




String.prototype.contains = function(this: string, match:string) : bool {
	return this.indexOf(match) !== -1;
}





//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Static methods
String.Equals = (LHS:string, RHS:string, ignoreCase:bool=false):bool => ((ignoreCase)
	? (LHS.toLowerCase() === RHS.toLowerCase()) 
	: (LHS === RHS)
);


String.Compare = (LHS:string, RHS:string, invert:bool = false): CompareResult => ((!invert)?
	(LHS < RHS)? CompareResult.Lesser :
	(LHS > RHS)? CompareResult.Greater :
	CompareResult.EqualTo
	:
	(LHS > RHS)? CompareResult.Lesser :
	(LHS < RHS)? CompareResult.Greater :
	CompareResult.EqualTo
);



String.CompareInsensitive = (LHS: string, RHS: string): CompareResult => LHS.localeCompare(RHS, undefined, {sensitivity: 'base'});

String.CompareArrays = function (a: string[], b: string[]): CompareResult {
	if (!a) return CompareResult.Lesser;
	if (!b) return CompareResult.Greater;
	const len1 = a.length;
	const len2 = b.length;
	if (len1 === len2) {
		for (let i = 0; i < len1; i++) {
			const res = String.Compare(a[i], b[i]);
			if (res !== CompareResult.EqualTo) return res;
		}
		return CompareResult.EqualTo;
	} else return NumberCompare(len1, len2);
}









export const ToCompareResult = (value:num) => (
	(value < 0)? CompareResult.Lesser :
	(value > 0)? CompareResult.Greater :
	CompareResult.EqualTo
);

export const NumberCompare = (LHS:num, RHS:num) => (
	(LHS < RHS)? CompareResult.Lesser :
	(LHS > RHS)? CompareResult.Greater :
	CompareResult.EqualTo
);




String.Format = (message: string, ...args: Printable[]): string => (
	(args.length === 0) ? message : 
	message.replace(/\{(\d+)\}/g, (match, indices) => `${args[indices[0]]}`)
);


String.IndexOfDifference = function (LHS:string, RHS:string, ignoreCase:bool=false): int {
	let i = 0;
	for (const len = Math.min(LHS.length, RHS.length); (i < len); ++i) {
		if (LHS.charCodeAt(i) !== RHS.charCodeAt(i) && !String.Equals(LHS.charAt(i), RHS.charAt(i), ignoreCase)) break;
	}
	return i;
}



String.Similarity = function (LHS:string, RHS:string): int {
	const [longer, shorter] = (LHS.length > RHS.length)? [LHS,RHS] : [RHS, LHS];
	const longerLength = longer.length;
	if (longerLength === 0) return 1.0;
	return (longerLength - editDistance(longer, shorter)) / longerLength;
}




const editDistance = (s1: string, s2: string) => {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();

	const costs = new Array<number>();
	for (let i = 0; i <= s1.length; i++) {
		let lastValue = i;
		for (let j = 0; j <= s2.length; j++) {
			if (i === 0) costs[j] = j;
			else if (j > 0) {
				const newValue = ((s1.charAt(i - 1) !== s2.charAt(j - 1))
					? (Math.min(Math.min(costs[j - 1], lastValue), costs[j])+1) 
					: costs[j - 1]
				);
				costs[j - 1] = lastValue;
				lastValue = newValue;
			}
		}
		if (i > 0) costs[s2.length] = lastValue;
	}
	return costs[s2.length];
};






String.IsWhiteSpace = (input:string) => input.trim().length === 0;















