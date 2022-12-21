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
import * as https from 'https';

//: Idea- insert key should align multiselect cursors.


/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
 export function parseMappings(mappings: { [key: string]: string }): KeyValPair<string,string>[] {
	return Object.entries(mappings).map(([Key, Val]) => ({ Key, Val }));
}





export function stringHash(str:string) {
	var hash = 5381, i = str.length;

	while(i !== 0) hash = (hash * 33) ^ str.charCodeAt(--i);

	/** JavaScript does bitwise operations (like XOR, above) on 32-bit signed
	 * integers. Since we want the results to be always positive, convert the
	 * signed int to an unsigned by doing an unsigned bitshift. */
	return hash >>> 0;
}



export class UnreachableCaseError extends Error {constructor(val: never) {super(`Unreachable case: ${val}`)}}

interface HookError extends Error { errors: any }

export function isHookError(e: Error): e is HookError { return !!(e as any).errors }







// a 1x1 pixel transparent gif, from http://png-pixel.com/
export const EMPTY_IMAGE_URI = vscode.Uri.parse(`data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==`);

export const ImageMimetypes: Record<string, string> = {
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.jpe': 'image/jpeg',
	'.webp': 'image/webp',
	'.tif': 'image/tiff',
	'.tiff': 'image/tiff',
	'.bmp': 'image/bmp',
};

export const enum Schemes {
	DebugConsole = 'debug',
	File = 'file',
	Git = 'git',
	GitHub = 'github',
	GitLens = 'gitlens',
	Output = 'output',
	PRs = 'pr',
	Vsls = 'vsls',
	VslsScc = 'vsls-scc',
	Virtual = 'vscode-vfs',
}

export function findTextDocument(uri: vscode.Uri): vscode.TextDocument | undefined {
	const normalizedUri = uri.toString();
	return vscode.workspace.textDocuments.find(d => d.uri.toString() === normalizedUri);
}


export function findEditor(uri: vscode.Uri): vscode.TextEditor | undefined {
	const active = vscode.window.activeTextEditor;
	const normalizedUri = uri.toString();

	for (const e of [...(active != null ? [active] : []), ...vscode.window.visibleTextEditors]) {
		// Don't include diff editors
		if (e.document.uri.toString() === normalizedUri && e?.viewColumn != null) return e;
	}

	return undefined;
}


// export async function findOrOpenEditor(
// 	uri: vscode.Uri,
// 	options?: vscode.TextDocumentShowOptions & { throwOnError?: boolean },
// ): Promise<vscode.TextEditor | undefined> {
// 	const e = findEditor(uri);
// 	if (e != null) {
// 		if (!options?.preserveFocus) {
// 			await vscode.window.showTextDocument(e.document, { ...options, viewColumn: e.viewColumn });
// 		}

// 		return e;
// 	}

// 	return openEditor(uri, { viewColumn: vscode.window.activeTextEditor?.viewColumn, ...options });
// }

// export function findOrOpenEditors(uris: vscode.Uri[]): void {
// 	const normalizedUris = new Map(uris.map(uri => [uri.toString(), uri]));

// 	for (const e of vscode.window.visibleTextEditors) {
// 		// Don't include diff editors
// 		if (e?.viewColumn != null) {
// 			normalizedUris.delete(e.document.uri.toString());
// 		}
// 	}

// 	for (const uri of normalizedUris.values()) {
// 		void executeCoreCommand(CoreCommands.Open, uri, { background: true, preview: false });
// 	}
// }



export function getEditorIfActive(document: vscode.TextDocument): vscode.TextEditor | undefined {
	const editor = vscode.window.activeTextEditor;
	return editor != null && editor.document === document ? editor : undefined;
}


export function hasVisibleTextEditor(): boolean {
	if (vscode.window.visibleTextEditors.length === 0) return false;

	return vscode.window.visibleTextEditors.some(e => isTextEditor(e));
}

