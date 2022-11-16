import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import { KeyValPair } from '../typings/Collections';
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
 */
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
export function IsString(item:any): item is String {return typeof item === 'string';}


/**
 * Checks whether the input value is a integer. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false. The number '1.0' yields true. The number '1.1' yields false.
 */
 export function IsInteger(value : any) : value is int { return IsNumber(value) && Math.floor(value) === value; }

/**
 * Checks whether the input value is a number. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false.
 */
 export function IsNumber(value : any) : value is number { return typeof value === 'number'; }




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
