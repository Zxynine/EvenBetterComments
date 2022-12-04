import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';
import * as os from "os";
import { KeyValPair } from '../typings/Collections';
import { Endianness } from '../typings/BitFlags';
import { statSync } from 'fs';
import * as fs from 'fs';
import { showQuickPick } from './Input';
import * as process from 'process';
// import { Color } from 'vscode';
import { sleep } from './Async';


//: Idea- insert key should align multiselect cursors.


/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
 export function parseMappings(mappings: { [key: string]: string }): KeyValPair<string,string>[] {
	return Object.entries(mappings).map(([Key, Val]) => ({ Key, Val }));
}



/**
 *
 * @param aS The set of
 * @param bS
 */
export function setsAreEqual(aS: Set<any>, bS: Set<any>) {
	// Stop early
	if (aS.size !== bS.size) return false;

	// Check every key
	for (const a of aS) {
		if (!bS.has(a)) return false;
	}

	// Sets are equal
	return true;
}







export class CodeActionCreator {
    public constructor(
        private document: vscode.TextDocument,
        private range: vscode.Range | vscode.Selection,
        private context: vscode.CodeActionContext
    ) { }

    public create(title: string, command: string, kind: vscode.CodeActionKind) {
        return {
            title,
            kind,
            command: 'extension.contextMenu',
            arguments: [this.document, this.range, this.context, command]
        };
    }

	public static createArray(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, constructor:Func<[Builder:CodeActionCreator], any[]>) {
		const Builder = new CodeActionCreator(document, range, context);
		return constructor(Builder);
	}
}








export function hasOwnProperty(arg: {}, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(arg, key);
}







export const entries = <T extends LooseRecord<unknown>>(value: T) => Object.entries(value) as { [K in keyof Concrete<T>]: [K, T[K]]; }[keyof T][];

export const keys = <T extends LooseRecord<unknown>>(value: T) => Object.keys(value) as (keyof T)[];

export const values = <T extends LooseRecord<unknown>>(value: T) => Object.values(value) as T[keyof T][];








export function swap(array: any[], a: number, b: number) {
	/* const temp = array[a];
	array[a] = array[b];
	array[b] = temp; */
	[array[a], array[b]] = [array[b], array[a]];
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




/**
 * Copy object or array (hopefully without circular references).
 */
 export function deepCopy<T>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}




/**
 * Calls `JSON.Stringify` with a replacer to break apart any circular references.
 * This prevents `JSON`.stringify` from throwing the exception
 *  "Uncaught TypeError: Converting circular structure to JSON"
 */
 export function safeStringify(obj: any): string {
	const seen = new Set<any>();
	return JSON.stringify(obj, (key, value) => {
		if (isObject(value) || Array.isArray(value)) {
			if (seen.has(value)) return '[Circular]';
			else seen.add(value);
		}
		return value;
	});
}



/**
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
 export function isObject(obj: unknown): obj is Object {
	// The method can't do a type cast since there are type (like strings) which
	// are subclasses of any put not positvely matched by the function. Hence type
	// narrowing results in wrong results.
	return typeof obj === 'object'
		&& obj !== null
		&& !Array.isArray(obj)
		&& !(obj instanceof RegExp)
		&& !(obj instanceof Date);
}

/**
 * @returns whether the provided parameter is an empty JavaScript Object or not.
 */
 export function isEmptyObject(obj: unknown): obj is object {
	const hasOwnProperty = Object.prototype.hasOwnProperty;
	if (!isObject(obj)) return false;

	for (const key in obj) {
		if (hasOwnProperty.call(obj, key)) return false;
	}

	return true;
}





export function deepClone<T>(obj: T): T {
	if (!obj || typeof obj !== 'object' || obj instanceof RegExp) return obj;
	const result: any = Array.isArray(obj) ? [] : {};
	Object.entries(obj).forEach(([key, value]) => {
		result[key] = (value && typeof value === 'object') ? deepClone(value) : value;
	});
	return result;
}

/** Prevents the modification of existing property attributes and values, and prevents the addition of new properties. */
export function deepFreeze<T>(obj: T): T {
	if (!obj || typeof obj !== 'object') return obj;
	const stack: any[] = [obj];
	while (stack.length > 0) {
		const obj = stack.shift();
		Object.freeze(obj);
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				const prop = obj[key];
				if (typeof prop === 'object' && !Object.isFrozen(prop) && !isTypedArray(prop)) {
					stack.push(prop);
				}
			}
		}
	}
	return obj;
}






