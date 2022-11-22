import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import * as os from "os";
import { KeyValPair } from '../typings/Collections';
import { Endianness } from '../typings/BitFlags';
import { statSync } from 'fs';
import * as fs from 'fs';
import * as minimatch from 'minimatch';
// import { Color } from 'vscode';





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
	return arr.map(doClone);
}

function cloneObj(obj: object): any {
	return obj.mapObject((Key, value) => [Key, value]);
}


export function mergeObjects(target: any, ...sources: any[]): any {
	sources.forEach(source => { for (const key in source) target[key] = source[key]; });
	return target;
}













export function isWindows(): boolean {
	return process.platform === "win32";
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


/**
 * Convert string to snakeCase.  
 * first_second_third => firstSecondThird  
 * from {@link https://github.com/microsoft/vscode/blob/main/src/vs/editor/contrib/linesOperations/browser/linesOperations.ts}  
 * 
 * @param {string} value - string to transform to snakeCase
 * @returns {string} transformed value  
 */
 export function toSnakeCase (value : string): string {
	const caseBoundary = /(\p{Ll})(\p{Lu})/gmu;
	const singleLetters = /(\p{Lu}|\p{N})(\p{Lu})(\p{Ll})/gmu;
	
	return (value
		.replace(caseBoundary, '$1_$2')
		.replace(singleLetters, '$1_$2$3')
		.toLocaleLowerCase()
	);
};







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




export function lineLengthCompare(a: string, b: string): number {
	// Use Array.from so that multi-char characters count as 1 each
	const aLength = Array.from(a).length;
	const bLength = Array.from(b).length;
	if (aLength === bLength) {
	  return 0;
	}
	return aLength > bLength ? 1 : -1;
  }

export function caseInsensitiveCompare(a: string, b: string): number {
	return a.localeCompare(b, undefined, {sensitivity: 'base'});
}


export function reverseCompare(a: string, b: string): number {
	if (a === b) {
	return 0;
	}
	return a < b ? 1 : -1;
}







export function isValidHexColor(hex: string): boolean {
	if (hex.length === 0) return false;
	else if (/^#[0-9a-fA-F]{6}$/i.test(hex)) return true; // #rrggbb
	else if (/^#[0-9a-fA-F]{8}$/i.test(hex)) return true; // #rrggbbaa
	else if (/^#[0-9a-fA-F]{4}$/i.test(hex)) return true; // #rgba
	else if (/^#[0-9a-fA-F]{3}$/i.test(hex)) return true; // #rgb
	else return false;
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

export async function getInput(args: TokenArgs | undefined, message: string, validate: (str: string) => string | undefined){
    if (!args || !args.text) return vscode.window.showInputBox(<vscode.InputBoxOptions>{ prompt: message, validateInput: validate});
    else return Promise.resolve(args.text);
}

export async function showInputBox(placeHolder: string): Promise<string> {
	const input = await vscode.window.showInputBox(<vscode.InputBoxOptions>{ placeHolder: placeHolder });
	if (input === undefined) throw new Error("No input given");
	return input;
}


export async function showQuickPick(items: string[], placeHolder: string): Promise<string> {
	const item = await vscode.window.showQuickPick(items, <vscode.QuickPickOptions>{placeHolder: placeHolder});
	if (item === undefined) throw new Error("No item selected");
	return item;
}


export async function quickPickFromMap<T>(map: Map<string, T>, placeHolder: string, sort = true): Promise<T | undefined> {
	const keys: Array<string> = Array.from(map.keys());

	return vscode.window.showQuickPick(((sort)? keys.sort() : keys), <vscode.QuickPickOptions>{ placeHolder: placeHolder })
		.then((choice: string | undefined) => {
			if (choice === undefined) throw Error("No choice made."); // Ignore undefined
			return map.get(choice);
		}
	);
}




/**
 * Transforms the the selections of an editor into quick pick items.
 *
 * @param editor the text editor to get the selections from.
 */
export function selectionsToQuickPickItems(editor: vscode.TextEditor): vscode.QuickPickItem[] {
	return editor.selections.map((sel, i) => (<vscode.QuickPickItem>{
		label: i.toString()+': ',
		alwaysShow: true,
		description: editor.document.getText(sel).replace(/(\r?\n)+/g, " "),
	}));
}
  

/**
 * Prompts for text and returns it, while also managing history.
 *
 * @param title the title of the quick pick box.
 * @param prompt the placeholder text for the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
async function promptText(
	title: string,
	prompt: string,
	context: vscode.ExtensionContext,
	historyKey: string
) {
	const box = vscode.window.createQuickPick();
	const history = context.globalState.get<string[]>(historyKey) ?? [];
	box.title = title;
	box.placeholder = prompt;
	box.items = history.map((label) => ({ label }));

	try {
		const text = await new Promise<string>((resolve, reject) => {
			box.onDidAccept(() =>
				box.value.length
					? resolve(box.value)
					: box.selectedItems.length
						? resolve(box.selectedItems[0].label)
						: reject()
			);
			box.onDidHide(reject);
			box.show();
		});
		context.globalState.update(historyKey, [text, ...history.filter((str) => str !== text)]);
		return text;
	} finally { box.dispose(); }
}


/**
 * Prompts for a regular expression and returns it.
 *
 * @param title the title of the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
export async function promptRegexp(title: string, context: vscode.ExtensionContext, historyKey: string) {
	return new RegExp(await promptText(title, "Enter a regular expression", context, historyKey), "g");
}




/**
 * Prompts for a JS expression and returns a function which evaluates it.
 *
 * @param title the title of the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
export async function promptJS(
	title: string,
	context: vscode.ExtensionContext,
	historyKey: string
  ): Promise<(v: string, i: number, a: string[]) => any> {
	const expr = await promptText(
	  title,
	  "Enter a JS string (${v}: text, ${i}: index, ${a}: all texts)",
	  context,
	  historyKey
	);
	return new Function("v", "i", "a", `return \`${expr}\``) as any;
  }




// /**
//  * Prompts for ranges of selections within an editor.
//  *
//  * @param title the title of the quick pick box.
//  * @param editor the editor which contains the selections.
//  */
//  async function promptRanges(title: string, editor: vscode.TextEditor) {
// 	const box = vscode.window.createQuickPick();
// 	box.title = title;
// 	box.placeholder = "Enter comma-separated ranges (example: 0-2,5-6)";
// 	box.canSelectMany = true;
// 	box.items = selectionsToQuickPickItems(editor);
// 	box.onDidChangeValue((value) => {
// 	  const ranges = parseRanges(value);
// 	  box.selectedItems = box.items.filter((_, i) =>
// 		ranges.some(([min, max]) => i >= min && i <= max)
// 	  );
// 	});
// 	try {
// 	  return parseRanges(
// 		await new Promise<string>((resolve, reject) => {
// 		  box.onDidAccept(() =>
// 			box.value.length ? resolve(box.value) : reject()
// 		  );
// 		  box.onDidHide(reject);
// 		  box.show();
// 		})
// 	  );
// 	} finally {
// 	  box.dispose();
// 	}
//   }








// /**
//  * Prompts for indices, and ranges of indices, of selections within an editor.
//  *
//  * @param title the title of the quick pick box.
//  * @param editor the editor which contains the selections.
//  */
//  async function promptIndices(title: string, editor: TextEditor) {
// 	const box = window.createQuickPick();
// 	box.title = title;
// 	box.placeholder =
// 	  "Enter comma-separated indices or ranges (example: 0,1,2-3,4)";
// 	box.canSelectMany = true;
// 	box.items = selectionsToQuickPickItems(editor);
// 	box.onDidChangeValue((value) => {
// 	  const indices = parseIndices(value);
// 	  box.selectedItems = box.items.filter((_, i) => indices.has(i));
// 	});
// 	try {
// 	  return parseIndices(
// 		await new Promise<string>((resolve, reject) => {
// 		  box.onDidAccept(() =>
// 			box.value.length ? resolve(box.value) : reject()
// 		  );
// 		  box.onDidHide(reject);
// 		  box.show();
// 		})
// 	  );
// 	} finally {
// 	  box.dispose();
// 	}
//   }












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







export const notify = (message: string, log = false) => {
	vscode.window.showInformationMessage(message);
	if (log) {
	  Logger.info(message);
	}
  };


  export class Logger {
	private static _outputChannel: vscode.OutputChannel;
  
	static initialize() {
	  if (!this._outputChannel) {
		// Only init once
		this._outputChannel = vscode.window.createOutputChannel('Peacock');
	  }
	}
  
	static getChannel() {
	  this.initialize();
	  return this._outputChannel;
	}
  
	static info(value: string | object | undefined, indent = false, title = '') {
	  if (title) {
		this._outputChannel.appendLine(title);
	  }
	  const message = prepareMessage(value, indent);
	  this._outputChannel.appendLine(message);
	}
  }
  
  function prepareMessage(value: string | object | undefined, indent: boolean) {
	const prefix = indent ? '  ' : '';
	let text = '';
	if (typeof value === 'object') {
	  if (Array.isArray(value)) {
		text = `${prefix}${JSON.stringify(value, null, 2)}`;
	  } else {
		Object.entries(value).map(item => {
		  text += `${prefix}${item[0]} = ${item[1]}\n`;
		});
	  }
	  return text;
	}
	text = `${prefix}${value}`;
	return text;
  }




	
// /**
//  * Get all the findInCurrentFile or runInSearchPanel settings
//  * @param {String} setting - name of setting to retrieve
//  * @returns {Promise<object>} array of settings
//  */
// exports.getSettings = async function (setting) {
  
// 	const settings = await workspace.getConfiguration().get(setting);
// 	  let findArray = [];
  
// 	  if (settings) {
// 		  findArray = Object.entries(settings);
// 		  findArray = findArray.filter(current => (typeof current[0] === 'string'));
// 	  }
// 	  return findArray;
//   };














export interface Rename {
	uri: vscode.Uri;
	range: vscode.Range;
	newName: string;
}



export async function renameManyDocuments(renames: Rename[]): Promise<void> {
	const edit = new vscode.WorkspaceEdit();
	for (const r of renames) {
		const result: vscode.WorkspaceEdit = await renameDocument(r);
		// TODO how to combine file renames?
		for (const [uri, changes] of result.entries()) {
			for (const c of changes) edit.replace(uri, c.range, c.newText);
		}
	}
	await vscode.workspace.applyEdit(edit);
}


export async function renameDocument(rename: Rename): Promise<vscode.WorkspaceEdit> {
	return (await vscode.commands.executeCommand(
		"vscode.executeDocumentRenameProvider",
		rename.uri,
		rename.range.start,
		rename.newName
	)) as any;
}


export async function rename() {
	return vscode.commands.executeCommand("editor.action.rename");
}


export async function setContext(
	key: string,
	value: string | boolean
): Promise<void> {
	return (await vscode.commands.executeCommand("setContext", key, value)) as any;
}


export async function executeDocumentHighlights(
	uri: vscode.Uri,
	position: vscode.Position
): Promise<vscode.DocumentHighlight[]> {
	return (await vscode.commands.executeCommand(
		"vscode.executeDocumentHighlights",
		uri,
		position
	)) as any;
}

export async function executeCompletionItemProvider(
	uri: vscode.Uri,
	position: vscode.Position,
	triggerCharacter?: string
): Promise<vscode.CompletionList> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeCompletionItemProvider",
		uri,
		position,
		triggerCharacter
	);
	return result;
}

export async function executeDefinitionProvider(
	uri: vscode.Uri,
	position: vscode.Position
): Promise<vscode.LocationLink[]> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeDefinitionProvider",
		uri,
		position
	);
	return result;
}

export async function executeSignatureHelpProvider(
	uri: vscode.Uri,
	position: vscode.Position,
	triggerCharacter?: string
): Promise<vscode.SignatureHelp | undefined> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeSignatureHelpProvider",
		uri,
		position,
		triggerCharacter
	);
	return result;
}