export function isVisibleDocument(document: vscode.TextDocument): boolean {
	if (vscode.window.visibleTextEditors.length === 0) return false;
	return vscode.window.visibleTextEditors.some(e => e.document === document);
}

export function isTextEditor(editor: vscode.TextEditor): boolean {
	const scheme = editor.document.uri.scheme;
	return scheme !== Schemes.Output && scheme !== Schemes.DebugConsole;
}

export function isActiveDocument(document: vscode.TextDocument): boolean {
	const editor = vscode.window.activeTextEditor;
	return editor != null && editor.document === document;
}



export function isVirtualUri(uri: vscode.Uri): boolean {
	return uri.scheme === Schemes.Virtual || uri.scheme === Schemes.GitHub;
}

// export async function openEditor(
// 	uri: vscode.Uri,
// 	options: vscode.TextDocumentShowOptions & { rethrow?: boolean } = {},
// ): Promise<vscode.TextEditor | undefined> {
// 	const { rethrow, ...opts } = options;
// 	try {
// 		if (isGitUri(uri)) {
// 			uri = uri.documentUri();
// 		}

// 		if (uri.scheme === Schemes.GitLens && ImageMimetypes[path.extname(uri.fsPath)]) {
// 			await executeCoreCommand(CoreCommands.Open, uri);

// 			return undefined;
// 		}

// 		const document = await vscode.workspace.openTextDocument(uri);
// 		return vscode.window.showTextDocument(document, {
// 			preserveFocus: false,
// 			preview: true,
// 			viewColumn: vscode.ViewColumn.Active,
// 			...opts,
// 		});
// 	} catch (ex) {
// 		const msg: string = ex?.toString() ?? '';
// 		if (msg.includes('File seems to be binary and cannot be opened as text')) {
// 			await executeCoreCommand(CoreCommands.Open, uri);

// 			return undefined;
// 		}

// 		if (rethrow) throw ex;

// 		// Logger.error(ex, 'openEditor');
// 		return undefined;
// 	}
// }


// export const enum OpenWorkspaceLocation {
// 	CurrentWindow = 'currentWindow',
// 	NewWindow = 'newWindow',
// 	AddToWorkspace = 'addToWorkspace',
// }

// export function openWorkspace(
// 	uri: vscode.Uri,
// 	options: { location?: OpenWorkspaceLocation; name?: string } = { location: OpenWorkspaceLocation.CurrentWindow },
// ): void {
// 	if (options?.location === OpenWorkspaceLocation.AddToWorkspace) {
// 		const count = vscode.workspace.workspaceFolders?.length ?? 0;
// 		return void vscode.workspace.updateWorkspaceFolders(count, 0, { uri: uri, name: options?.name });
// 	}

// 	return void executeCoreCommand(CoreCommands.OpenFolder, uri, {
// 		forceNewWindow: options?.location === OpenWorkspaceLocation.NewWindow,
// 	});
// }



// export async function openWalkthrough(
// 	extensionId: string,
// 	walkthroughId: string,
// 	stepId?: string,
// 	openToSide: boolean = true,
// ): Promise<void> {
// 	// Only open to side if there is an active tab
// 	if (openToSide && vscode.window.tabGroups.activeTabGroup.activeTab == null) {
// 		openToSide = false;
// 	}

// 	// Takes the following params: walkthroughID: string | { category: string, step: string } | undefined, toSide: boolean | undefined
// 	void (await executeCoreCommand(
// 		CoreCommands.OpenWalkthrough,
// 		{
// 			category: `${extensionId}#${walkthroughId}`,
// 			step: stepId ? `${extensionId}#${walkthroughId}#${stepId}` : undefined,
// 		},
// 		openToSide,
// 	));
// }