/**
 * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
 */
 export function isTypedArray(obj: unknown): obj is Object {
	return typeof obj === 'object' && obj instanceof Object.getPrototypeOf(Uint8Array);
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
 * Converts null to undefined, passes all other values through.
 */
 export function withNullAsUndefined<T>(x: T | null): T | undefined {
	return x === null ? undefined : x;
}

/**
 * Converts undefined to null, passes all other values through.
 */
export function withUndefinedAsNull<T>(x: T | undefined): T | null {
	return typeof x === 'undefined' ? null : x;
}

/**
 * @returns whether the provided parameter is an Iterable, casting to the given generic
 */
 export function isIterable<T>(obj: unknown): obj is Iterable<T> {
	return !!obj && typeof (obj as any)[Symbol.iterator] === 'function';
}

/**
 * Checks whether the input value is the type 'string'
 */
export function IsCharacter(item:unknown): item is Character { return typeof item === 'string' && (item.length === 1 || /^.$/.test(item)); }

/**
 * Checks whether the input value is the type 'string'
 */
export function IsString(item:unknown): item is String { return typeof item === 'string'; }

/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export function IsStringArray(value: unknown): value is string[] { return Array.isArray(value) && (value).every(elem => IsString(elem)); }

/**
 * Checks whether the input value is a integer. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false. The number '1.0' yields true. The number '1.1' yields false.
 */
export function IsInteger(number: unknown): number is Integer { return Number.isInteger(number); }

/**
 * Checks whether the input value is a number. Anything that could be parsed as a number will yield false.
 * Example: The string '1' yields false.
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export function IsNumber(value : unknown) : value is number { return typeof value === 'number' && !isNaN(value); }

/**
 * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
 */
export function IsTypedArray(obj: unknown): obj is Object { return typeof obj === 'object' && obj instanceof Object.getPrototypeOf(Uint8Array); }

/**
 * @returns whether the provided parameter is an Iterable, casting to the given generic
 */
export function IsIterable<T>(obj: unknown): obj is Iterable<T> { return !!obj && typeof (obj as any)[Symbol.iterator] === 'function'; }

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



/**
 * Return `true` when item is an object (NOT Array, NOT null, NOT undefined)
 */
 export function isSimpleObject(item: unknown): item is Record<string, unknown> {
	return (item !== undefined && item !== null && !Array.isArray(item) && typeof item === 'object');
}


export function isThenable<T>(obj: unknown): obj is Promise<T> {
	return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}











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
















export function getIconPath(type: string, theme: 'light' | 'dark') {
    const iconPath = path.join(__filename, '..', '..', '..', '..', 'icons', theme, type.toLowerCase() + '.svg');
    if (fs.existsSync(iconPath)) return iconPath;
    return path.join(__filename, '..', '..', '..', '..', 'icons', theme, 'todo.svg');
}
















export const doubleWidthCharsReg =/[\uAC00-\uD7A3\u2010\u2012-\u2016\u2020-\u2022\u2025-\u2027\u2030\u2035\u203B\u203C\u2042\u2047-\u2049\u2051\u20DD\u20DE\u2100\u210A\u210F\u2121\u2135\u213B\u2160-\u216B\u2170-\u217B\u2215\u221F\u22DA\u22DB\u22EF\u2305-\u2307\u2312\u2318\u23B0\u23B1\u23BF-\u23CC\u23CE\u23DA\u23DB\u2423\u2460-\u24FF\u2600-\u2603\u2609\u260E\u260F\u2616\u2617\u261C-\u261F\u262F\u2668\u2672-\u267D\u26A0\u26BD\u26BE\u2702\u273D\u273F\u2740\u2756\u2776-\u277F\u2934\u2935\u29BF\u29FA\u29FB\u2B1A\u2E3A\u2E3B\u2E80-\u9FFF\uF900-\uFAFF\uFB00-\uFB04\uFE10-\uFE19\uFE30-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6\u{1F100}-\u{1F10A}\u{1F110}-\u{1F12E}\u{1F130}-\u{1F16B}\u{1F170}-\u{1F19A}\u{1F200}-\u{1F251}\u{2000B}-\u{2F9F4}]/gu;


export const calculateColumnFromCharIndex = (
	lineText: string,
	charIndex: number,
	tabSize: number,
): number => {
	let spacing = 0;
	for (let index = 0; index < charIndex; index++) {
		spacing += ((lineText.charAt(index) === "\t")? (tabSize - (spacing % tabSize)) : 1);
	}
	return spacing;
};

export const calculateCharIndexFromColumn = (
	lineText: string,
	column: number,
	tabSize: number,
): number => {
	let spacing = 0;
	for (let index = 0; index <= column; index++) {
		if (spacing >= column) return index;
		spacing += ((lineText.charAt(index) === "\t")? (tabSize - (spacing % tabSize)) : 1);
	}
	return spacing;
};










// export function tabsToSpaces(text: string) {
// 	vscode.window.activeTextEditor?.ind
// }




export function getCurrentThemeLightness(): 'light' | 'dark' {
	return (vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light)? 'light' : 'dark';
}



// //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape
// export function svgToDataUrl(xml: string): string {
//     // We have to call encodeURIComponent and unescape because SVG can includes non-ASCII characters.
//     // We have to encode them before converting them to base64.
//     const svg64 = Buffer.from(unescape(encodeURIComponent(xml)), 'binary').toString('base64')
//     const b64Start = 'data:image/svg+xml;base64,'
//     return b64Start + svg64
// }


// export const notify = (message: string, log = false) => {
// 	vscode.window.showInformationMessage(message);
// 	if (log) Logger.info(message);
//   };


//   export class Logger {
// 	private static _outputChannel: vscode.OutputChannel;
  
// 	static initialize() {
// 	  if (!this._outputChannel) {
// 		// Only init once
// 		this._outputChannel = vscode.window.createOutputChannel('Peacock');
// 	  }
// 	}
  
// 	static getChannel() {
// 	  this.initialize();
// 	  return this._outputChannel;
// 	}
  
// 	static info(value: string | object | undefined, indent = false, title = '') {
// 	  if (title) this._outputChannel.appendLine(title);
// 	  const message = prepareMessage(value, indent);
// 	  this._outputChannel.appendLine(message);
// 	}
//   }
  
//   function prepareMessage(value: string | object | undefined, indent: boolean) {
// 	const prefix = indent ? '  ' : '';
// 	let text = '';
// 	if (typeof value === 'object') {
// 	  if (Array.isArray(value)) {
// 		text = `${prefix}${JSON.stringify(value, null, 2)}`;
// 	  } else {
// 		Object.entries(value).map(item => {
// 		  text += `${prefix}${item[0]} = ${item[1]}\n`;
// 		});
// 	  }
// 	  return text;
// 	}
// 	text = `${prefix}${value}`;
// 	return text;
//   }




	
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






export namespace Debug {
	export const ExtentionTitle = 'EvenBetterComments: ';
	export function FormatMessage(message:unknown): string;
	export function FormatMessage(message:unknown, delimeter: string = "", ...args: unknown[]): string {
		return (ExtentionTitle + [message, ...args].join(delimeter));
	}

	export function GetTimeStamp(): string { // Ex: "22/11/2022, 22:16:50"
		return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date());
	}

		
	/**
	 * Converts an error value to a string.
	 *
	 * @param err The error.
	 * @return The error as string.
	 */
	export function ErrorToString(err: Exception): string {
		return `[${Debug.GetTimeStamp()}] ${err.name}: '${err.message}'\n\n${err.stack}`;
	}



	export const enum Type {
		Info, Warning, Error
	}


	/**
	 * Show an information message to users. Optionally provide an array of items which will be presented as
	 * clickable buttons.
	 *
	 * @param message The message to show.
	 * @param logType The type of message to display (Default is Information message).
	 * @param buttons A set of items that will be rendered as actions in the message.
	 * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
	 */

	

	export function Log(message:string) : Thenable<undefined>;
	export function Log<T extends vscode.MessageItem>(message:string, ...buttons: T[]) : Thenable<undefined|T>;
	export function Log<T extends vscode.MessageItem>(message:string, logType:Type, ...buttons: T[]) : Thenable<undefined|T>;
	export function Log(message:string, logType:Type, ...buttons: string[]) : Thenable<undefined|string>;
	export function Log(message:string, logType:Type=Type.Info, ...buttons: any[]) : Thenable<undefined|any> {
		switch (logType) {
			case Type.Info: return vscode.window.showInformationMessage(message, ...buttons);
			case Type.Warning: return vscode.window.showWarningMessage(message, ...buttons);
			case Type.Error: return vscode.window.showErrorMessage(message, ...buttons);
		}
	}

	export function LogInfo(message:string) : Thenable<undefined>;
	export function LogInfo<T extends vscode.MessageItem>(message:string, ...buttons: T[]): Thenable<undefined|T>;
	export function LogInfo(message:string, ...buttons: string[]): Thenable<undefined|string>;
	export function LogInfo(message:string, ...buttons: any[]): Thenable<undefined|any> {
		return vscode.window.showInformationMessage(message, ...buttons);
	}
	
	export function LogWarning(message:string) : Thenable<undefined>;
	export function LogWarning<T extends vscode.MessageItem>(message:string, ...buttons: T[]): Thenable<undefined|T>;
	export function LogWarning(message:string, ...buttons: string[]): Thenable<undefined|string>;
	export function LogWarning(message:string, ...buttons: any[]): Thenable<undefined|any> {
		return vscode.window.showWarningMessage(message, ...buttons);
	}

	
	export function LogError(message:string) : Thenable<undefined>;
	export function LogError<T extends vscode.MessageItem>(message:string, ...buttons: T[]): Thenable<undefined|T>;
	export function LogError(message:string, ...buttons: string[]): Thenable<undefined|string>;
	export function LogError(message:string, ...buttons: any[]): Thenable<undefined|any> {
		return vscode.window.showErrorMessage(message, ...buttons);
	}

	//........................................................................

	export function LogException(exception: Exception) : Thenable<undefined>;
	export function LogException<T extends vscode.MessageItem>(exception: Exception, ...buttons: T[]) : Thenable<undefined|T>;
	export function LogException(exception: Exception, ...buttons: string[]) : Thenable<undefined|string>;
	export function LogException(exception: Exception, ...buttons: any[]) : Thenable<undefined|any> {
		return vscode.window.showErrorMessage(`[${Debug.GetTimeStamp()}] Exception occured! Stack: ${exception.stack}`, ...buttons);
	}
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




export async function copyWholeBuffer(statusBarTimeout : number = 5000) {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        const lineNumber = activeEditor.document.lineCount;
        await vscode.env.clipboard.writeText(activeEditor.document.getText());
        vscode.window.setStatusBarMessage(`${lineNumber} lines copied`, statusBarTimeout);
    }
}

