export async function executeReloadWindow() {
	return vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export async function closeCurrentFileEditor(): Promise<unknown> {
	return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
}

export function openSettings(kind?: string) {
    vscode.commands.executeCommand("workbench.action.openSettings", kind ? `projectManager.${kind}` : "projectManager");
}


// workspace.onDidChangeConfiguration(() => {
// 	runInAction("Update Configuration", () => {
// 		VsCodeSettingResource.onConfigChange.emit();
// 	});
// });
























export function getProjects(itemsSorted: any[]): Promise<{}> {
    return new Promise((resolve) => resolve(itemsSorted));
}



/**
 * Returns the Uri of the active document
 * @export
 * @return {*}  {(Uri | undefined)}
 */
 export function getDocumentUri(): vscode.Uri | undefined {
    return vscode.window.activeTextEditor?.document.uri;
}


/**
 * Get the active document
 * @export
 * @return {*}  {(TextDocument | undefined)}
 */
 export function getActiveDocument(): vscode.TextDocument | undefined {
    return vscode.window.activeTextEditor?.document;
}




/**
 * Creates a new TextEditor containing the passed in text
 * @param {string} text
 * @returns {TextEditor}
 */
 export async function createNewEditor(text?: string): Promise<vscode.TextEditor> {
	return vscode.workspace.openTextDocument({ content: text, preview: true } as any).then(vscode.window.showTextDocument);

    // return new Promise(async (resolve, reject) => {
    //     await vscode.workspace.openTextDocument({ content: text, preview: true } as any).then(
    //         (doc) => resolve(vscode.window.showTextDocument(doc)),
    //         (err) => reject(err)
    //     );
    // });
}















/**
 * Writes text to the system clipboard
 * @export
 * @async
 * @param {string} textToCopy The text to add to the system clipboard
 */
 export async function writeClipboard(textToCopy: string): Promise<void> {
    return vscode.env.clipboard.writeText(textToCopy);
}


/**
 * Reads text from the system clipboard
 * @export
 * @async
 * @param {string} textToCopy The text to add to the system clipboard
 */
 export async function readClipboard(): Promise<string> {
    return vscode.env.clipboard.readText();
}



















export class FileInfo {
	isFile: boolean;
	constructor(public filePath: string, public file: string) {
	this.isFile = statSync(path.join(filePath, file)).isFile();
	}
}




/**
 * Returns the active file path
 * @export
 * @param {Uri} [uri] Optional URI to use instead of the active editor
 * @return {*}  {(string | undefined)}
 */
 export function getFilePath(uri?: vscode.Uri): string | undefined {
    let filePath: string | undefined;
    uri ? (filePath = uri.fsPath) : (filePath = getDocumentUri()?.fsPath);
    return filePath;
}

/**
 * Return the active file path relative to the workspace root.
 * If there is no active workspace, returns the file full path.
 * @export
 * @return {*}  {(string | undefined)}
 */
 export function getRelativeFilePath(): string | undefined {
    const filePath = getDocumentUri()?.fsPath;
    if (!filePath) {
        console.log("No active file found");
        return;
    }

    let relativeFilePath = vscode.workspace.asRelativePath(filePath);
    if (!relativeFilePath) {
        console.log("No active workspace found");
        return;
    }

    return relativeFilePath;
}
/**
 * 递归向上查找父目录
 * @param cwd
 * @param predicate
 */
export async function findParent(cwd: string, predicate: (dir: string) => Promise<boolean>): Promise<string | null> {
	if (await predicate(cwd)) {
	return cwd
	}
	const parent = path.dirname(cwd)
	if (parent === cwd) {
	return null
	}
	return findParent(parent, predicate)
}


// /**
//  * Copies the workspace path to the clipboard
//  * @export
//  * @async
//  * @return {*}  {Promise<void>}
//  */
//  export async function getWorkspaceRootPath(fileUri?: Uri): Promise<void> {
//     const workspaceRootFolder = getWorkspaceFolder(fileUri)?.uri.fsPath;
//     if (!workspaceRootFolder) {
//         log("No active workspace found");
//         return;
//     }

//     await writeClipboard(workspaceRootFolder);
//     return Promise.resolve();
// }



export function GlobSearch(editor : vscode.TextEditor, path : string) {
	// Support matches by filenames and relative file paths.
	const pattern = path.includes('/') || path.includes('\\') ? path : '**/' + path;
	const options = <minimatch.IOptions>{ nocase: (process.platform === 'win32') };
	return minimatch(vscode.workspace.asRelativePath(editor.document.fileName), pattern, options);
}


export const readHtml = async (htmlPath:string, panel: vscode.WebviewPanel) => (
	await fs.promises.readFile(htmlPath, 'utf-8'))
    .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
    .replace(/(src|href)="([^"]*)"/gu, (_, type, src) =>
		`${type}="${panel.webview.asWebviewUri(
			vscode.Uri.file(path.resolve(htmlPath, '..', src))
		)
	}"`
);

