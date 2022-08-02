import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';


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
	const r: any[] = [];
	for (let i = 0, len = arr.length; i < len; i++) r[i] = doClone(arr[i]);
	return r;
}

function cloneObj(obj: any): any {
	let r: any = {};
	for (const key in obj) r[key] = doClone(obj[key]);
	return r;
}




export function mergeObjects(target: any, ...sources: any[]): any {
	sources.forEach(source => {
		for (const key in source) target[key] = source[key];
	});
	return target;
}



/**
 * Emulate delay with async setTimeout().
 */
 export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));



 

 export function getWorkspaceRelativePath( filePath: string, pathToResolve: string) {
	// In case the user wants to use ~/.prettierrc on Mac
	if (process.platform === 'darwin' && pathToResolve.startsWith('~') && homedir()) {
		return pathToResolve.replace(/^~(?=$|\/|\\)/, homedir());
	} else if (vscode.workspace.workspaceFolders) {
		const folder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
		return ((folder)
			? (path.isAbsolute(pathToResolve))
				? pathToResolve
				: path.join(folder.uri.fsPath, pathToResolve)
			: undefined
		);
	} else return undefined;
  }







  

		
/**
 * Convert string to PascalCase.  
 * first_second_third => FirstSecondThird  
 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/snippet/snippetParser.ts}  
 * 
 * @param {string} value - string to transform to PascalCase  
 * @returns {string} transformed value  
 */
export function toPascalCase(value : string) : string {
	const match = value.match(/[a-z0-9]+/gi);
	if (!match) return value;
	return match.map((word) => 
		word.charAt(0).toUpperCase()
		+ word.substring(1).toLowerCase()
	).join('');
}
	

	
/**
 * Convert string to camelCase.  
 * first_second_third => firstSecondThird  
 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/snippet/snippetParser.ts}  
 * 
 * @param {string} value - string to transform to camelCase
 * @returns {string} transformed value  
 */
export function toCamelCase(value : string) : string {
	const match = value.match(/[a-z0-9]+/gi);
	if (!match) return value;
	return match.map(
		(word, index) => ((index === 0)
			? word.toLowerCase()
			: word.charAt(0).toUpperCase()
				+ word.substring(1).toLowerCase()
		)
	).join('');
}









export const MarkdownFormat = {
	MARKDOWN_SPACE: "&nbsp;",
	/** Returns a bolded markdown text. */
	toBold: (text: string): string => `**${text}**`,
	/** Return an italicized markdown text. */
	toItalic: (text:string):string => `*${text}*`,
	/** Return a bolded and italicized markdown text. */
	toBoldItalic: (text:string):string => `***${text}***`,
	/** Returns an indented markdown text. */
	indent: (text: string): string => `    ${text}`,
	/** Returns a text as a markdown bullet. Used for list items. */
	toBullet: (text: string): string => `  * ${text}`,
	/** Returns a text as a markdown code. */
	toCode: (text: string): string => `\`${text}\``,
	/** Returns a text as a markdown code with multiple lines. */
	toFencedCode: (text: string): string => `\`\`\`\n${text}\n\`\`\``,
	/** Returns a text as a blockquote. */
	toBlockQuote: (text: string): string => `> ${text}`,
	/** Return markdown text with a striketrhough format. */
	toStrikethrough: (text:string):string => `~~${text}~~`,
}