// export function getProjects(itemsSorted: any[]): Promise<{}> {
//     return new Promise((resolve) => resolve(itemsSorted));
// }



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
}








export const getDefaultURI = () => (vscode.workspace.workspaceFolders?.[0].uri);

export function getPath(activeEditor: vscode.TextEditor) {
    return _getPath(activeEditor, false).fsPath;
}

export function getPathWithLine(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, false);
    return `${active.fsPath}:${active.line}`;
}

export function getPathWithLineColumn(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, false);
    return `${active.fsPath}:${active.line}:${active.col}`;
}

export function getDirectoryPath(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, false);
    return dirname(active.fsPath, active.path);
}

export function getRelativePath(activeEditor: vscode.TextEditor) {
    return _getPath(activeEditor, true).fsPath;
}

export function getRelativePathWithLine(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, true);
    return `${active.fsPath}:${active.line}`;
}

export function getRelativePathWithLineColumn(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, true);
    return `${active.fsPath}:${active.line}:${active.col}`;
}

export function getRelativeDirectoryPath(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, true);
    return dirname(active.fsPath, active.path);
}

export function getFilename(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, true);
    return basename(active.fsPath, true, active.path);
}

export function getFilenameBase(activeEditor: vscode.TextEditor) {
    const active = _getPath(activeEditor, true);
    return basename(active.fsPath, false, active.path);
}