//. todoEditors.forEach(todoEditor => {
// const applicableConfigurations = configurations.filter(configuration =>
// 	Array.isArray(configuration.paths) && configuration.paths.some(path => {
// 		if (typeof path !== 'string') { return false; }

// 		// Support matches by filenames and relative file paths.
// 		const pattern = path.includes('/') || path.includes('\\') ? path : '**/' + path;
// 		const options: minimatch.IOptions = { nocase: process.platform === 'win32' };
// 		return minimatch(vscode.workspace.asRelativePath(todoEditor.document.fileName), pattern, options);
// 	}));



// /**
//  * Returns an usable document interaction from the given data.
//  *
//  * @param uri The url to the document to retrieve.
//  * @param Content The possible content of the document or interface to use
//  * @param languageID The Language ID associated to the documentated.
//  */
//  export function GetDocument(uri: string, Content: string | undefined = undefined, languageID: string = ""): vscode.TextDocument {
// 	if (Content == undefined) {
// 	  let doc = ConnectionManager.Documents.get(uri);
// 	  if (doc) return doc;
  
// 	  let Out: vscode.TextDocument | undefined;
  
// 	  //Reading file
// 	  let path = fileURLToPath(uri);
  
// 	  try {
// 		if (fs.existsSync(path)) {
// 		  Content = fs.readFileSync(path, "utf8");
// 		  Out = TextDocument.create(uri, languageID, 1, Content);
// 		}
// 	  } catch (err) {
// 		Console.Error(JSON.stringify(path));
// 	  }
  
