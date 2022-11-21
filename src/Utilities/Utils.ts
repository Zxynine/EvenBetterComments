import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import { KeyValPair } from '../typings/Collections';
import { Endianness } from '../typings/BitFlags';
import { statSync } from 'fs';
// import { Color } from 'vscode';


/**
 * Escapes regular expression characters in a given string
 */
export function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}




/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
 export function parseMappings(mappings: { [key: string]: string }): KeyValPair<string,string>[] {
	return Object.entries(mappings).map(([Key, Val]) => ({ Key, Val }));
}





/**
 * Replace ${workspaceRoot} with workfolder.uri.path
 *
 * @param mappings
 * @param workfolder
 */
export function replaceWorkspaceFolder(mappings: KeyValPair<string,string>[], workfolder?: vscode.WorkspaceFolder): KeyValPair<string,string>[] {
	const rootPath = workfolder?.uri.path;
	if (rootPath) {
		// Replace placeholder with workspace folder
		return mappings.map(({ Key, Val }) => ({
			Key, Val: replaceWorkspaceFolderWithRootPath(Val, rootPath),
		}));
	} else {
		// Filter items out which contain a workspace root
		return mappings.filter(({ Val }) => !valueContainsWorkspaceFolder(Val));
	}
}

/**
 * Replaces both placeholders with the rootpath
 * - ${workspaceRoot}    // old way and only legacy support
 * - ${workspaceFolder}  // new way
 *
 * @param value
 * @param rootPath
**/
function replaceWorkspaceFolderWithRootPath(value: string, rootPath: string) {
	return value.replace('${workspaceRoot}', rootPath).replace('${workspaceFolder}', rootPath);
}

