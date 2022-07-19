import * as vscode from 'vscode';
import * as path from 'path';
import { homedir } from 'os';

// 'sticky' flag is not yet supported :(
const lineEndingRE = /([^\r\n]*)(\r\n|\r|\n)?/;
const escapeCharsRE = /[.*+?^${}()|[\]\\]/g;


export interface RangeDelta {
	start: vscode.Position;
	end: vscode.Position;
	linesDelta: number;
	endCharactersDelta: number; // delta for positions on the same line as the end position
}

export interface RegexModel {
	regex: string;
	flags: string;
}





/**
 * @returns the Position (line, column) for the location (character position)
 */
function positionAt(text: string, offset: number): vscode.Position {
	if (offset > text.length) offset = text.length;
	let line = 0;
	let lastIndex = 0;
	while (true) {
		const match = lineEndingRE.exec(text.substring(lastIndex));
		if (!match || lastIndex + match[1].length >= offset) return new vscode.Position(line, offset - lastIndex);
		lastIndex += match[0].length;
		++line;
	}
}

function positionRangeDeltaTranslateStart(pos: vscode.Position, delta: RangeDelta): vscode.Position {
	if (pos.isBefore(delta.end)) return pos;
	else if (delta.end.line == pos.line) {
		let x = pos.character + delta.endCharactersDelta;
		if (delta.linesDelta > 0) x = x - delta.end.character;
		else if (delta.start.line == delta.end.line + delta.linesDelta && delta.linesDelta < 0)
			x = x + delta.start.character;
		return new vscode.Position(pos.line + delta.linesDelta, x);
	} else return new vscode.Position(pos.line + delta.linesDelta, pos.character);
}

function positionRangeDeltaTranslateEnd(pos: vscode.Position, delta: RangeDelta): vscode.Position {
	if (pos.isBeforeOrEqual(delta.end)) return pos;
	else if (delta.end.line == pos.line) {
		let x = pos.character + delta.endCharactersDelta;
		if (delta.linesDelta > 0) x -= delta.end.character;
		else if (delta.start.line == delta.end.line + delta.linesDelta && delta.linesDelta < 0)
			x += delta.start.character;
		return new vscode.Position(pos.line + delta.linesDelta, x);
	} else return new vscode.Position(pos.line + delta.linesDelta, pos.character);
}

export function rangeTranslate(range: vscode.Range, delta: RangeDelta) {
	return new vscode.Range(
		positionRangeDeltaTranslateStart(range.start, delta),
		positionRangeDeltaTranslateEnd(range.end, delta)
	);
}

/**
 * @returns the lines and characters represented by the text
 */
export function toRangeDelta(oldRange: vscode.Range, text: string): RangeDelta {
	const newEnd = positionAt(text, text.length);
	let charsDelta = newEnd.character - oldRange.end.character;
	if (oldRange.start.line == oldRange.end.line) charsDelta += oldRange.start.character;

	return <RangeDelta>{
		start: oldRange.start,
		end: oldRange.end,
		linesDelta: newEnd.line - (oldRange.end.line - oldRange.start.line),
		endCharactersDelta: charsDelta,
	};
}

export function rangeDeltaNewRange(delta: RangeDelta): vscode.Range {
	let x: number;
	if (delta.linesDelta > 0) x = delta.endCharactersDelta;
	else if (delta.linesDelta < 0 && delta.start.line == delta.end.line + delta.linesDelta)
		x = delta.end.character + delta.endCharactersDelta + delta.start.character;
	else x = delta.end.character + delta.endCharactersDelta;
	return new vscode.Range(delta.start, new vscode.Position(delta.end.line + delta.linesDelta, x));
}

export function toRangeDeltaNewRange(oldRange: vscode.Range, text: string): vscode.Range {
	const delta = toRangeDelta(oldRange, text);
	return rangeDeltaNewRange(delta);
}




export function rangeContains( range: vscode.Range, pos: vscode.Position, excludeStart = false, includeEnd = true) : boolean {
	return (
		(excludeStart? range.start.isBefore(pos) : range.start.isBeforeOrEqual(pos))
											&&
		((!includeEnd)?  range.end.isAfter(pos) : range.end.isAfterOrEqual(pos))
	);
}

export function maxPosition(x: vscode.Position, y: vscode.Position) : vscode.Position {
	if (x.line > y.line) return x;
	if (x.line < y.line) return y;
	return (x.character >= y.character)? x : y;
}

export function minPosition(x: vscode.Position, y: vscode.Position) : vscode.Position {
	if (x.line < y.line) return x;
	if (x.line > x.line) return y;
	return (x.character <= y.character)? x : y;
}