// 	  if (Out === undefined) {
// 		Out = TextDocument.create(uri, languageID, 0, "");
// 	  }
  
// 	  return Out;
// 	}
// 	//Content is provided
// 	else if (typeof Content === "string") {
// 	  //string provided
// 	  return TextDocument.create(uri, languageID, 1, Content);
// 	}
  
// 	//The interface is provided
// 	return Content;
//   }
  


// /**Returns a given line in a file
//  * @param doc
//  * @param lineIndex
//  * @returns
//  */
//  export function getLine(doc: vscode.TextDocument, lineIndex: number): string {
// 	return doc.getText({
// 	  start: { line: lineIndex, character: 0 },
// 	  end: { line: lineIndex, character: Number.MAX_VALUE },
// 	});
//   }


// /** Loops over all the given documents
//  * @param uris
//  * @param callback
//  */
//  export function ForEachDocument(uris: string[], callback: (doc: TextDocument) => void): void {
// 	for (let index = 0; index < uris.length; index++) {
// 	  const element = uris[index];
// 	  let doc = GetDocument(element);
  
// 	  if (doc) callback(doc);
// 	}
//   }



/**
 * Get the configured root location for project repositories.
 *
 * Defaults to the users home directory if not configured.
 *
 * @returns The configured root location as a string.
 */
 function getRootLocations(config: vscode.WorkspaceConfiguration): string[] {
    let r: string[] | undefined = config.get("projectsRootLocation");
    let root: string[];
    if (r === undefined || r.length === 0) {
        root = [os.homedir()];
    } else {
        root = r;
    }
    console.log(`Root locations: ${root}`);
    return root;
}