function _getPath(activeEditor: vscode.TextEditor, relative: boolean) {
    const uri = activeEditor.document.uri;
    let fsPath = relative ? relativePathToWorkspace(uri) : uriToFsPath(uri);

    const platformPath = getPlatformPath(uri);
    if (platformPath === path.win32) fsPath = fsPath.replace(/\//g, "\\"); // Replace all / to \

    const activePos = activeEditor.selection.active;
    const line = activePos.line;
    const col = activePos.character;
    return { fsPath, path: platformPath, line, col };
}




export const osFileOpener = async (uri: vscode.Uri | undefined) => {
    if (!uri) return;

    const files = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: uri,
    });

    if (!files || files.length === 0)  return;
    return await vscode.workspace.fs.readFile(files[0]);
};



function dirname(fsPath: string, path: path.PlatformPath) {
    return path.dirname(fsPath) + path.sep;
}

function basename(fsPath: string, withExt: boolean, path: path.PlatformPath) {
	return path.basename(fsPath, ((withExt)? path.extname(fsPath) : undefined));
}

/**
 * Get the platform path base on the uri.
 *
 * This is similar with the assumption in `uriToFsPath`. If the path has drive letter
 * or is an UNC path, assumed the uri to be a Windows path.
 */
 function getPlatformPath(uri: vscode.Uri) {
    const fsPath = uriToFsPath(uri);
    return (hasDriveLetter(fsPath) || isUNC(fsPath))? path.win32 : path.posix;
}