export function getEditorCommand() {
	switch (vscode.env.appName) {
		case 'Visual Studio Code - Insiders': return 'code-insiders --wait --reuse-window';
		case 'Visual Studio Code - Exploration': return 'code-exploration --wait --reuse-window';
		case 'VSCodium': return 'codium --wait --reuse-window';
		default: return 'code --wait --reuse-window';
	}
}





export function getWorkspaceRootPath(): string | undefined {
    const document = getCurrentTextDocument();
    if (document) {
        const fileUri = document.uri;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
        if (workspaceFolder) {
            return workspaceFolder.uri.toString();
        }
    }
	return undefined;
}

export function getCurrentHttpFileName(): string | undefined {
    const document = getCurrentTextDocument();
    if (document) {
        const filePath = document.fileName;
        return path.basename(filePath, path.extname(filePath));
    }
	return undefined;
}

export function getCurrentTextDocument(): vscode.TextDocument | undefined {
    return vscode.window.activeTextEditor?.document;
}





// type CoreCommand = vscode.Command;


// interface CommandConstructor {
// 	new (container: Container): Command;
// }

// const registrableCommands: CommandConstructor[] = [];

// export function command(): ClassDecorator {
// 	return (target: any) => { registrableCommands.push(target); };
// }

// export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
// 	return vscode.commands.registerCommand(
// 		command,
// 		function (this: any, ...args) {
// 			Container.instance.telemetry.sendEvent('command', { command: command });
// 			callback.call(this, ...args);
// 		},
// 		thisArg,
// 	);
// }

// export function registerCommands(container: Container): Disposable[] {
// 	return registrableCommands.map(c => new c(container));
// }

// export function asCommand<T extends unknown[]>(
// 	command: Omit<CoreCommand, 'arguments'> & { arguments: [...T] },
// ): CoreCommand {
// 	return command;
// }

// export function executeActionCommand<T extends ActionContext>(action: Action<T>, args: Omit<T, 'type'>) {
// 	return vscode.commands.executeCommand(`${Commands.ActionPrefix}${action}`, { ...args, type: action });
// }

// type SupportedCommands = Commands | `gitlens.views.${string}.focus` | `gitlens.views.${string}.resetViewLocation`;

// export function executeCommand<U = any>(command: SupportedCommands): Thenable<U>;
// export function executeCommand<T = unknown, U = any>(command: SupportedCommands, arg: T): Thenable<U>;
// export function executeCommand<T extends [...unknown[]] = [], U = any>(
// 	command: SupportedCommands,
// 	...args: T
// ): Thenable<U>;
// export function executeCommand<T extends [...unknown[]] = [], U = any>(
// 	command: SupportedCommands,
// 	...args: T
// ): Thenable<U> {
// 	return vscode.commands.executeCommand<U>(command, ...args);
// }

// export function executeCoreCommand<T = unknown, U = any>(command: CoreCommands, arg: T): Thenable<U>;
// export function executeCoreCommand<T extends [...unknown[]] = [], U = any>(
// 	command: CoreCommands,
// 	...args: T
// ): Thenable<U>;
// export function executeCoreCommand<T extends [...unknown[]] = [], U = any>(
// 	command: CoreCommands,
// 	...args: T
// ): Thenable<U> {
// 	if (command !== CoreCommands.ExecuteDocumentSymbolProvider) {
// 		Container.instance.telemetry.sendEvent('command/core', { command: command });
// 	}
// 	return vscode.commands.executeCommand<U>(command, ...args);
// }

// // export function executeCoreGitCommand<U = any>(command: CoreGitCommands): Thenable<U>;
// // export function executeCoreGitCommand<T = unknown, U = any>(command: CoreGitCommands, arg: T): Thenable<U>;
// // export function executeCoreGitCommand<T extends [...unknown[]] = [], U = any>(
// // 	command: CoreGitCommands,
// // 	...args: T
// // ): Thenable<U>;
// // export function executeCoreGitCommand<T extends [...unknown[]] = [], U = any>(
// // 	command: CoreGitCommands,
// // 	...args: T
// // ): Thenable<U> {
// // 	Container.instance.telemetry.sendEvent('command/core', { command: command });
// // 	return commands.executeCommand<U>(command, ...args);
// // }

