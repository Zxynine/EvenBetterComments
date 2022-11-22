













export const enum RegexFlags {
	G = 'g',
	I = 'i',
	M = 'm',
	S = 's',
	U = 'u',
	Y = 'y'
}

export function buildRegexFlags(...Flags : RegexFlags[]) {
	return [...new Set(Flags)].join();
  }
  


/**
 * Replace linebreaks with the one whitespace symbol.
 */
 export function replaceLinebreaks(str: string, replaceSymbol: string): string {
	return str.replace(/[\n\r\t]+/g, replaceSymbol);
}

/**
 * Escapes regular expression characters in a given string
 */
 export function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}


// https://stackoverflow.com/a/6969486/2544290
export function escapeRegex(string : string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}





export const validRegexFlags = ['i','m','s','u'];

/**
 * @typedef SearchResult
 * @property {import('vscode').Selection} cursorSelection
 * @property {import('vscode').Range} matchRange
 */



/**
 * @param {string} searchInput
 * @returns {RegExp}
 */
 export function createPlainSeachRegex(searchInput:string, flags:string) {
	return new RegExp(escapeRegex(searchInput), flags);
  }
/**
 * @param {string} searchInput
 * @param {string} flags
 * @returns {{errMsg: string, regex: RegExp}}
 */
 export function createRegexSearchRegex(searchInput:string, flags:string) {
	try {
	  return {regex: new RegExp(searchInput, flags)};
	}
	catch(err : any) {
	  return {errMsg: `Invalid regex input.\n${err.message}`};
	}
  }








  
/**
 * Parses numeric ranges from a string.
 *
 * @param text the text to parse from.
 */
function parseRanges(text: string): [number, number][] {
	return text.split(",").map((str) => {
	  const match = str.match(/(\d+)-(\d+)/);
	  return (match)? [parseInt(match[1]), parseInt(match[2])] : [-1,-1];
	});
  }