// export function basename(path: string): string {
// 	const idx = ~path.lastIndexOf('/') || ~path.lastIndexOf('\\');
// 	if (idx === 0) {
// 		return path;
// 	} else if (~idx === path.length - 1) {
// 		return basename(path.substring(0, path.length - 1));
// 	} else {
// 		return path.substring(~idx + 1);
// 	}
// }




function isUNC(fsPath: string) {
    if (fsPath.length >= 3) {
        // Checks \\localhost\shares\ddd
        //        ^^^
        return (
            CharCodes.IsSlash(fsPath.charCodeAt(0)) &&
            CharCodes.IsSlash(fsPath.charCodeAt(1)) &&
            !CharCodes.IsSlash(fsPath.charCodeAt(2))
        );
    }
    return false;
}


function hasDriveLetter(fsPath: string, offset = 0): boolean {
    if (fsPath.length >= 2 + offset) {
        // Checks C:\Users
        //        ^^
        return (
			CharCodes.IsLetter(fsPath.charCodeAt(0+offset)) &&
            fsPath.charCodeAt(1+offset) === CharCode.Colon 
        );
    }
    return false;
}

/**
 * Compute the closest relative path of the input uri to the workspace folder(s).
 *
 * When there are no workspace folders or when the path
 * is not contained in them, the input is returned.
 *
 * This similar to the `workspace.asRelativePath` that the relative path is always
 * going to use `/`. However, one difference is if we need to return input path,
 * it will always be `/` (won't normalized to `\` if the host is on Windows).
 * So we can handle the case if we are remoting into a Windows machine from *nix.
 */
 function relativePathToWorkspace(uri: vscode.Uri) {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    return folder
        ? relativePath(folder.uri, uri) ?? uriToFsPath(uri)
        : uriToFsPath(uri);
}

/**
 * Compute `fsPath` with slash normalized to `/` for the given uri.
 *
 * This is what vscode uses internally to compute uri.fsPath; however,
 * backslash conversion for Windows host is removed, and drive letter is always normalized to uppercase.
 *
 * The problems with the internal `uri.fsPath`:
 *  - Windows machine remoting into a linux will return a `\` as separator
 *  - *nix machine remoting into a windows will return `/` as separator
 *
 * Modified from https://github.com/microsoft/vscode/blob/f74e473238aca7b79c08be761d99a0232838ca4c/src/vs/base/common/uri.ts#L579-L604
 */
 function uriToFsPath(uri: vscode.Uri): string {
    let value: string;
    if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
        // unc path: file://shares/c$/far/boo
        value = `//${uri.authority}${uri.path}`;
    } else if (
        // e.g. local file and vscode-remote file
        uri.path.charCodeAt(0) === CharCode.Slash &&
        hasDriveLetter(uri.path, 1)
    ) {
        // windows drive letter: file:///c:/far/boo
        // Normalized drive letter -> C:/far/boo
        value = uri.path[1].toUpperCase() + uri.path.substr(2);
    } else {
        // other path
        value = uri.path;
    }
    return value;
}