function valueContainsWorkspaceFolder(value: string): boolean {
	return value.includes('${workspaceFolder}') || value.includes('${workspaceRoot}');
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
	sources.forEach(source => { for (const key in source) target[key] = source[key]; });
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







/**
 * Checks whether the input value is the type 'string'
 */
export function IsString(item:unknown): item is String {return typeof item === 'string';}

/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export function IsStringArray(value: unknown): value is string[] {return Array.isArray(value) && (<unknown[]>value).every(elem => IsString(elem));}


/**
 * Checks whether the input value is a integer. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false. The number '1.0' yields true. The number '1.1' yields false.
 */
export function IsInteger(value : unknown) : value is int { return IsNumber(value) && Math.floor(value) === value; }

/**
 * Checks whether the input value is a number. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false.
 */
export function IsNumber(value : unknown) : value is number { return typeof value === 'number'; }

/**
 * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
 */
export function IsTypedArray(obj: unknown): obj is Object {
	const TypedArray = Object.getPrototypeOf(Uint8Array);
	return typeof obj === 'object' && obj instanceof TypedArray;
}

/**
 * @returns whether the provided parameter is an Iterable, casting to the given generic
 */
export function IsIterable<T>(obj: unknown): obj is Iterable<T> {
	return !!obj && typeof (obj as any)[Symbol.iterator] === 'function';
}

/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
export function IsBoolean(obj: unknown): obj is boolean { return (obj === true || obj === false); }

/**
 * @returns whether the provided parameter is undefined.
 */
export function IsUndefined(obj: unknown): obj is undefined { return (typeof obj === 'undefined'); }

/**
 * @returns whether the provided parameter is null.
 */
export function IsNull(obj: unknown): obj is null { return (obj === null); }


/**
 * @returns whether the provided parameter is undefined or null.
 */
export function IsUndefinedOrNull(obj: unknown): obj is undefined|null { return (IsUndefined(obj) || obj === null); }

/**
 * @returns whether the provided parameter is defined.
 */
export function IsDefined<T>(arg: T | null | undefined): arg is T { return !IsUndefinedOrNull(arg); }



/**
 * @returns whether the provided parameter is a JavaScript Function or not.
 */
export function IsFunction(obj: unknown): obj is Function {return (typeof obj === 'function');}


/**
 * @returns whether the provided parameters is are JavaScript Function or not.
 */
export function AreFunctions(...objects: unknown[]): boolean { return objects.length > 0 && objects.every(IsFunction); }


// type TrailingCommaOption = "none" | "es5" | "all";

// export type PackageManagers = "npm" | "yarn" | "pnpm";


// type PrettierSupportLanguage = {
// 	vscodeLanguageIds?: string[];
// 	extensions?: string[];
// 	parsers: string[];
//   };
//   type PrettierFileInfoResult = {
// 	ignored: boolean;
// 	inferredParser?: PrettierBuiltInParserName | null;
//   };
//   type PrettierBuiltInParserName = string;
//   type PrettierResolveConfigOptions = ResolveConfigOptions;
//   type PrettierOptions = Options;
//   type PrettierFileInfoOptions = FileInfoOptions;
  
//   type PrettierModule = {
// 	format(source: string, options?: Options): string;
// 	getSupportInfo(): { languages: PrettierSupportLanguage[] };
// 	getFileInfo(
// 	  filePath: string,
// 	  options?: PrettierFileInfoOptions
// 	): Promise<PrettierFileInfoResult>;
//   };

  
// export type PrettierVSCodeConfig = IExtensionConfig & Options;

// export class TemplateService {
// 	constructor(
// 	// private loggingService: LoggingService,
// 	private prettierModule: PrettierModule
// 	) {}
// 	public async writeConfigFile(folderPath: Uri) {
// 	const settings = { tabWidth: 2, useTabs: false };

// 	const outputPath = Uri.joinPath(folderPath, ".prettierrc");

// 	const formatterOptions: PrettierOptions = {
// 		/* cspell: disable-next-line */
// 		filepath: outputPath.scheme === "file" ? outputPath.fsPath : undefined,
// 		tabWidth: settings.tabWidth,
// 		useTabs: settings.useTabs,
// 	};

// 	const templateSource = this.prettierModule.format(
// 		JSON.stringify(settings, null, 2),
// 		formatterOptions
// 	);

// 	// this.loggingService.logInfo(`Writing .prettierrc to '${outputPath}'`);
// 	await workspace.fs.writeFile(outputPath, new TextEncoder().encode(templateSource));
// 	}
// }

// export type createConfigFileFunction = () => Promise<void>;

// export const createConfigFile = (templateService: TemplateService): createConfigFileFunction=>
//   async () => {
//     const folderResult = await vscode.window.showOpenDialog({
//       canSelectFiles: false,
//       canSelectFolders: true,
//       canSelectMany: false,
//     });
//     if (folderResult && folderResult.length === 1) {
//       const folderUri = folderResult[0];
//       await templateService.writeConfigFile(folderUri);
//     }
//   };















export class FileInfo {
	isFile: boolean;
	constructor(public filePath: string, public file: string) {
	this.isFile = statSync(path.join(filePath, file)).isFile();
	}
}

// function filterFile(filename: string, config: Config) {
// 	if (config.showHiddenFiles) {
// 	return true;
// 	}

// 	return !isFileHidden(filename, config);
// }

// function isFileHidden(filename: string, config: Config) {
// 	return filename.startsWith('.') || isFileHiddenByVsCode(filename, config);
// }


// // files.exclude has the following form. key is the glob
// // {
// //    "**//*.js": true
// //    "**//*.js": true "*.git": true
// // }
// function isFileHiddenByVsCode(filename: string, config: Config) {
// 	if (!config.filesExclude) {
// 	return false;
// 	}

// 	for (const key of Object.keys(config.filesExclude)) {
// 	if (minimatch(filename, key)) {
// 		return true;
// 	}
// 	}
// 	return false;
// }












export function reverseEndianness(arr: Uint8Array): void {
	for (let i = 0, len = arr.length; i < len; i += 4) {
		// flip bytes 0<->3 and 1<->2
		const b0 = arr[i + 0];
		const b1 = arr[i + 1];
		const b2 = arr[i + 2];
		const b3 = arr[i + 3];
		arr[i + 0] = b3;
		arr[i + 1] = b2;
		arr[i + 2] = b1;
		arr[i + 3] = b0;
	}
}























/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
 export function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[] {
	const before = target.slice(0, insertIndex);
	const after = target.slice(insertIndex);
	return before.concat(insertArr, after);
}







export function strcmp(a: string, b: string): number {
	if (a < b) {
		return -1;
	}
	if (a > b) {
		return 1;
	}
	return 0;
}


export function strArrCmp(a: string[] | null, b: string[] | null): number {
	if (a === null && b === null) {
		return 0;
	}
	if (!a) {
		return -1;
	}
	if (!b) {
		return 1;
	}
	const len1 = a.length;
	const len2 = b.length;
	if (len1 === len2) {
		for (let i = 0; i < len1; i++) {
			let res = strcmp(a[i], b[i]);
			if (res !== 0) return res;
		}
		return 0;
	} else return len1 - len2;
}



export function isValidHexColor(hex: string): boolean {
	if (hex.length === 0) return false;
	else if (/^#[0-9a-fA-F]{6}$/i.test(hex)) return true; // #rrggbb
	else if (/^#[0-9a-fA-F]{8}$/i.test(hex)) return true; // #rrggbbaa
	else if (/^#[0-9a-fA-F]{4}$/i.test(hex)) return true; // #rgba
	else if (/^#[0-9a-fA-F]{3}$/i.test(hex)) return true; // #rgb
	else return false;
}


/**
 * Replace linebreaks with the one whitespace symbol.
 */
 export function replaceLinebreaks(str: string, replaceSymbol: string): string {
	return str.replace(/[\n\r\t]+/g, replaceSymbol);
}










export function hash(value: string | undefined): number {
    let hash: number = 0;
 
    if (!value || value.length === 0) return hash;
    for (let i = 0; i < value.length; i++, hash = hash&hash) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
    }
    return hash;
}















export interface TokenArgs {
    text?: string
}

export function getInput(args: TokenArgs | undefined, message: string, validate: (str: string) => string | undefined){
    if (!args || !args.text){
        return vscode.window.showInputBox({
            prompt: message,
            validateInput: validate
        });
    } else return Promise.resolve(args.text);
}








export function ToBinaryString(nMask:number) {
    // nMask must be between -2147483648 and 2147483647
    if (nMask > 2**32-1)  throw "number too large. number shouldn't be > 2**31-1"; //added
    if (nMask < -1*(2**31)) throw "number too far negative, number shouldn't be < 2**31" //added
    for (var nFlag = 0, sMask=''; (nFlag < 32); nFlag++, nMask <<= 1) sMask += String(nMask >>> 31);
    sMask=sMask.replace(/\B(?=(.{8})+(?!.))/g, " ") // added
    return sMask;
}




export function *ToBits(number:number, bitOrder:Endianness = Endianness.LittleEndian) {
	if (bitOrder === Endianness.LittleEndian)
		for (let b=31; b>=0; --b) yield (((number & (1<<b)) !== 0))? 1 : 0;
	else 
		for (let b=0; b<=31; ++b) yield (((number & (1<<b)) !== 0))? 1 : 0;
}