// export function executeEditorCommand<T>(command: Commands, uri: vscode.Uri | undefined, args: T) {
// 	return vscode.commands.executeCommand(command, uri, args);
// }










/**
 * Szudzik elegant pairing function
 * http://szudzik.com/ElegantPairing.pdf
 */
 export function szudzikPairing(x: number, y: number): number {
	return x >= y ? x * x + x + y : x + y * y;
}


export async function sequentialize<T extends (...args: any[]) => unknown>(
	fn: T,
	argArray: Parameters<T>[],
	thisArg?: unknown,
): Promise<any> {
	for (const args of argArray) {
		try { void (await fn.apply(thisArg, args)) } catch {}
	}
}






export function is<T extends object>(o: T | null | undefined): o is T;
export function is<T extends object>(o: object, prop: keyof T, value?: any): o is T;
export function is<T extends object>(o: object, matcher: (o: object) => boolean): o is T;
export function is<T extends object>(o: object, propOrMatcher?: keyof T | ((o: any) => boolean), value?: any): o is T {
	if (propOrMatcher == null) return o != null;
	if (typeof propOrMatcher === 'function') return propOrMatcher(o);

	return value === undefined ? (o as any)[propOrMatcher] !== undefined : (o as any)[propOrMatcher] === value;
}



const comma = ',';
const emptyStr = '';
const equals = '=';
const openBrace = '{';
const openParen = '(';
const closeParen = ')';

const fnBodyRegex = /\(([\s\S]*)\)/;
const fnBodyStripCommentsRegex = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm;
const fnBodyStripParamDefaultValueRegex = /\s?=.*$/;

export function getParameters(fn: Function): string[] {
	if (typeof fn !== 'function') throw new Error('Not supported');

	if (fn.length === 0) return [];

	let fnBody: string = Function.prototype.toString.call(fn);
	fnBody = fnBody.replace(fnBodyStripCommentsRegex, emptyStr) || fnBody;
	fnBody = fnBody.slice(0, fnBody.indexOf(openBrace));

	let open = fnBody.indexOf(openParen);
	let close = fnBody.indexOf(closeParen);

	open = open >= 0 ? open + 1 : 0;
	close = close > 0 ? close : fnBody.indexOf(equals);

	fnBody = fnBody.slice(open, close);
	fnBody = `(${fnBody})`;

	const match = fnBodyRegex.exec(fnBody);
	return match != null
		? match[1].split(comma).map(param => param.trim().replace(fnBodyStripParamDefaultValueRegex, emptyStr))
		: [];
}




















abstract class Comparer<T> {
	abstract equals(lhs: T, rhs: T): boolean;
}

class UriComparer extends Comparer<vscode.Uri> {
	equals(lhs: vscode.Uri | undefined, rhs: vscode.Uri | undefined, options: { exact?: boolean } = { exact: false }) {
		if (lhs === rhs) return true;
		if (lhs == null || rhs == null) return false;
		return ((options.exact)
			? lhs.toString() === rhs.toString() 
			: lhs.scheme === rhs.scheme && lhs.fsPath === rhs.fsPath
		);
	}
}

class TextEditorComparer extends Comparer<vscode.TextEditor> {
	equals(
		lhs: vscode.TextEditor | undefined,
		rhs: vscode.TextEditor | undefined,
		options: { usePosition: boolean } = { usePosition: false },
	) {
		if (lhs === rhs) return true;
		if (lhs == null || rhs == null) return false;

		if (options.usePosition && lhs.viewColumn !== rhs.viewColumn) return false;

		return lhs.document === rhs.document;
	}
}

const textEditorComparer = new TextEditorComparer();
const uriComparer = new UriComparer();
export { textEditorComparer as TextEditorComparer, uriComparer as UriComparer };
























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

