/**
 * Modified from https://github.com/microsoft/vscode/blob/f74e473238aca7b79c08be761d99a0232838ca4c/src/vs/base/common/network.ts#L9-L79
 */
 export const enum UriScheme {
    File = "file",
    VscodeRemote = "vscode-remote",
}

/**
 * Compute the relative path of two uris.
 *
 * This differs from the vscode version is that this doesn't normalize slash for Windows; therefore,
 * we can use posix path to compute relative instead of host machine specific path.
 *
 * Modified from https://github.com/microsoft/vscode/blob/f74e473238aca7b79c08be761d99a0232838ca4c/src/vs/base/common/resources.ts#L228-L249
 */
function relativePath(from: vscode.Uri, to: vscode.Uri, ignorePathCasing = false): string | undefined {
	if (from.scheme !== to.scheme || !String.Equals(from.authority, to.authority, true)) return undefined;
	if (from.scheme === UriScheme.File) return path.posix.relative(uriToFsPath(from), uriToFsPath(to));
	let fromPath = from.path || "/";
	const toPath = to.path || "/";
	if (ignorePathCasing) {
		// make casing of fromPath match toPath
		const i = String.IndexOfDifference(fromPath, toPath, true);
		fromPath = toPath.slice(0, i) + fromPath.slice(i);
	}
	return path.posix.relative(fromPath, toPath);
}







export class FileInfo {
	isFile: boolean;
	constructor(public filePath: string, public file: string) {
		this.isFile = statSync(path.join(filePath, file)).isFile();
	}
}









function assertTargetPath(targetPath: vscode.Uri | undefined): asserts targetPath is vscode.Uri {
    if (targetPath === undefined) throw new Error("Missing target path");
}

export class FileItem {
    private SourcePath: vscode.Uri;
    private TargetPath: vscode.Uri | undefined;

    constructor(sourcePath: vscode.Uri | string, targetPath?: vscode.Uri | string, private IsDir: boolean = false) {
        this.SourcePath = this.toUri(sourcePath);
        if (targetPath !== undefined) this.TargetPath = this.toUri(targetPath);
    }

    get name(): string { return path.basename(this.SourcePath.path); }
    get path(): vscode.Uri { return this.SourcePath; }
    get targetPath(): vscode.Uri | undefined { return this.TargetPath; }
    get exists(): boolean { return (this.targetPath !== undefined) && fs.existsSync(this.targetPath.fsPath); }
    get isDir(): boolean { return this.IsDir; }

    public async move(): Promise<FileItem> {
        assertTargetPath(this.targetPath);

        const edit = new vscode.WorkspaceEdit();
        edit.renameFile(this.path, this.targetPath, { overwrite: true });
        await vscode.workspace.applyEdit(edit);

        this.SourcePath = this.targetPath;
        return this;
    }

    public async duplicate(): Promise<FileItem> {
        assertTargetPath(this.targetPath);

        await vscode.workspace.fs.copy(this.path, this.targetPath, { overwrite: true });
        return new FileItem(this.targetPath, undefined, this.isDir);
    }

    public async remove(): Promise<FileItem> {
        const edit = new vscode.WorkspaceEdit();
        edit.deleteFile(this.path, { recursive: true, ignoreIfNotExists: true });
        await vscode.workspace.applyEdit(edit);
        return this;
    }

    public async create(mkDir?: boolean): Promise<FileItem> {
        assertTargetPath(this.targetPath);

        if (this.exists) await vscode.workspace.fs.delete(this.targetPath, { recursive: true });

		await ((mkDir === true || this.isDir)
			? vscode.workspace.fs.createDirectory(this.targetPath)
			: vscode.workspace.fs.writeFile(this.targetPath, new Uint8Array())
		);

        return new FileItem(this.targetPath, undefined, this.isDir);
    }

    private toUri(UriOrString: vscode.Uri | string): vscode.Uri {
        return UriOrString instanceof vscode.Uri ? UriOrString : vscode.Uri.file(UriOrString);
    }
}
