/**
 * Have the user select the root location from the output of getRootLocations.
 *
 * @returns A promise that resolves with the selected item.
 */
 export async function getRootLocation(
    config: vscode.WorkspaceConfiguration
): Promise<string> {
    let choices: string[] = getRootLocations(config);
    // If there's only one choice don't prompt for the users input
    if (choices.length === 1) {
        return choices[0];
    }

    // Create a promise from the quick pick
    return await showQuickPick(choices, "Select root location");
}




/**
 * Get the configured location for code-workspace files.
 *
 * Defaults to a directory "~/ws/"
 *
 * @returns The configured location for core workspace files.
 */
 export  function getWSLocation(config: vscode.WorkspaceConfiguration): string {
    let d: string | undefined = config.get("workspaceFilesLocation");
    let dir: string;
    if (d === undefined || d === "") {
        dir = os.homedir + path.sep + "ws";
    } else {
        dir = d;
    }
    return dir;
}


// /**
//  * Get the code workspace file path for the given repo.
//  *
//  * @param repo The repo to get the code workspace file path for.
//  * @returns The code workspace file path as a string.
//  */
//  function getCodeWorkspacePath(
//     config: vscode.WorkspaceConfiguration,
//     repo: github.Repo
// ): string {
//     return [getWSLocation(config), repo.name + ".code-workspace"].join(path.sep);
// }




/**
 * Utility method to open the given path in the current VSCode window.
 *
 * @param filePath The file path to be opened in the current window.
 */
export async function openInThisWindow(filePath: string) {
    await vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(filePath),
        false
    );
}





// <Command>{
// 	command: "vscode.open",
// 	title: `Open ${match.str}`,
// 	arguments: [DocumentTools.GetFileUri(fullPath)],
// }










































// const vscodeVariables = require('vscode-variables');

export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | undefined,
        private readonly repeat: number,
        private readonly onSuccess: Array<Command> | undefined,
        private readonly onFail: Array<Command> | undefined,
        private readonly variableSubstitution: boolean
    ) {}

    public async execute() {
        try {
            if (this.args) {
                let args;
                if (this.variableSubstitution) {
                    args = this.substituteVariables(this.args);
                } else {
                    args = this.args;
                }
                for(let i = 0; i < this.repeat; i++) {
                    await vscode.commands.executeCommand(this.exe, args);
                }
            } else {
                for(let i = 0; i < this.repeat; i++) {
                    await vscode.commands.executeCommand(this.exe);
                }
            }
            if (this.onSuccess) {
                for (let command of this.onSuccess) {
                    await command.execute();
                }
            }
        } catch(e) {
            if (this.onFail) {
                for (let command of this.onFail) {
                    await command.execute();
                }
            } else {
                throw(e);
           }
        }
    }

    private substituteVariables(args: any ): any {
        if (typeof args === 'string') {
            args = args.replace(/\${userHome}/g, process.env['HOME'] || '');
            // return vscodeVariables(args);
        } else if (typeof args === 'object') {
            let rt: any = {};
            for(const key of Object.keys(args)) {
                rt[key] = this.substituteVariables(args[key]);
            }
            return rt;
        } else {
            return args;
        }
    }
    
}


