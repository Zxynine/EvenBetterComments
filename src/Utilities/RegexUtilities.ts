
import * as vscode from 'vscode';












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
 export function parseRanges(text: string): [number, number][] {
	return text.split(",").map((str) => {
	  const match = str.match(/(\d+)-(\d+)/);
	  return (match)? [parseInt(match[1]), parseInt(match[2])] : [-1,-1];
	});
  }




  
  export function countWordInstances(text: string, word: string): number {
	return text.split(word).length - 1;
  }









  
export function stringifyRegex() {
    let options = { prompt: 'Enter a valid regular expression.', placeHolder: '(.*)' };
    vscode.window.showInputBox(options).then(input => {
        if (input) {
            // Strip forward slashes if regex string is enclosed in them
            input = (input.startsWith('/') && input.endsWith('/')) ? input.slice(1, -1) : input;
            try {
                const jString = JSON.stringify(new RegExp(input).toString().slice(1, -1));
                vscode.window.showInformationMessage('JSON-escaped RegEx: ' + jString, 'Copy to clipboard').then(choice => {
                    if (choice && choice === 'Copy to clipboard') vscode.env.clipboard.writeText(jString);
                });
            } catch (err: any) { vscode.window.showErrorMessage(err.message); }
        }
    });
}








export const toRegexGlobal = (expr: any) => {
    if (expr instanceof RegExp) {
        let flags = expr.flags;
        if (!flags.contains("g")) flags += "g";
        return new RegExp(expr, flags);
    } else if (typeof expr === "string" || String instanceof expr) {
        return new RegExp(expr, "g");
    } else throw new Error(expr.toString() + " isn't a regex or string!");
};

export const findAll = (text: string, expr: RegExp | string) => {
    return Array.from(text.matchAll(toRegexGlobal(expr)));
};