/**
 * Escapes a given string for use in a regular expression
 * @param input The input string to be escaped
 * @returns {string} The escaped string
 */
export function escapeRegExp(input: string): string {
	return input.replace(escapeCharsRE, '\\$&'); // $& means the whole matched string
}





	
	// private static getFormattedDateTime12HR(date: Date) {
	// 	const month = date.getMonth() + 1;
	// 	const day = date.getDate();
	// 	const year = date.getFullYear();
	// 	const hour = (date.getHours() > 12)? date.getHours()-12 : date.getHours();
	// 	const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes().toString();
	// 	const amPM = (date.getHours() >= 12)? 'PM' : 'AM';
	// 	return `${day}/${month}/${year} ${hour}:${minutes} ${amPM}`;
	// }

	// private static getFormattedDateTime24HR(date: Date) {
	// 	const month = date.getMonth()+1;
	// 	const day = date.getDate();
	// 	const year = date.getFullYear();
	// 	const hour = date.getHours();
	// 	const minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes().toString();
	// 	return `${day}/${month}/${year} ${hour}:${minutes}`;
	// }



	





		
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







const MARKDOWN_SPACE = "&nbsp;";
const MARKDOWN_SPECIAL_CHARS_REG_EXP = /[.*#+-?^${}()!|[\]\\`]/g;
const IMAGE_MAXHEIGHT : number = 480;
const IMAGE_MAXWIDTH : number = 480;

// const LINE_DECEPTOR = MARKDOWN_SPACE;
// const LINE_BREAK = `${MARKDOWN_SPACE}  \r\n`;
// const LINE_BREAK_WITH_MARGIN = "\n\n";
// const HORIZONTAL_LINE = "  \n___\n";



/**
 * Returns markdown for an image uri. Restricts width and height wrt maxWidth and maxHeight if provided.
 * @param uri Uri of an image.
 * @param width Width of an image.
 * @param height Height of an image.
 * @param maxWidth Max width of an image.
 * @param maxHeigth Max height of an image.
 */
 function getMarkdownImage( uri: string, width?: number, height?: number, maxWidth = IMAGE_MAXWIDTH, maxHeight = IMAGE_MAXHEIGHT): string {
	// Normalizes height to compare with width
	if (width && (!height || width > height * maxWidth / maxHeight)) {
		return `![](${uri}|width=${Math.min(width, maxWidth)})`;
	} else if (height) {
		return `![](${uri}|height=${Math.min(height, maxHeight)})`;
	} else {
		return `![](${uri})`;
	}
}


/** Return text with escaped chars for markdown. */
const escapeMarkdownChars = (text: string): string => text.replace(MARKDOWN_SPECIAL_CHARS_REG_EXP, "\\$&");


/**
 * Returns a markdown link.
 * @param uri Uri of a link.
 * @param text Text of a link.
 * @param info Information to be shown when hovered on a link.
 */
const getMarkdownLink = (uri: string, text: string, info: string = uri): string => `[${text}](${uri} "${info}")`;

/**
 * Returns a markdown command.
 * @param command Name of command.
 * @param text A text to be shown on the link of the command.
 */
const getMarkdownCommand = (command: string, text: string): string => `[${text}](command:${command})`;


/** Returns a bolded markdown text. */
const boldForMarkdown = (text: string): string => `**${text}**`;
/** Return an italicized markdown text. */
const toItalicForMarkdown = (text:string):string => `*${text}*`;
/** Return a bolded and italicized markdown text. */
const toBoldItalicForMarkdown = (text:string):string => `***${text}***`;
/** Returns an indented markdown text. */
const indentForMarkdown = (text: string): string => `    ${text}`;
/** Returns a text as a markdown bullet. Used for list items. */
const toBulletForMarkdown = (text: string): string => `  * ${text}`;
/** Returns a text as a markdown code. */
const toCodeForMarkdown = (text: string): string => `\`${text}\``;
/** Returns a text as a blockquote. */
const toBlockQuoteForMarkdown = (text: string): string => `> ${text}`;
/** Return markdown text with a striketrhough format. */
const toStrikethroughForMarkdown = (text:string):string => `~~${text}~~`;

export {
    MARKDOWN_SPACE,
    escapeMarkdownChars,
    getMarkdownImage,
    getMarkdownLink,
    getMarkdownCommand,
    boldForMarkdown,
    indentForMarkdown,
    toBulletForMarkdown,
    toCodeForMarkdown,
    toItalicForMarkdown,
	toBoldItalicForMarkdown,
	toBlockQuoteForMarkdown,
	toStrikethroughForMarkdown,
};













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