export class MultiCommand {
    constructor(
        readonly id: string,
        readonly label: string | undefined,
        readonly description: string | undefined,
        readonly interval: number | undefined,
        readonly sequence: Array<Command>,
        readonly languages: Array<string> | undefined
    ) {}

    public async execute() {
        for (let command of this.sequence) {
            await command.execute();
            await delay(this.interval || 0);
        }
    }
}

function delay(ms: number) {
    if (ms > 0) return new Promise((resolve) => setTimeout(resolve, ms));
	else return Promise.resolve();
}






































// export interface ExecuteControllerOptions { openFileInEditor?: boolean; }
// export interface CommandConstructorOptions { relativeToRoot?: boolean; }
// export interface Command { execute(uri?: vscode.Uri): Promise<void>; }


// export interface DialogOptions {
//     prompt?: string;
//     uri?: vscode.Uri;
// }

// export interface ExecuteOptions {
//     fileItem: FileItem;
// }

// export interface GetSourcePathOptions {
//     relativeToRoot?: boolean;
//     ignoreIfNotExists?: boolean;
//     uri?: vscode.Uri;
// }

// export interface FileController {
//     showDialog(options?: DialogOptions): Promise<FileItem | FileItem[] | undefined>;
//     execute(options: ExecuteOptions): Promise<FileItem>;
//     openFileInEditor(fileItem: FileItem): Promise<vscode.TextEditor | undefined>;
//     closeCurrentFileEditor(): Promise<unknown>;
//     getSourcePath(options?: GetSourcePathOptions): Promise<string>;
// }

// export abstract class BaseCommand<T extends FileController> implements Command {
//     constructor(protected controller: T, readonly options?: CommandConstructorOptions) {}

//     public abstract execute(uri?: vscode.Uri): Promise<void>;

//     protected async executeController(
//         fileItem: FileItem | undefined,
//         options?: ExecuteControllerOptions
//     ): Promise<void> {
//         if (fileItem) {
//             const result = await this.controller.execute({ fileItem });
//             if (options?.openFileInEditor) {
//                 await this.controller.openFileInEditor(result);
//             }
//         }
//     }
// }


// export class FileItem {
//     // private SourcePath: Uri;
//     // private TargetPath: Uri | undefined;

//     // constructor(sourcePath: Uri | string, targetPath?: Uri | string, private IsDir: boolean = false) {
//     //     this.SourcePath = this.toUri(sourcePath);
//     //     if (targetPath !== undefined) {
//     //         this.TargetPath = this.toUri(targetPath);
//     //     }
//     // }

//     // get name(): string {
//     //     return path.basename(this.SourcePath.path);
//     // }

//     // get path(): Uri {
//     //     return this.SourcePath;
//     // }

//     // get targetPath(): Uri | undefined {
//     //     return this.TargetPath;
//     // }

//     // get exists(): boolean {
//     //     if (this.targetPath === undefined) {
//     //         return false;
//     //     }
//     //     return fs.existsSync(this.targetPath.fsPath);
//     // }

//     // get isDir(): boolean {
//     //     return this.IsDir;
//     // }

//     // public async move(): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     const edit = new WorkspaceEdit();
//     //     edit.renameFile(this.path, this.targetPath, { overwrite: true });
//     //     await workspace.applyEdit(edit);

//     //     this.SourcePath = this.targetPath;
//     //     return this;
//     // }

//     // public async duplicate(): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     await workspace.fs.copy(this.path, this.targetPath, { overwrite: true });

//     //     return new FileItem(this.targetPath, undefined, this.isDir);
//     // }

//     // public async remove(): Promise<FileItem> {
//     //     const edit = new WorkspaceEdit();
//     //     edit.deleteFile(this.path, { recursive: true, ignoreIfNotExists: true });
//     //     await workspace.applyEdit(edit);
//     //     return this;
//     // }

//     // public async create(mkDir?: boolean): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     if (this.exists) {
//     //         await workspace.fs.delete(this.targetPath, { recursive: true });
//     //     }

//     //     if (mkDir === true || this.isDir) {
//     //         await workspace.fs.createDirectory(this.targetPath);
//     //     } else {
//     //         await workspace.fs.writeFile(this.targetPath, new Uint8Array());
//     //     }

