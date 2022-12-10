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




















export function lineLengthCompare(a: string, b: string): number {
	// Use Array.from so that multi-char characters count as 1 each
	const aLength = Array.from(a).length;
	const bLength = Array.from(b).length;
	if (aLength === bLength) return 0;
	return aLength > bLength ? 1 : -1;
}






export function isValidHexColor(hex: string): boolean {
	if (hex.length === 0) return false;
	else if (/^#[0-9a-fA-F]{6}$/i.test(hex)) return true; // #rrggbb
	else if (/^#[0-9a-fA-F]{8}$/i.test(hex)) return true; // #rrggbbaa
	else if (/^#[0-9a-fA-F]{4}$/i.test(hex)) return true; // #rgba
	else if (/^#[0-9a-fA-F]{3}$/i.test(hex)) return true; // #rgb
	else return false;
}






export function hash(value: string): number {
    let hash: number = 0;
 
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i++, hash = hash&hash) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
    }
    return hash;
}








// 'JKL' -> '4a4b4c'
export function hexEncode (theString: string) {
	// let theString = getSelectionString();
	if (!theString)
		{return;}

    let theArrary = Buffer.from(theString, 'ascii');

    let hexArrary: string[] = [];
    theArrary.forEach(value => {
        hexArrary.push(value.toString(16))
    });

    const resultString = hexArrary.join('')
    return resultString;
    
	// setSelectionString(resultString);
}

// '4a4b4c' -> 'JKL'
export function hexDecode (theString: string) {
	// let theString = getSelectionString();
	if (!theString)
		{return;}

    let theArrary = Buffer.from(theString, 'hex')

    let charArrary: string[] = [];
    theArrary.forEach(value => {
        charArrary.push(String.fromCharCode(value))
    });

    const resultString = charArrary.join('')
    return resultString;
	// setSelectionString(resultString);
}


// /**
//  * Returns the file extension part or an empty string 
//  * if there is none.
//  */
//  export function getFileExtension(filename: string): string {
// 	if (!filename)
// 	  return;
// 	let ext = '', temp = '';
// 	for (let i = filename.length - 1; i >= 0; --i) {
// 	  let char = filename[i];
// 	  if (char === '.') {
// 		ext = temp; // avoid filename without extension
// 		break;
// 	  }
// 	  temp = char + temp;
// 	}
// 	return ext;
//   }
  
//   /**
//    * Returns the folder name part of a file path.
//    * @param path  The file path.
//    */
//   export function getFolderName(path: string): string {
// 	if (!path)
// 	  return;
// 	// Remove the last dash (/)
// 	if(path[path.length - 1] === '\\' || path[path.length - 1] === '/')
// 	  path = path.substr(0, path.length - 1);
	  
// 	let ext = '', temp = '';
// 	for (let i = path.length - 1; i >= 0; --i) {
// 	  let char = path[i];
// 	  if (char === '/' || char === '\\') {
// 		ext = temp;
// 		break;
// 	  }
// 	  temp = char + temp;
// 	}
// 	return ext;
//   }





// String.Format = function (message: string, args: (Printable)[]): string {
// 	let result: string;

// 	if (args.length === 0) {
// 		result = message;
// 	} else {
// 		result = message.replace(/\{(\d+)\}/g, (match, rest) => {
// 			const index = rest[0];
// 			const arg = args[index];
// 			let result = match;
// 			if (typeof arg === 'string') {
// 				result = arg;
// 			} else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
// 				result = String(arg);
// 			}
// 			return result;
// 		});
// 	}

// 	return result;
// }









// const hashCode = (str: string) => { 
//     var hash = 0;
//     for (var i = 0; i < str.length; i++) {
//        hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return hash;
// } ;

// const intToRGB = (i: number) => {
//     var c = (i & 0x00FFFFFF)
//         .toString(16)
//         .toUpperCase();

//     return "00000".substring(0, 6 - c.length) + c;
// };




// const invertHex = (hex?: string) => {
// 	if (!hex) {
// 	  return;
// 	}
  
// 	return Number(hex.replace("#", "0x")) > 0xffffff / 2 ? "#000000" : "#ffffff";
//   };




export function normalizeDiacritical(text: String) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}


// export async function normalizeDiacriticalMarks(textEditor: vscode.TextEditor) {
//     const ranges = textEditor.selections
//     const orderedRanges = Region.makeOrderedRangesByStartPosition(ranges)

//     const normalizedText = []
//     for (const range of orderedRanges) {
//         const text = normalizeDiacritical(textEditor.document.getText(range))
//         normalizedText.push(text)
//     }
//     Modify.replaceRangesWithText(textEditor, orderedRanges, normalizedText)
// }


export function removeControlCharacters(text: string) {
	// eslint-disable-next-line no-control-regex
	return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}









export function truncate(value: string, maxLength: number, suffix = '…'): string {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.substr(0, maxLength)}${suffix}`;
}





/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
 export function trim(haystack: string, needle: string = ' '): string {
	const trimmed = ltrim(haystack, needle);
	return rtrim(trimmed, needle);
}


/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
export function ltrim(haystack: string, needle: string): string {
	if (!haystack || !needle) return haystack;

	const needleLen = needle.length;
	if (needleLen === 0 || haystack.length === 0) {
		return haystack;
	}

	let offset = 0;

	while (haystack.indexOf(needle, offset) === offset) {
		offset = offset + needleLen;
	}
	return haystack.substring(offset);
}


/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
 export function rtrim(haystack: string, needle: string): string {
	if (!haystack || !needle) return haystack;

	const needleLen = needle.length, haystackLen = haystack.length;

	if (needleLen === 0 || haystackLen === 0) {
		return haystack;
	}

	let offset = haystackLen, idx = -1;

	while (true) {
		idx = haystack.lastIndexOf(needle, offset - 1);
		if (idx === -1 || idx + needleLen !== offset)  break;
		if (idx === 0)  return '';
		offset = idx;
	}

	return haystack.substring(0, offset);
}



















/**
 * @returns the length of the common prefix of the two strings.
 */
 export function commonPrefixLength(a: string, b: string): number {

	const len = Math.min(a.length, b.length);
	let i: number;

	for (i = 0; i < len; i++) {
		if (a.charCodeAt(i) !== b.charCodeAt(i)) {
			return i;
		}
	}

	return len;
}

/**
 * @returns the length of the common suffix of the two strings.
 */
export function commonSuffixLength(a: string, b: string): number {

	const len = Math.min(a.length, b.length);
	let i: number;

	const aLastIndex = a.length - 1;
	const bLastIndex = b.length - 1;

	for (i = 0; i < len; i++) {
		if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
			return i;
		}
	}

	return len;
}










export function getNLines(str: string, n = 1): string {
	if (n === 0) {
		return '';
	}

	let idx = -1;
	do {
		idx = str.indexOf('\n', idx + 1);
		n--;
	} while (n > 0 && idx >= 0);

	if (idx === -1) {
		return str;
	}

	if (str[idx - 1] === '\r') {
		idx--;
	}

	return str.substr(0, idx);
}








/**
 * Produces 'a'-'z', followed by 'A'-'Z'... followed by 'a'-'z', etc.
 */
 export function singleLetterHash(n: number): string {
	const LETTERS_CNT = (CharCode.Z - CharCode.A + 1);

	n = n % (2 * LETTERS_CNT);

	if (n < LETTERS_CNT) {
		return String.fromCharCode(CharCode.a + n);
	}

	return String.fromCharCode(CharCode.A + n - LETTERS_CNT);
}












// /**
//  * Strips single and multi line JavaScript comments from JSON
//  * content. Ignores characters in strings BUT doesn't support
//  * string continuation across multiple lines since it is not
//  * supported in JSON.
//  * @param content the content to strip comments from
//  * @returns the content without comments
//  */
//  export function stripComments(content: string): string;

// (function () {
// 	function factory(path, os, productName, cwd) {
// 		// First group matches a double quoted string
// 		// Second group matches a single quoted string
// 		// Third group matches a multi line comment
// 		// Forth group matches a single line comment
// 		// Fifth group matches a trailing comma
// 		const regexp = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;

// 		/**
// 		 *
// 		 * @param {string} content
// 		 * @returns {string}
// 		 */
// 		function stripComments(content) {
// 			return content.replace(regexp, function (match, _m1, _m2, m3, m4, m5) {
// 				// Only one of m1, m2, m3, m4, m5 matches
// 				if (m3) {
// 					// A block comment. Replace with nothing
// 					return '';
// 				} else if (m4) {
// 					// Since m4 is a single line comment is is at least of length 2 (e.g. //)
// 					// If it ends in \r?\n then keep it.
// 					const length = m4.length;
// 					if (m4[length - 1] === '\n') {
// 						return m4[length - 2] === '\r' ? '\r\n' : '\n';
// 					}
// 					else {
// 						return '';
// 					}
// 				} else if (m5) {
// 					// Remove the trailing comma
// 					return match.substring(1);
// 				} else {
// 					// We match a string
// 					return match;
// 				}
// 			});
// 		}
// 		return {
// 			stripComments
// 		};
// 	}


// 	if (typeof define === 'function') {
// 		// amd
// 		define([], function () { return factory(); });
// 	} else if (typeof module === 'object' && typeof module.exports === 'object') {
// 		// commonjs
// 		module.exports = factory();
// 	} else {
// 		console.trace('strip comments defined in UNKNOWN context (neither requirejs or commonjs)');
// 	}
// })();







/**
 * Trim leading and ending spaces on every line
 * See https://blog.stevenlevithan.com/archives/faster-trim-javascript for
 * possible ways of implementing trimming
 *
 * @param text a multiline string
 */
 export function trimMultiLineString(text: string): string {
    return text.replace(/^\s\s*/gm, '').replace(/\s\s*$/gm, '')
}



/**
 * Counts how often `character` occurs inside `value`.
 */
 export function count(value: string, character: string): number {
	let result = 0;
	const ch = character.charCodeAt(0);
	for (let i = value.length - 1; i >= 0; i--) {
		if (value.charCodeAt(i) === ch) result++;
	}
	return result;
}







export function countWordInstances(text: string, word: string): number {
	return text.split(word).length - 1;
  }




export function stripWildcards(pattern: string): string {
	return pattern.replace(/\*/g, '');
}






/**
 * Returns first index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
 export function firstNonWhitespaceIndex(str: string): number {
	for (let i = 0, len = str.length; i < len; i++) {
		const chCode = str.charCodeAt(i);
		if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
			return i;
		}
	}
	return -1;
}




/**
 * Returns last index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
 export function lastNonWhitespaceIndex(str: string, startIndex: number = str.length - 1): number {
	for (let i = startIndex; i >= 0; i--) {
		const chCode = str.charCodeAt(i);
		if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
			return i;
		}
	}
	return -1;
}








const IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
/**
 * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
 */
export function isBasicASCII(str: string): boolean {
	return IS_BASIC_ASCII.test(str);
}




export const UNUSUAL_LINE_TERMINATORS = /[\u2028\u2029]/; // LINE SEPARATOR (LS) or PARAGRAPH SEPARATOR (PS)
/**
 * Returns true if `str` contains unusual line terminators, like LS or PS
 */
 export function containsUnusualLineTerminators(str: string): boolean {
	return UNUSUAL_LINE_TERMINATORS.test(str);
}













/**
 * ellipsis the text.
 * @param str string to cut
 */
export function ellipsis(str: string, maxCharacters: number): string {
	return str.length > maxCharacters ? `${str.substring(0, maxCharacters)}...` : str;
}























const _formatRegexp = /{(\d+)}/g;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
export function format(value: string, ...args: any[]): string {
	if (args.length === 0) {
		return value;
	}
	return value.replace(_formatRegexp, function (match, group) {
		const idx = parseInt(group, 10);
		return isNaN(idx) || idx < 0 || idx >= args.length ?
			match :
			args[idx];
	});
}

const _format2Regexp = /{([^}]+)}/g;

/**
 * Helper to create a string from a template and a string record.
 * Similar to `format` but with objects instead of positional arguments.
 */
export function format2(template: string, values: Record<string, unknown>): string {
	return template.replace(_format2Regexp, (match, group) => (values[group] ?? match) as string);
}




//https://github.com/gitkraken/vscode-gitlens/blob/main/src/system/string.ts










interface ReturnHash {
	line: number;
	column: number;
  }
  
  export default function getLineAndColumnFromIndex(str : string, index : number) : ReturnHash | null {
	let lines = str.split('\n');
  
	let cumulativeLength = 0;
  
	for (let i = 0; i < lines.length; i++) {
		let currLine = lines[i];
  
		let currLineLength = currLine.length + 1; // Have to add one because the newline character was removed when we split
  
		if (cumulativeLength + currLineLength > index) {
		  let line = i;
		  let column = index - cumulativeLength;
  
		  return {line, column}
		}
		
		cumulativeLength += currLineLength;
	}
  
	return null;
  }














export function equalsIgnoreCase(a: string, b: string): boolean {
    const len1 = a ? a.length : 0;
    const len2 = b ? b.length : 0;

    if (len1 !== len2) {
        return false;
    }

    return doEqualsIgnoreCase(a, b);
}
  
function doEqualsIgnoreCase(a: string, b: string, stopAt = a.length): boolean {
    for (let i = 0; i < stopAt; i++) {
        const codeA = a.charCodeAt(i);
        const codeB = b.charCodeAt(i);

        if (codeA === codeB) continue;

        // a-z A-Z
        if (CharCodes.IsLetter(codeA) && CharCodes.IsLetter(codeB)) {
            const diff = Math.abs(codeA - codeB);
            if (diff !== 0 && diff !== 32) {
                return false;
            }
        }

        // Any other charcode
        else {
            if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
                return false;
            }
        }
    }

    return true;
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
    const candidateLength = candidate.length;
    if (candidate.length > str.length) {
        return false;
    }

    return doEqualsIgnoreCase(str, candidate, candidateLength);
}