export function asResourceUrl(uri: vscode.Uri, range: vscode.Range): vscode.Uri {
	return uri.with({ fragment: `L${1 + range.start.line},${1 + range.start.character}-${1 + range.end.line},${1 + range.end.character}` });
}











export async function isValidRequestPosition(uri: vscode.Uri, position: vscode.Position) {
	const doc = await vscode.workspace.openTextDocument(uri);
	return Boolean(doc.getWordRangeAtPosition(position) ?? doc.getWordRangeAtPosition(position, /[^\s]+/));
}




export class ContextKey<V> {
	constructor(readonly name: string) { }
	async set(value: V) { await vscode.commands.executeCommand('setContext', this.name, value); }
	async reset() { await vscode.commands.executeCommand('setContext', this.name, undefined); }
}




export function uniqueFilter<T>(keyFn: (t: T) => string): (t: T) => boolean {
	const seen: Record<string,bool> = Object.create(null);

	return (element) => {
		const key = keyFn(element);
		return (seen[key])? false : (seen[key] = true);
	};
}


export function once(fn: (...args: any[]) => any): (...args: any[]) => any {
	let didRun = false;
	return (...args) => (didRun)? undefined : fn(...args);
}



export function httpGet<T = any>(url: string): Promise<T> {
	return new Promise((resolve, reject) => {
		https.get(url, (res) => {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				try { resolve(JSON.parse(rawData)); } 
				catch (e) { reject(e); }
			});
		}).on('error', reject);
	});
}



// public static read_all_lines(file: string): string[] {
// 	let text = fs.readFileSync(file, 'utf8');
// 	return text.split(/\r?\n/g);
// }

// public static write_all_lines(file: string, lines: string[]): void {
// 	fs.writeFileSync(file, lines.join('\n'), { encoding: 'utf8' });
// }



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
export function IsFunction(obj: unknown): obj is Function { return (typeof obj === 'function'); }


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
















// export const doubleWidthCharsReg =/[\uAC00-\uD7A3\u2010\u2012-\u2016\u2020-\u2022\u2025-\u2027\u2030\u2035\u203B\u203C\u2042\u2047-\u2049\u2051\u20DD\u20DE\u2100\u210A\u210F\u2121\u2135\u213B\u2160-\u216B\u2170-\u217B\u2215\u221F\u22DA\u22DB\u22EF\u2305-\u2307\u2312\u2318\u23B0\u23B1\u23BF-\u23CC\u23CE\u23DA\u23DB\u2423\u2460-\u24FF\u2600-\u2603\u2609\u260E\u260F\u2616\u2617\u261C-\u261F\u262F\u2668\u2672-\u267D\u26A0\u26BD\u26BE\u2702\u273D\u273F\u2740\u2756\u2776-\u277F\u2934\u2935\u29BF\u29FA\u29FB\u2B1A\u2E3A\u2E3B\u2E80-\u9FFF\uF900-\uFAFF\uFB00-\uFB04\uFE10-\uFE19\uFE30-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6\u{1F100}-\u{1F10A}\u{1F110}-\u{1F12E}\u{1F130}-\u{1F16B}\u{1F170}-\u{1F19A}\u{1F200}-\u{1F251}\u{2000B}-\u{2F9F4}]/gu;


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



/**
 * Copy a string to the clipboard.
 * @param text The string.
 * @returns A promise resolving to the ErrorInfo of the executed command.
 */
export function copyToClipboard(text: string): Thenable<string|null> { //ErrorInfo
	return vscode.env.clipboard.writeText(text).then(
		() => null,
		() => 'Visual Studio Code was unable to write to the Clipboard.'
	);
}











/**
 * Check whether Git Graph is running on a Windows-based platform.
 * @returns TRUE => Windows-based platform, FALSE => Not a Windows-based platform.
 */