//     //     return new FileItem(this.targetPath, undefined, this.isDir);
//     // }

//     // private toUri(uriOrString: Uri | string): Uri {
//     //     return uriOrString instanceof Uri ? uriOrString : Uri.file(uriOrString);
//     // }
// }

























export interface IProgressStatus {
	steps: number;
	stepsMax: number;
	readonly increment: number;
	readonly progress: number;
  }
  
  
  export class ProgressStatus implements IProgressStatus {
	private stepsIntern: number;
	private stepsMaxIntern: number;
	private incrementIntern: number = 0;
	constructor(steps: number, stepsMax: number) {
	  this.stepsIntern = steps;
	  this.stepsMaxIntern = stepsMax;
	  this.updateIncrement(steps, this.stepsMax);
	}
	public get steps(): number { return this.stepsIntern; }
	public set steps(val: number) {
	  this.updateIncrement(val, this.stepsMax);
	  this.stepsIntern = val;
	}

	public get stepsMax(): number { return this.stepsMaxIntern; }
	public set stepsMax(val: number) {
	  this.updateIncrement(this.steps, val);
	  this.stepsMaxIntern = val;
	}

	public get increment(): number { return this.incrementIntern; }
	public get progress(): number { return this.steps / this.stepsMax; }

	private updateIncrement(steps: number, max: number) {
	  let progressNew = steps / max;
	  let progressOld = this.steps / this.stepsMax;
	  this.incrementIntern = progressNew - progressOld;
	}
  }

  
export type visualizerType = 'dialogBox' | 'statusBar';

interface IProgressVisualizer {
  progress(status: IProgressStatus): void;
  close(): void;
}

// Progress class
export class Progress {
	// Registered visualizers
	private static progressVisualizers = new Map<string, IProgressVisualizer>();
	public static autoCloseTimeout = 2000;

	public static showDialogBox<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void
	) {
	  ProgressDialogBox.show<T>(id, title, progressFormatter, cancellationHandler);
	}
  
	public static showStatusBar<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void,
	  icon?: Icon
	) {
	  ProgressStatusBarItem.show(id, title, progressFormatter, cancellationHandler, icon);
	}
  
	public static progress(id: string, status: IProgressStatus) {
	  this.progressVisualizers.get(id)?.progress(status);
	}
  
	public static close(id: string) {
	  const handler = this.progressVisualizers.get(id);
	  if (handler) {
		handler.close();
		this.remove(id);
	  }
	}
  
	private static remove(id: string) {
	  this.progressVisualizers.delete(id);
	}
  
	public static addVisualizer(id: string, visualizer: IProgressVisualizer) {
	  this.progressVisualizers.set(id, visualizer);
	}
  
  }








  
// DialogBox Variant
class ProgressDialogBox<T extends IProgressStatus> implements IProgressVisualizer {
	private lastProgress = 0;
	constructor(
	  private readonly progressHandler: (increment: number, message: string) => void,
	  private readonly progressFormatter: (status: T) => string,
	  private readonly closeHandler: () => void
	) {}
  
	public progress(status: T) {
	  let increment = status.progress > this.lastProgress ? status.increment : 0;
	  this.lastProgress = status.progress;
	  let message = this.progressFormatter(status);
	  this.progressHandler(100 * increment, message);
	}
  
	public close() { this.closeHandler(); }
  