/**
 * Returns the active file path
 * @export
 * @param {Uri} [uri] Optional URI to use instead of the active editor
 * @return {*}  {(string | undefined)}
 */
 export function getFilePath(uri?: vscode.Uri): string | undefined {
    return (uri)? uri.fsPath : getDocumentUri()?.fsPath;
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
	if (await predicate(cwd)) return cwd
	const parent = path.dirname(cwd)
	if (parent === cwd) return null
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
    const r: string[] | undefined = config.get("projectsRootLocation");
	const root: string[] = (r !== undefined && r.length !== 0)? r : [os.homedir()];
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
    if (choices.length === 1) return choices[0];

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
    const d: string | undefined = config.get("workspaceFilesLocation");
    return (d !== undefined && d !== "")? d : os.homedir + path.sep + "ws";
}





/**
 * Utility method to open the given path in the current VSCode window.
 *
 * @param filePath The file path to be opened in the current window.
 */
export async function openInThisWindow(filePath: string) {
    await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(filePath), false);
}



export function getWorkspaceFoldersPaths(): string[] {
	return (vscode.workspace.workspaceFolders?.map((wf) => wf.uri.path) ?? []);
}


export function hasWorkspaceAnyFolder(): boolean {
	return !!(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length);
}


export function hasWorkspaceMoreThanOneFolder(): boolean {
	return !!(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1);
}


export function getNameFromUri(uri: vscode.Uri): string {
	return uri.path.split("/").pop() as string;
}



export function isDirectory(uri: vscode.Uri): boolean {
	return !getNameFromUri(uri).includes(".");
}



export function getWorkspaceFolder(activeTextEditor = vscode.window.activeTextEditor) {
	let folder;
	if (vscode.workspace.workspaceFolders) {
		if (vscode.workspace.workspaceFolders.length === 1) {
			folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
		} else if (activeTextEditor) {
			folder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri)?.uri.fsPath ?? undefined;
		} else if (vscode.workspace.workspaceFolders.length > 0) {
			folder = vscode.workspace.workspaceFolders[0].uri.fsPath;
		}
	}
	return folder;
}

export function getActiveEditorName() {
	return vscode.window.activeTextEditor?.document.fileName ?? '';
}






// function getSplitter(): string {
// 	return "§&§";
//   }



// function getUrisForDirectoryPathUpdate(
// 	data: vscode.QuickPickItem[],
// 	uri: vscode.Uri,
// 	fileKind: number
//   ): vscode.Uri[] {
// 	return data
// 	  .filter(
// 		(qpItem: vscode.QuickPickItem) =>
// 		  qpItem.uri.path.includes(uri.path) && qpItem.symbolKind === fileKind
// 	  )
// 	  .map((qpItem: vscode.QuickPickItem) => qpItem.uri);
//   }

export function hasWorkspaceChanged(event: vscode.WorkspaceFoldersChangeEvent): boolean {
	return !!event.added.length || !!event.removed.length;
}


  





/**
 * Get the relative path to the workspace folder  
 * @param {string} filePath   
 * @returns {string} relativePath of file 
 */
 export function getRelativeFilePath2(filePath:string) {

	const basename = path.basename(filePath);
	let relativePath = vscode.workspace.asRelativePath(filePath, false);

	if (basename === "settings.json" || basename === "keybindings.json") {
		if (os.type() === "Windows_NT") relativePath = filePath.substring(3);  // for Windows
		// else relativePath = filePath.substring(1); // test for linux/mac
	}
	// else {
	// 	const wsFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(filePath)).uri.path;
	// 	relativePath = path.posix.relative(wsFolder, filePath);
	// }

	return relativePath;
}

/**
 * Get the relative path to the workspace folder  
 * @param {string} filePath   
 * @returns {string} relativePath of folder
 */
export function getRelativeFolderPath(filePath:string) {

	// const isWindows = process.platform === 'win32';
	// const env = process.env;
	// const homedir = os.homedir();

	const dirname = path.dirname(filePath);
	return vscode.workspace.asRelativePath(dirname);
}





// function normalizeUriPath(path: string): string {
// 	const workspaceFoldersPaths = getWorkspaceFoldersPaths();
// 	let normalizedPath = path;
  
// 	if (hasWorkspaceMoreThanOneFolder()) {
// 	  normalizedPath = normalizedPath.replace(
// 		// getWorkspaceFoldersCommonPathProp(),
// 		"",
// 		""
// 	  );
// 	} else {
// 	  workspaceFoldersPaths.forEach((wfPath: string) => {
// 		normalizedPath = normalizedPath.replace(wfPath, "");
// 	  });
// 	}
  