export function isWindows() {
	return process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys';
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











// // #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// export type View = string;

// export interface ViewNode {
// 	readonly id?: string;
// }

// export abstract class ViewNode<TView extends View = View, State extends object = any> {
// 	protected splatted = false;

// 	constructor(uri: GitUri, public readonly view: TView, protected parent?: ViewNode) {
// 		this._uri = uri;
// 	}

// 	toClipboard?(): string;

// 	toString(): string {
// 		const id = this.id;
// 		return `${Logger.toLoggableName(this)}${id != null ? `(${id})` : ''}`;
// 	}

// 	protected _uri: GitUri;
// 	get uri(): GitUri {
// 		return this._uri;
// 	}

// 	abstract getChildren(): ViewNode[] | Promise<ViewNode[]>;

// 	getParent(): ViewNode | undefined {
// 		// If this node's parent has been splatted (e.g. not shown itself, but its children are), then return its grandparent
// 		return this.parent?.splatted ? this.parent?.getParent() : this.parent;
// 	}

// 	abstract getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem>;

// 	resolveTreeItem?(item: vscode.TreeItem): vscode.TreeItem | Promise<vscode.TreeItem>;

// 	getCommand(): Command | undefined {
// 		return undefined;
// 	}

// 	refresh?(reset?: boolean): boolean | void | Promise<void> | Promise<boolean>;

// 	triggerChange(reset: boolean = false, force: boolean = false, avoidSelf?: ViewNode): Promise<void> {
// 		// If this node has been splatted (e.g. not shown itself, but its children are), then delegate the change to its parent
// 		if (this.splatted && this.parent != null && this.parent !== avoidSelf) {
// 			return this.parent.triggerChange(reset, force);
// 		}

// 		return this.view.refreshNode(this, reset, force);
// 	}

// 	getSplattedChild?(): Promise<ViewNode | undefined>;

// 	deleteState<T extends StateKey<State> = StateKey<State>>(key?: T): void {
// 		if (this.id == null) {
// 			debugger;
// 			throw new Error('Id is required to delete state');
// 		}
// 		return this.view.nodeState.deleteState(this.id, key as string);
// 	}

// 	getState<T extends StateKey<State> = StateKey<State>>(key: T): StateValue<State, T> | undefined {
// 		if (this.id == null) {
// 			debugger;
// 			throw new Error('Id is required to get state');
// 		}
// 		return this.view.nodeState.getState(this.id, key as string);
// 	}

// 	storeState<T extends StateKey<State> = StateKey<State>>(key: T, value: StateValue<State, T>): void {
// 		if (this.id == null) {
// 			debugger;
// 			throw new Error('Id is required to store state');
// 		}
// 		this.view.nodeState.storeState(this.id, key as string, value);
// 	}
// }

// export function isViewNode(node: any): node is ViewNode {
// 	return node instanceof ViewNode;
// }


// export class MessageNode extends ViewNode {
// 	constructor(
// 		view: View,
// 		parent: ViewNode,
// 		private readonly _message: string,
// 		private readonly _description?: string,
// 		private readonly _tooltip?: string,
// 		private readonly _iconPath?: IconPath,
// 		private readonly _contextValue?: string,
// 	) {
// 		super(unknownGitUri, view, parent);
// 	}

// 	getChildren(): ViewNode[] | Promise<ViewNode[]> {
// 		return [];
// 	}

// 	getTreeItem(): vscode.TreeItem | Promise<vscode.TreeItem> {
// 		const item = new vscode.TreeItem(this._message, vscode.TreeItemCollapsibleState.None);
// 		item.contextValue = this._contextValue;
// 		item.description = this._description;
// 		item.tooltip = this._tooltip;
// 		item.iconPath = this._iconPath;
// 		return item;
// 	}
// }









// export interface TreeViewNodeCollapsibleStateChangeEvent<T> extends vscode.TreeViewExpansionEvent<T> {
// 	state: vscode.TreeItemCollapsibleState;
// }



// //https://github.com/gitkraken/vscode-gitlens/blob/main/src/views/viewBase.ts


// export abstract class ViewBase<RootNode extends ViewNode<View>, ViewConfig extends any> implements vscode.TreeDataProvider<ViewNode>, vscode.Disposable {

// 	protected _onDidChangeTreeData = new vscode.EventEmitter<ViewNode | undefined>();
// 	get onDidChangeTreeData(): vscode.Event<ViewNode | undefined> {
// 		return this._onDidChangeTreeData.event;
// 	}

// 	private _onDidChangeSelection = new vscode.EventEmitter<vscode.TreeViewSelectionChangeEvent<ViewNode>>();
// 	get onDidChangeSelection(): vscode.Event<vscode.TreeViewSelectionChangeEvent<ViewNode>> {
// 		return this._onDidChangeSelection.event;
// 	}

// 	private _onDidChangeVisibility = new vscode.EventEmitter<vscode.TreeViewVisibilityChangeEvent>();
// 	get onDidChangeVisibility(): vscode.Event<vscode.TreeViewVisibilityChangeEvent> {
// 		return this._onDidChangeVisibility.event;
// 	}

// 	private _onDidChangeNodeCollapsibleState = new vscode.EventEmitter<TreeViewNodeCollapsibleStateChangeEvent<ViewNode>>();
// 	get onDidChangeNodeCollapsibleState(): vscode.Event<TreeViewNodeCollapsibleStateChangeEvent<ViewNode>> {
// 		return this._onDidChangeNodeCollapsibleState.event;
// 	}


// 	protected disposables: vscode.Disposable[] = [];
// 	protected root: RootNode | undefined;
// 	protected tree: vscode.TreeView<ViewNode> | undefined;

// 	private readonly _lastKnownLimits = new Map<string, number | undefined>();

// 	dispose() {
// 		this._nodeState?.dispose();
// 		this._nodeState = undefined;
// 		vscode.Disposable.from(...this.disposables).dispose();
// 	}

// 	private _nodeState: ViewNodeState | undefined;
// 	get nodeState(): ViewNodeState {
// 		if (this._nodeState == null) {
// 			this._nodeState = new ViewNodeState();
// 		}

// 		return this._nodeState;
// 	}

// 	private onReady() {
// 		this.initialize({ canSelectMany: this.canSelectMany, showCollapseAll: this.showCollapseAll });
// 		queueMicrotask(() => this.onConfigurationChanged());
// 	}

// 	get canReveal(): boolean {
// 		return true;
// 	}

// 	get canSelectMany(): boolean {
// 		return (
// 			this.container.prereleaseOrDebugging &&
// 			configuration.get('views.experimental.multiSelect.enabled', undefined, false)
// 		);
// 	}

// }










/*
since vscode has very limit API to customize tree view, let's do some hacks
Strings are copied from http://qaz.wtf/u/convert.cgi?text=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-
*/

export type FontNames = keyof typeof fonts

const fonts = {
	plain: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-',
	math_monospace: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉-',
	math_sans: '𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹-',
	math_sans_bold: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙-',
	math_sans_italic: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡-',
	math_sans_bold_italic: '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕-',
	regional_indicator: '🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿-',
}


const enabledPlatforms = [
	'win32',
]
export function unicodeTransform(text: string, from: FontNames, to: FontNames) {
	if (!enabledPlatforms.includes(process.platform)) return text

	const FromFont = Array.from(fonts[from])
	const ToFont = Array.from(fonts[to])
	return Array.from(text)
	.map((c) => {
		if (FromFont.includes(c)) return ToFont[FromFont.indexOf(c)]
		return c
	}).join('')
}

export function unicodeDecorate(text: string, to: FontNames) {
	return unicodeTransform(text, 'plain', to)
}

export function decorateLocale(locale: string) {
	return unicodeDecorate(locale, 'regional_indicator')
}