	public static show<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void
	) {
	  vscode.window.withProgress(
		{
		  location: vscode.ProgressLocation.Notification,
		  title: title,
		  cancellable: cancellationHandler != undefined
		},
		(progress, token) => {
		  return new Promise<void>((resolve) => {
			// Final no response timeout:
			let createTimeout = (time: number) => setTimeout(resolve, time);
			let timeout = createTimeout(30000);
			token.onCancellationRequested(() => {
			  clearTimeout(timeout);
			  cancellationHandler?.();
			  resolve();
			});
			
			const progressHandler = (increment: number, message: string) => {
			  clearTimeout(timeout);
			  timeout = createTimeout(30000);
			  progress.report({ increment: increment, message: message });
			};
			const closeHandler = () => {
			  clearTimeout(timeout);
			  timeout = createTimeout(Progress.autoCloseTimeout);
			};
			Progress.addVisualizer(id, new ProgressDialogBox(progressHandler, progressFormatter, closeHandler));
		  });
		}
	  );
	}
  }
  
  // ProgressBar Variant
  class ProgressStatusBarItem<T extends IProgressStatus> implements IProgressVisualizer {
	private statusBarItem: vscode.StatusBarItem;
  
	constructor(
	  private readonly title: string,
	  private readonly progressFormatter: (status: T) => string,
	  private readonly closeHandler?: () => void,
	  private readonly maxSize?: number,
	  private readonly icon?: Icon
	) {
	  this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	}
  
	public progress(status: T) {
	  this.statusBarItem.text = `${this.getIconPlaceholder()} ${this.title} (${status.steps}/${status.stepsMax}) ${this.getAsciiProgress(status)}`.trimStart();
	  this.statusBarItem.tooltip = this.progressFormatter(status);
	  this.statusBarItem.show();
	}
  
	public close() {
	  this.closeHandler?.();
	  setTimeout(this.statusBarItem.hide, Progress.autoCloseTimeout);
	}
  
	private getAsciiProgress(status: T) {
	  let barCount = Math.min(status.stepsMax, this.maxSize || 15);
	  let preCount = Math.floor(status.progress * barCount);
	  let remCount = Math.floor((1 - status.progress) * barCount);
	  let midCount = barCount - preCount - remCount;
	  let pre = '█'.repeat(preCount);
	  let mid = '▓'.repeat(midCount);
	  let rem = '▒'.repeat(remCount);
	  return `${pre}${mid}${rem}`;
	}
  
	private getIconPlaceholder() {
	  return this.icon ? this.icon.toPlaceholder() : '';
	}
  
	public static show<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void,
	  icon?: Icon
	) {
	  Progress.addVisualizer(
		id,
		new ProgressStatusBarItem<T>(title, progressFormatter, cancellationHandler, undefined, icon)
	  );
	}
  }































class FileItem implements vscode.QuickPickItem {

	label: string;
	description: string;

	constructor(public base: vscode.Uri, public uri: vscode.Uri) {
		this.label = path.basename(uri.fsPath);
		this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
	}
}

class MessageItem implements vscode.QuickPickItem {

	label: string;
	description = '';
	detail: string;

	constructor(public base: vscode.Uri, public message: string) {
		this.label = message.replace(/\r?\n/g, ' ');
		this.detail = base.fsPath;
	}
}

  
async function pickFile() {
	const cp = await import('child_process');
	const disposables: vscode.Disposable[] = [];
	try {
		return await new Promise<vscode.Uri | undefined>((resolve, reject) => {
			const input = vscode.window.createQuickPick<FileItem | MessageItem>();
			input.placeholder = 'Type to search for files';
			let rgs: import('child_process').ChildProcess[] = [];
			disposables.push(
				input.onDidChangeValue(value => {
					rgs.forEach(rg => rg.kill());
					if (!value) {
						input.items = [];
						return;
					}
					input.busy = true;
					const cwds = vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [process.cwd()];
					const q = process.platform === 'win32' ? '"' : '\'';
					rgs = cwds.map(cwd => {
						const rg = cp.exec(`rg --files -g ${q}*${value}*${q}`, { cwd }, (err, stdout) => {
							const i = rgs.indexOf(rg);
							if (i !== -1) {
								if (rgs.length === cwds.length) input.items = [];
								if (!err) input.items = input.items.concat(stdout
									.split('\n').slice(0, 50)
									.map(relative => new FileItem(vscode.Uri.file(cwd), vscode.Uri.file(path.join(cwd, relative))))
								);
								if (err && !(<any>err).killed && (<any>err).code !== 1 && err.message) {
									input.items = input.items.concat([new MessageItem(vscode.Uri.file(cwd), err.message)]);
								}
								rgs.splice(i, 1);
								if (!rgs.length) input.busy = false;
							}
						});
						return rg;
					});
				}),



				input.onDidChangeSelection(items => {
					const item = items[0];
					if (item instanceof FileItem) {
						resolve(item.uri);
						input.hide();
					}
				}),



				input.onDidHide(() => {
					rgs.forEach(rg => rg.kill());
					resolve(undefined);
					input.dispose();
				})
			);
			input.show();
		});
	} finally {
		disposables.forEach(d => d.dispose());
	}
}










export async function SearchBoxInput(message:string, placeHolder:string = 'Type to search') {
	const InputBox = vscode.window.createInputBox();
	InputBox.prompt = message;
	InputBox.placeholder = placeHolder;
	InputBox.ignoreFocusOut = true;

	const disposables: vscode.Disposable[] = [];
	try { return await new Promise<string | undefined>((resolve) => {
		disposables.push(
			InputBox.onDidAccept(() => {

			}),
			InputBox.onDidChangeValue((value) => {

			}),
			InputBox.onDidHide(() => {
				resolve(undefined);
				InputBox.dispose();
			}),
		);
		
	
	
	
	
	});
	} finally { disposables.forEach(d => d.dispose()); }
}