// 	return normalizedPath;
//   }
  



  /**
   *
   * @param uri
   */
export function getPathRelativeToWorkspaceFolder(uri: vscode.Uri): string {
    const currentWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    return ((typeof currentWorkspaceFolder !== "undefined")
        ? path.relative(currentWorkspaceFolder.uri.path, uri.path)
        : uri.path
	);
}














//   function isDebounceConfigurationToggled(
// 	event: vscode.ConfigurationChangeEvent
//   ): boolean {
// 	return event.affectsConfiguration("searchEverywhere.shouldUseDebounce");
//   }
  
//   function isSortingConfigurationToggled(
// 	event: vscode.ConfigurationChangeEvent
//   ): boolean {
// 	return event.affectsConfiguration("searchEverywhere.shouldItemsBeSorted");
//   }
  


// <Command>{
// 	command: "vscode.open",
// 	title: `Open ${match.str}`,
// 	arguments: [DocumentTools.GetFileUri(fullPath)],
// }



// async function getUrisOrFetchIfEmpty(
// 	uris?: vscode.Uri[]
//   ): Promise<vscode.Uri[]> {
// 	return uris && uris.length ? uris : await fetchUris();
//   }






// async function fetchUris(include: vscode.GlobPattern, exclude: vscode.GlobPattern): Promise<vscode.Uri[]> {
// 	try {
// 	return await vscode.workspace.findFiles(include, exclude);
// 	} catch (error) {
// 		Debug.LogException(error as Exception);
// 		return Promise.resolve([]);
// 	}
// }




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










// export function isWindows(): boolean {
// 	return process.platform === "win32";
//   }





  



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


/**
 * Get all symbols for active document.
 */
export async function getSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
	let symbols: vscode.DocumentSymbol[]|null = null;

	for (let timeout = 800; (timeout <= 2000); timeout+=600) {
		if (!symbols || symbols.length === 0) symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);
		if (!symbols || symbols.length === 0) await sleep(timeout);
		else break;
	}

	return symbols || [];
}

/**
 * Recursively walk through document symbols.
 */
export function forEachSymbol(f: (symbol: vscode.DocumentSymbol)=> void, symbols: vscode.DocumentSymbol[]): void {
	for (const symbol of symbols) {
		f(symbol);
		if (symbol.children.length) {
			forEachSymbol(f, symbol.children);
		}
	}
}

/**
 * Reveal symbol in editor.
 *
 * - Briefly highlight the entire line
 * - Move cursor to the symbol position
 */
 export async function goToSymbol(editor: vscode.TextEditor | undefined, symbolName: string): Promise<void> {
	if (!editor) {
		vscode.window.showErrorMessage('No TextEditor provided.');
		return;
	}
	const symbols = await getSymbols(editor.document);

	let foundSymbol: vscode.DocumentSymbol | undefined;
	forEachSymbol(symbol => {
		if (symbol.name === symbolName) {
			foundSymbol = symbol;
		}
	}, symbols);

	if (foundSymbol) {
		editor.selection = new vscode.Selection(foundSymbol.range.start, foundSymbol.range.start);
		editor.revealRange(foundSymbol.range, vscode.TextEditorRevealType.AtTop);
		// Highlight for a short time revealed range
		const range = new vscode.Range(foundSymbol.range.start.line, 0, foundSymbol.range.start.line, 0);
		const lineHighlightDecorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: '#ffb12938',
			isWholeLine: true,
		});
		editor.setDecorations(lineHighlightDecorationType, [range]);
		setTimeout(() => editor.setDecorations(lineHighlightDecorationType, []), 700);
	}
}





























//   export function prepareEdit(
//     cb: (
//       editBuilder: EditorBuilder,
//       selection: Selection,
//       lines: Array<TextLine>
//     ) => void,
//     withSortSelections: boolean = true ) {
//   const activeTextEditor = Window.activeTextEditor;
//   activeTextEditor.edit((editBuilder) => {
//     let selections = activeTextEditor.selections;
//     if(withSortSelections){
//       selections = sortSelections(selections);
//     }
//     selections.forEach((selection) => {
//       cb(new EditorBuilder(editBuilder), selection, getLines(selection));
//     });
//   });
// }











