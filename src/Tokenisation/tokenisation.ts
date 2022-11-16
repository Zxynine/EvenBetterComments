import { Color, Position, Range } from "vscode";
import { arrayInsert } from "../Utilities/Utils";
import { readUInt32BE, writeUInt32BE } from "../Utilities/Buffer";
// import { IsString } from "../Utilities/Utils";

//https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/languages/supports/tokenization.ts
export interface ITokenPresentation {
	foreground: ColorId;
	background: ColorId,
	italic: boolean;
	bold: boolean;
	underline: boolean;
	strikethrough: boolean;
}

export const enum FontStyle {
	NotSet = -1,
	None = 0,
	Italic = 1,
	Bold = 2,
	Underline = 4,
	Strikethrough = 8,
	Overline = 16,
}

export const enum ColorId {
	None = 0,
	DefaultForeground = 1,
	DefaultBackground = 2,
}

export const enum LanguageId {
	Null = 0,
	PlainText = 1,
}


//  /\*\*\n.*\* (.*)\n.*\*/
//  /** $1 **/


export function fontStyleToString(fontStyle: OrMask<FontStyle>) {
	if (fontStyle === FontStyle.NotSet) return 'not set';

	let style = '';
	if (fontStyle & FontStyle.Strikethrough) style += 'strikethrough ';
	if (fontStyle & FontStyle.Underline) style += 'underline ';
	if (fontStyle & FontStyle.Overline) style += 'overline ';
	if (fontStyle & FontStyle.Italic) style += 'italic ';
	if (fontStyle & FontStyle.Bold) style += 'bold ';
	return (style === '')? 'none' : style.trim();
}

export function ParseFontStyle(segment : string) : FontStyle {
	switch (segment) {
		case 'strikethrough': return FontStyle.Strikethrough;
		case 'underline': return FontStyle.Underline;
		case 'overline': return FontStyle.Overline;
		case 'italic': return FontStyle.Italic;
		case 'bold': return FontStyle.Bold;
		default : return FontStyle.None;
	}
}





const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp|meta\.embedded)\b/;
export function toStandardTokenType(tokenType: string): StandardTokenType {
	const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
	if (!m) return StandardTokenType.NotSet;
	else switch (m[1]) {
		case 'comment': return StandardTokenType.Comment;
		case 'string': return StandardTokenType.String;
		case 'regex': return StandardTokenType.RegEx;
		case 'regexp': return StandardTokenType.RegEx;
		case "meta.embedded": return StandardTokenType.Other;
		default: throw new Error('Unexpected match for standard token type! - ' + m[1]);
	}
}


export function TokenTypeToString(token : StandardTokenType) {
	switch (token) {
		case StandardTokenType.Other : return "Other";
		case StandardTokenType.Comment : return "Comment";
		case StandardTokenType.String : return "String";
		case StandardTokenType.RegEx : return "RegEx";
		case StandardTokenType.NotSet : return "Not Set";
		default: return "????";
	}
}



export function toOptionalTokenType(standardType: StandardTokenType): OptionalStandardTokenType {
	return standardType as any as OptionalStandardTokenType;
}

function fromOptionalTokenType(
	standardType:
		| OptionalStandardTokenType.Other
		| OptionalStandardTokenType.Comment
		| OptionalStandardTokenType.String
		| OptionalStandardTokenType.RegEx
): StandardTokenType {
	return standardType as any as StandardTokenType;
}





export const enum Constants {
	CHEAP_TOKENIZATION_LENGTH_LIMIT = 2048
}



export const enum IgnoreBracketsInTokens {value = StandardTokenType.Comment | StandardTokenType.String | StandardTokenType.RegEx}
export function ignoreBracketsInToken(standardTokenType: StandardTokenType): boolean {
    return (standardTokenType & IgnoreBracketsInTokens.value) !== 0;
}
/**
 * 
 * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
 * The following assumptions have been made:
 *  - languageId < 256 => needs 8 bits
 *  - unique color count < 512 => needs 9 bits
 *
 * The binary format is:
 * - -------------------------------------------
 *     3322 2222 2222 1111 1111 1100 0000 0000
 *     1098 7654 3210 9876 5432 1098 7654 3210
 * - -------------------------------------------
 *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
 *     bbbb bbbb ffff ffff fFFF FBTT LLLL LLLL
 * - -------------------------------------------
 *  - L = LanguageId (8 bits)          //0b00000000000000000000000011111111
 *  - T = StandardTokenType (2 bits)   //0b00000000000000000000001100000000
 *  - B = Balanced bracket (1 bit)     //0b00000000000000000000010000000000
 *  - F = FontStyle (4 bits)           //0b00000000000000000111100000000000
 *  - f = foreground color (9 bits)    //0b00000000111111111000000000000000
 *  - b = background color (9 bits)    //0b11111111000000000000000000000000
 */


export const enum MetadataConsts {
	LANGUAGEID_MASK = 0b00000000000000000000000011111111,
	TOKEN_TYPE_MASK = 0b00000000000000000000001100000000,
	B_BRACKETS_MASK = 0b00000000000000000000010000000000,
	FONT_STYLE_MASK = 0b00000000000000000111100000000000,
	FOREGROUND_MASK = 0b00000000011111111000000000000000,
	BACKGROUND_MASK = 0b11111111100000000000000000000000,

	LANGUAGEID_OFFSET = 0, //0b00000000000000000000000000000001
	TOKEN_TYPE_OFFSET = 8, //0b00000000000000000000000100000000
	B_BRACKETS_OFFSET = 10,//0b00000000000000000000010000000000
	FONT_STYLE_OFFSET = 11,//0b00000000000000000000100000000000
	FOREGROUND_OFFSET = 14,//0b00000000000000001000000000000000
	BACKGROUND_OFFSET = 23,//0b00000000100000000000000000000000

	// Semantic tokens cannot set the language id, so we can
	// use the first 8 bits for control purposes
	SEMANTIC_USE_ITALIC        = 0b00000000000000000000000000000001,
	SEMANTIC_USE_BOLD          = 0b00000000000000000000000000000010,
	SEMANTIC_USE_UNDERLINE     = 0b00000000000000000000000000000100,
	SEMANTIC_USE_STRIKETHROUGH = 0b00000000000000000000000000001000,
	SEMANTIC_USE_FOREGROUND    = 0b00000000000000000000000000010000,
	SEMANTIC_USE_BACKGROUND    = 0b00000000000000000000000000100000,
	SEMANTIC_USE_OVERLINE      = 0b00000000000000000000000001000000,
	
	ITALIC_MASK        = 0b00000000000000000000100000000000,
	BOLD_MASK          = 0b00000000000000000001000000000000,
	UNDERLINE_MASK     = 0b00000000000000000010000000000000,
	STRIKETHROUGH_MASK = 0b00000000000000000100000000000000,
}


export class TokenMetadata {
	public static Query(metadata:MetadataConsts, query:MetadataConsts) { return (metadata & query) !== 0; }


	public static readonly Default = (
		(FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET)
		| (ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET)
		| (ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET)
	) >>> 0;

	public static getLanguageId(metadata: number): LanguageId       { return (metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET; }
	public static getTokenType(metadata: number): StandardTokenType { return (metadata & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET; }
	public static getFontStyle(metadata: number): FontStyle         { return (metadata & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET; }
	public static getForeground(metadata: number): ColorId          { return (metadata & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET; }
	public static getBackground(metadata: number): ColorId          { return (metadata & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET; }
	public static hasBalancedBrackets(metadata: number): boolean    { return (metadata & MetadataConsts.B_BRACKETS_MASK) !== 0; }

	public static getClassName(metadata: number): string {
		const foreground = this.getForeground(metadata);
		// const background = this.getBackground(metadata);
		const fontStyle = this.getFontStyle(metadata);

		let className = 'mtk' + foreground;
		if (fontStyle & FontStyle.Italic)        className += ' mtki';
		if (fontStyle & FontStyle.Bold)          className += ' mtkb';
		if (fontStyle & FontStyle.Overline)      className += ' mtko';
		if (fontStyle & FontStyle.Underline)     className += ' mtku';
		if (fontStyle & FontStyle.Strikethrough) className += ' mtks';
		return className;
	}

	public static getInlineStyle(metadata: number, colorMap: string[]): string {
		const foreground = this.getForeground(metadata);
		const background = this.getBackground(metadata);
		const fontStyle = this.getFontStyle(metadata);
		let result = '';

		result += `foreground color: ${colorMap[foreground]};`;
		result += `background color: ${colorMap[background]};`;
		if (fontStyle & FontStyle.Bold)          result += 'font-weight: bold;';
		if (fontStyle & FontStyle.Italic)        result += 'font-style: italic;';
		if (fontStyle & FontStyle.Overline)      result += 'text-decoration: overline;';
		if (fontStyle & FontStyle.Underline)     result += 'text-decoration: underline;';
		if (fontStyle & FontStyle.Strikethrough) result += 'text-decoration: line-through;';
		return result;
	}

	

	public static getPresentation(metadata: number): ITokenPresentation {
		const foreground = this.getForeground(metadata);
		const background = this.getBackground(metadata);
		const fontStyle = this.getFontStyle(metadata);

		return <ITokenPresentation>{
			foreground: foreground,
			background: background,
			italic: Boolean(fontStyle & FontStyle.Italic),
			bold: Boolean(fontStyle & FontStyle.Bold),
			underline: Boolean(fontStyle & FontStyle.Underline),
			strikethrough: Boolean(fontStyle & FontStyle.Strikethrough),
		};
	}


	// public static decodeMetadata(metadata: number): IDecodedMetadata {
	// 	const colorMap = this._themeService.getColorTheme().tokenColorMap;
	// 	const languageId = TokenMetadata.getLanguageId(metadata);
	// 	const tokenType = TokenMetadata.getTokenType(metadata);
	// 	const fontStyle = TokenMetadata.getFontStyle(metadata);
	// 	const foreground = TokenMetadata.getForeground(metadata);
	// 	const background = TokenMetadata.getBackground(metadata);
	// 	return {
	// 		languageId: this._languageService.languageIdCodec.decodeLanguageId(languageId),
	// 		tokenType: tokenType,
	// 		bold: (fontStyle & FontStyle.Bold) ? true : undefined,
	// 		italic: (fontStyle & FontStyle.Italic) ? true : undefined,
	// 		underline: (fontStyle & FontStyle.Underline) ? true : undefined,
	// 		strikethrough: (fontStyle & FontStyle.Strikethrough) ? true : undefined,
	// 		foreground: colorMap[foreground],
	// 		background: colorMap[background]
	// 	};
	// }
}



function getDefaultMetadata(topLevelLanguageId: LanguageId): number {
	return (
		(topLevelLanguageId << MetadataConsts.LANGUAGEID_OFFSET)
		| (StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET)
		| (FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET)
		| (ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET)
		| (ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET)
		// If there is no grammar, we just take a guess and try to match brackets.
		| (MetadataConsts.B_BRACKETS_MASK)
	) >>> 0;
}









export type EncodedTokenAttributes = number;
// export type TokenMetadata = number;










export namespace EncodedTokenAttributes {
	export function toBinaryStr(encodedTokenAttributes: EncodedTokenAttributes): string {
		let r = encodedTokenAttributes.toString(2);
		while (r.length < 32) r = "0" + r;
		return r;
	}

	export function print(encodedTokenAttributes: EncodedTokenAttributes): void {
		const languageId = EncodedTokenAttributes.getLanguageId(encodedTokenAttributes);
		const tokenType = EncodedTokenAttributes.getTokenType(encodedTokenAttributes);
		const fontStyle = EncodedTokenAttributes.getFontStyle(encodedTokenAttributes);
		const foreground = EncodedTokenAttributes.getForeground(encodedTokenAttributes);
		const background = EncodedTokenAttributes.getBackground(encodedTokenAttributes);

		console.log({
			languageId: languageId,
			tokenType: tokenType,
			fontStyle: fontStyle,
			foreground: foreground,
			background: background,
		});
	}

	export function getLanguageId(encodedTokenAttributes: EncodedTokenAttributes): number {
		return ((encodedTokenAttributes & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET);
	}

	export function getTokenType(encodedTokenAttributes: EncodedTokenAttributes): StandardTokenType {
		return ((encodedTokenAttributes & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET);
	}

	export function getFontStyle(encodedTokenAttributes: EncodedTokenAttributes): number {
		return ((encodedTokenAttributes & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET);
	}

	export function getForeground(encodedTokenAttributes: EncodedTokenAttributes): number {
		return ((encodedTokenAttributes & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET);
	}

	export function getBackground(encodedTokenAttributes: EncodedTokenAttributes): number {
		return ((encodedTokenAttributes & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET);
	}

	export function containsBalancedBrackets(encodedTokenAttributes: EncodedTokenAttributes): boolean {
		return (encodedTokenAttributes & MetadataConsts.B_BRACKETS_MASK) !== 0;
	}

	/**
	 * Updates the fields in `metadata`.
	 * A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
	 */
	export function set(
		encodedTokenAttributes: EncodedTokenAttributes,
		languageId: number,
		tokenType: OptionalStandardTokenType,
		containsBalancedBrackets: boolean | null,
		fontStyle: FontStyle,
		foreground: number,
		background: number
	): number {
		let _languageId = EncodedTokenAttributes.getLanguageId(encodedTokenAttributes);
		let _tokenType = EncodedTokenAttributes.getTokenType(encodedTokenAttributes);
		let _containsBalancedBracketsBit: 0|1 =	EncodedTokenAttributes.containsBalancedBrackets(encodedTokenAttributes) ? 1:0;
		let _fontStyle = EncodedTokenAttributes.getFontStyle(encodedTokenAttributes);
		let _foreground = EncodedTokenAttributes.getForeground(encodedTokenAttributes);
		let _background = EncodedTokenAttributes.getBackground(encodedTokenAttributes);

		if (languageId !== 0) _languageId = languageId;
		if (tokenType !== OptionalStandardTokenType.NotSet) _tokenType = fromOptionalTokenType(tokenType);
		if (containsBalancedBrackets !== null) _containsBalancedBracketsBit = containsBalancedBrackets ? 1 : 0;
		if (fontStyle !== FontStyle.NotSet) _fontStyle = fontStyle;
		if (foreground !== 0) _foreground = foreground;
		if (background !== 0) _background = background;

		return (
			((_languageId << MetadataConsts.LANGUAGEID_OFFSET) |
				(_tokenType << MetadataConsts.TOKEN_TYPE_OFFSET) |
				(_containsBalancedBracketsBit << MetadataConsts.B_BRACKETS_OFFSET) |
				(_fontStyle << MetadataConsts.FONT_STYLE_OFFSET) |
				(_foreground << MetadataConsts.FOREGROUND_OFFSET) |
				(_background << MetadataConsts.BACKGROUND_OFFSET)) >>>
			0
		);
	}
}












export class TokenTools {


	public static findIndexOfType(tokens: IToken2Array, desiredType: StandardTokenType) {
		const count = (tokens.length >>> 1);
		for (let i = 0; i<count; i++) {
			if (TokenMetadata.getTokenType(tokens[(i<<1)+1]) == desiredType) return i;
		}
		return -1;
	}



	public static containsTokenType(tokens: IToken2Array, desiredType: StandardTokenType) {
		const count = (tokens.length >>> 1);
		let metaResult = 0;
		for (let i = 0; i<count; i++) metaResult |= tokens[(i<<1)+1];
		const IsolatedTypes = TokenMetadata.getTokenType(metaResult);
		return (IsolatedTypes & desiredType) === desiredType;

	}

}










export class Token {
	_tokenBrand: void = undefined;

	public readonly offset: number;
	public readonly type: string;
	public readonly language: string;

	constructor(offset: number, type: string, language: string) {
		this.offset = offset;
		this.type = type;
		this.language = language;
	}

	public toString(): string {
		return '('+this.offset+', '+this.type+')';
	}
}






























//https://github.com/microsoft/vscode/blob/main/src/vs/editor/common/languages/supports.ts







//  S=Start offset, E=End offset, M=metadata, T=Type
//         Array[ i=0 , i=1 , i=2 , i=3 , i=4 , i=5 , i=6 , i=7 ] Describes the format of the Uint32Array used to represent tokens
//              | E0  | M0  |     |     |     |     |     |     |
//              | S1  |     | E1  | M1  |     |     |     |     |
//              |     |     | S2  |     | E2  | M2  |     |     |
//              |     |     |     |     | S3  |     | E3  | M3  |
//              |  I-----------I-----------I-----------I---------...
// Odd=metadata         T0          T1          T2          T3
// Even=boundries

//      Count = i >> 1;





/**
 * @internal
 */
 export interface ILanguageIdCodec {
	encodeLanguageId(languageId: string): LanguageId;
	decodeLanguageId(languageId: LanguageId): string;
}







export interface IViewLineTokens {
	readonly count : int;

	equals(other: IViewLineTokens): boolean;
	getForeground(tokenIndex: number): ColorId;
	getEndOffset(tokenIndex: number): number;
	getClassName(tokenIndex: number): string;
	getInlineStyle(tokenIndex: number, colorMap: string[]): string;
	findTokenIndexAtOffset(offset: number): number;
}

export abstract class AbstractTokenArray {
	protected readonly _tokens: IToken2Array;
	protected readonly _tokensCount: number;
	protected readonly _tokensEndOffset: number;
	protected readonly _text: string;

	public get count(): number { return this._tokensCount; }
	public get text(): string { return this._text; }

	constructor(tokens: IToken2Array, text: string) {
		this._tokensCount = (tokens.length >>> 1);
		this._tokensEndOffset = text.length;
		this._tokens = tokens;
		this._text = text;
	}

	public Metadata(tokenIndex:number): number {
		return this._tokens[(tokenIndex << 1) + 1];
	}
	public StartOffset(tokenIndex: number): number {
		return (tokenIndex>0)? this._tokens[(tokenIndex-1) << 1] : 0;
	}
	public EndOffset(tokenIndex: number): number {
		return (tokenIndex<=this._tokensCount)? this._tokens[tokenIndex << 1] : this._tokensEndOffset;
	}

	/** Gets the combined metadata of all tokens in the line, this allows for easy queries. */
	public get LineMetadata() {
		let metaResult = 0;
		for (let i = 0; i<this._tokensCount; i++) metaResult |= this._tokens[(i<<1)+1];
		return metaResult;
	}

	public getTokenType 	(tokenIndex: number){ return TokenMetadata.getTokenType 	(this.Metadata(tokenIndex));}
	public getLanguageId 	(tokenIndex: number){ return TokenMetadata.getLanguageId 	(this.Metadata(tokenIndex));}
	public getFontStyle 	(tokenIndex: number){ return TokenMetadata.getFontStyle 	(this.Metadata(tokenIndex));}
	public getForeground 	(tokenIndex: number){ return TokenMetadata.getForeground 	(this.Metadata(tokenIndex));}
	public getBackground 	(tokenIndex: number){ return TokenMetadata.getBackground 	(this.Metadata(tokenIndex));}

	// public containsBalancedBrackets(metadata: number){ return TokenMetadata.hasBalancedBrackets(this.Metadata(tokenIndex));}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Conversions

	public toOffsetArray() : Array<number> {
		const offsets = new Array<number>(this._tokensCount+2);

		//Represents the start of the line
		offsets[0] = this.EndOffset(0);
		for (let i = 1; i<this._tokensCount; i++) offsets[i+1] = this.EndOffset(i);
		//Represents token at end of the line.
		offsets[this._tokensCount+1] = this._tokensEndOffset;

		return offsets;
	}

	public toTokenTypeArray() : Array<StandardTokenType> {
		return this.FromEnumerate(this.getTokenType);
	}

	public getToken(index:number):IToken2 {
		return <IToken2> {
			startOffset: (index>0)? this._tokens[(index-1) << 1] : 0,
			endOffset: (index<this._tokensCount)? this._tokens[index<<1] : this._tokensEndOffset,
			metaData: (index<this._tokensCount)? this._tokens[(index<<1)+1] : this._tokens[(this._tokensCount<<1)-1]
		};
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Queries

	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	 public IndexOf(offset: number): number {
		return AbstractTokenArray.findIndexInTokensArray(this._tokens, offset);
	}

	public Contains(tokenType:StandardTokenType) {
		return (TokenMetadata.getTokenType(this.LineMetadata) & tokenType) === tokenType;
	}

	public FindIndexOf(tokenType:StandardTokenType) {
		for (let i = 0; i<this._tokensCount; i++) {
			if (TokenMetadata.getTokenType(this._tokens[(i<<1)+1]) == tokenType) return i;
		}
		return -1;
	}

	

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Iterators
	protected *Enumerate(): Generator<number> { for (let i = 0; i<this._tokensCount; i++) yield i; }
	
	public *Metadatas() { for (let i = 0; i<this._tokensCount; i++) yield this._tokens[(i<<1)+1]; }
	public *Offsets() {
		for (let i = 0; i<this._tokensCount; i++) yield this._tokens[(i<<1)];
		yield this._tokensEndOffset;
	}
	
	protected FromEnumerate<T>(func: Func<[int], T>) {
		const returnArray = new Array<T>(this._tokensCount);
		for (let i = 0; i<this._tokensCount; i++) returnArray[i] = func(i);
		return returnArray;
	}

	protected ForEnumerate<T>(func: Action<[int]>) {
		const returnArray = new Array<T>(this._tokensCount);
		for (let i = 0; i<this._tokensCount; i++) func(i);
		return returnArray;
	}
	
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Static functions
	//Binary search
	public static findIndexInTokensArray(tokens: IToken2Array, desiredIndex: number): number {
		if (tokens.length <= 2) return 0;

		let low = 0;
		let high = (tokens.length >>> 1)-1;
		while (low < high) {
			const mid = low + ((high - low) >>> 1);
			const endOffset = tokens[(mid << 1)];

			if (endOffset === desiredIndex) return mid+1;
			else if (endOffset < desiredIndex) low = mid+1;
			else if (endOffset > desiredIndex) high = mid;
		}

		return low;
	}
}


























export class StandardLineTokens extends AbstractTokenArray {
	constructor(tokens: IToken2Array, text: string) {
		super(tokens, text);
	}

	public hasTokenType(tokenType:StandardTokenType) {
		return TokenTools.containsTokenType(this._tokens, tokenType);
	}

	public indexOf(tokenType:StandardTokenType) {
		return TokenTools.findIndexOfType(this._tokens, tokenType);
	}

	public offsetOf(tokenType:StandardTokenType) {
		const Index = TokenTools.findIndexOfType(this._tokens, tokenType);
		return (Index === -1)? -1 : this.EndOffset(Index);
	}

	public getOffsetDelta(tokenIndex: number): number {
		if (tokenIndex <= 0) return 0;
		const offsetStart = this._tokens[(tokenIndex-1) << 1];
		const offsetEnd = this._tokens[tokenIndex << 1];
		return offsetEnd-offsetStart;
	}



	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public findTokenIndexAtOffset(offset: number): number {
		return AbstractTokenArray.findIndexInTokensArray(this._tokens, offset);
	}
}




























export class LineTokens extends AbstractTokenArray implements IViewLineTokens {
	// _lineTokensBrand: void;
	constructor(tokens: IToken2Array, text: string) {
		super(tokens, text);
	}

	public equals(other: IViewLineTokens): boolean {
		return (other instanceof LineTokens) && this.slicedEquals(other, 0, this._tokensCount);
	}

	public slicedEquals(other: LineTokens, sliceFromTokenIndex: number, sliceTokenCount: number): boolean {
		if (this._text !== other._text) return false;
		if (this._tokensCount !== other._tokensCount) return false;

		const from = (sliceFromTokenIndex << 1);
		const to = from + (sliceTokenCount << 1);
		for (let i = from; i < to; i++) {
			if (this._tokens[i] !== other._tokens[i]) return false;
		}
		return true;
	}

	public getTokenType(tokenIndex: number): StandardTokenType { 
		return TokenMetadata.getTokenType(this.Metadata(tokenIndex));
	}

	public getLineContent(): string { return this._text; }

	public getStartOffset(tokenIndex: number): number {
		return (tokenIndex>0)? this._tokens[(tokenIndex - 1) << 1] : 0;
	}
	public getEndOffset(tokenIndex: number): number {
		return this._tokens[tokenIndex << 1];
	}



	public getClassName(tokenIndex: number): string {
		return TokenMetadata.getClassName(this.Metadata(tokenIndex));
	}

	public getInlineStyle(tokenIndex: number, colorMap: string[]): string {
		return TokenMetadata.getInlineStyle(this.Metadata(tokenIndex), colorMap);
	}


	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public findTokenIndexAtOffset(offset: number): number {
		return AbstractTokenArray.findIndexInTokensArray(this._tokens, offset);
	}


	public sliceAndInflate(startOffset: number, endOffset: number, deltaOffset: number): IViewLineTokens {
		return new SlicedLineTokens(this, startOffset, endOffset, deltaOffset);
	}

	public static convertToEndOffset(tokens: IToken2Array, lineTextLength: number): void {
		const tokenCount = (tokens.length >>> 1);
		const lastTokenIndex = tokenCount - 1;
		for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
			tokens[tokenIndex << 1] = tokens[(tokenIndex + 1) << 1];
		}
		tokens[lastTokenIndex << 1] = lineTextLength;
	}
}










export class SlicedLineTokens implements IViewLineTokens {
	private readonly _source: LineTokens;
	private readonly _startOffset: number;
	private readonly _endOffset: number;
	private readonly _deltaOffset: number;

	private readonly _firstTokenIndex: number;
	private readonly _tokensCount: number;

	constructor(source: LineTokens, startOffset: number, endOffset: number, deltaOffset: number) {
		this._source = source;
		this._startOffset = startOffset;
		this._endOffset = endOffset;
		this._deltaOffset = deltaOffset;
		this._firstTokenIndex = source.findTokenIndexAtOffset(startOffset);

		this._tokensCount = 0;
		for (let i = this._firstTokenIndex, len = source.count; i < len; i++) {
			if (source.getStartOffset(i) >= endOffset) break;
			else this._tokensCount++;
		}
	}

	public equals(other: IViewLineTokens): boolean {
		if (other instanceof SlicedLineTokens) {
			return (
				this._startOffset === other._startOffset
				&& this._endOffset === other._endOffset
				&& this._deltaOffset === other._deltaOffset
				&& this._source.slicedEquals(other._source, this._firstTokenIndex, this._tokensCount)
			);
		}
		return false;
	}

	public get count() { return this._tokensCount; }

	public getForeground(tokenIndex: number): ColorId {
		return this._source.getForeground(this._firstTokenIndex + tokenIndex);
	}

	public getEndOffset(tokenIndex: number): number {
		const tokenEndOffset = this._source.getEndOffset(this._firstTokenIndex + tokenIndex);
		return Math.min(this._endOffset, tokenEndOffset) - this._startOffset + this._deltaOffset;
	}

	public getClassName(tokenIndex: number): string {
		return this._source.getClassName(this._firstTokenIndex + tokenIndex);
	}

	public getInlineStyle(tokenIndex: number, colorMap: string[]): string {
		return this._source.getInlineStyle(this._firstTokenIndex + tokenIndex, colorMap);
	}

	public findTokenIndexAtOffset(offset: number): number {
		return this._source.findTokenIndexAtOffset(offset + this._startOffset - this._deltaOffset) - this._firstTokenIndex;
	}
}

















export class ScopedLineTokens {
	_scopedLineTokensBrand: void = undefined;

	// public readonly languageId: string;
	private readonly _actual: LineTokens;
	private readonly _firstTokenIndex: number;
	private readonly _lastTokenIndex: number;
	public readonly firstCharOffset: number;
	private readonly _lastCharOffset: number;

	constructor(
		actual: LineTokens,
		// languageId: string,
		firstTokenIndex: number,
		lastTokenIndex: number,
		firstCharOffset: number,
		lastCharOffset: number
	) {
		this._actual = actual;
		// this.languageId = languageId;
		this._firstTokenIndex = firstTokenIndex;
		this._lastTokenIndex = lastTokenIndex;
		this.firstCharOffset = firstCharOffset;
		this._lastCharOffset = lastCharOffset;
	}

	public static FromTokensOffset(context: LineTokens, offset: number) {
		const tokenCount = context.count;
		const tokenIndex = context.findTokenIndexAtOffset(offset);
		const desiredLanguageId = context.getLanguageId(tokenIndex);
	
		let lastTokenIndex = tokenIndex;
		while (lastTokenIndex+1 < tokenCount && context.getLanguageId(lastTokenIndex+1) === desiredLanguageId) lastTokenIndex++;
	
		let firstTokenIndex = tokenIndex;
		while (firstTokenIndex > 0 && context.getLanguageId(firstTokenIndex-1) === desiredLanguageId) firstTokenIndex--;
	
		return new ScopedLineTokens(
			context,
			// desiredLanguageId,
			firstTokenIndex,
			lastTokenIndex + 1,
			context.getStartOffset(firstTokenIndex),
			context.getEndOffset(lastTokenIndex)
		);
	}


	public getLineContent(): string {
		return this._actual.getLineContent().substring(this.firstCharOffset, this._lastCharOffset);
	}

	public getActualLineContentBefore(offset: number): string {
		return this._actual.getLineContent().substring(0, this.firstCharOffset + offset);
	}

	public getTokenCount(): number {
		return this._lastTokenIndex - this._firstTokenIndex;
	}

	public findTokenIndexAtOffset(offset: number): number {
		return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
	}

	public getStandardTokenType(tokenIndex: number): StandardTokenType {
		return this._actual.getTokenType(tokenIndex + this._firstTokenIndex);
	}
}






































// export class FullLineTokens {
// 	private readonly _tokensArr1: IToken1Array;
// 	private readonly _tokensArr2: IToken2Array;
// 	private readonly _tokensCount: number;
// 	private readonly _tokensEndOffset: number;
// 	private readonly _text: string;

// 	private GetMetadata(tokenIndex:number) {
// 		return this._tokensArr2[(tokenIndex << 1) + 1];
// 	}


// 	constructor(type1Tokens : IToken1Array, type2Tokens: IToken2Array, text: string) {
// 		this._tokensArr1 = type1Tokens;
// 		this._tokensArr2 = type2Tokens;
// 		this._tokensCount = (this._tokensArr2.length >>> 1);
// 		this._text = text;
// 		this._tokensEndOffset = text.length;
// 	}







// }







// export enum ScopeType {Ambiguous, Open, Close}

// export class ScopeSingle {
// 	public readonly tokenName: string;
// 	public readonly key: string;
// 	public readonly type: ScopeType;

// 	constructor(tokenName: string, type: ScopeType, key: string) {
// 		this.tokenName = tokenName;
// 		this.type = type;
// 		this.key = key;
// 	}
// }

// export class ScopePair {
// 	public readonly open?: string;
// 	public readonly close?: string|Array<string>;
// }

// export class ModifierPair {
// 	public readonly openingCharacter: string;
// 	public readonly closingCharacter: string;
// 	public counter = 0;

// 	constructor(openingCharacter: string, closingCharacter: string, counter?: number) {
// 		this.openingCharacter = openingCharacter;
// 		this.closingCharacter = closingCharacter;
// 		if (counter !== undefined) this.counter = counter;
// 	}

// 	public Clone() { return new ModifierPair(this.openingCharacter, this.closingCharacter, this.counter); }
// }









export const EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;




/** Represents contiguous tokens over a contiguous range of lines. **/
export class ContiguousMultilineTokens {

	public static deserialize(buff: Uint8Array, offset: number, result: ContiguousMultilineTokens[]): number {
		const view32 = new Uint32Array(buff.buffer);
		const startLineNumber = readUInt32BE(buff, offset); offset += 4;
		const count = readUInt32BE(buff, offset); offset += 4;
		const tokens: Uint32Array[] = [];
		for (let i = 0; i < count; i++) {
			const byteCount = readUInt32BE(buff, offset); offset += 4;
			tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
			offset += byteCount;
		}
		result.push(new ContiguousMultilineTokens(startLineNumber, tokens));
		return offset;
	}

	/** The start line number for this block of tokens. **/
	private _startLineNumber: number;

	/**
	 * The tokens are stored in a binary format. There is an element for each line,
	 * so `tokens[index]` contains all tokens on line `startLineNumber + index`.
	 *
	 * On a specific line, each token occupies two array indices. For token i:
	 *  - at offset 2*i => endOffset
	 *  - at offset 2*i + 1 => metadata
	 *
	 */
	private _tokens: (Uint32Array | ArrayBuffer | null)[];

	/** (Inclusive) start line number for these tokens. **/
	public get startLineNumber(): number {
		return this._startLineNumber;
	}

	/** (Inclusive) end line number for these tokens. **/
	public get endLineNumber(): number {
		return this._startLineNumber + this._tokens.length - 1;
	}

	constructor(startLineNumber: number, tokens: Uint32Array[]) {
		this._startLineNumber = startLineNumber;
		this._tokens = tokens;
	}

	/** @see {@link _tokens} **/
	public getLineTokens(lineNumber: number): Uint32Array | ArrayBuffer | null {
		return this._tokens[lineNumber - this._startLineNumber];
	}

	public appendLineTokens(lineTokens: Uint32Array): void {
		this._tokens.push(lineTokens);
	}

	public serializeSize(): number {
		let result = 0;
		result += 4; // 4 bytes for the start line number
		result += 4; // 4 bytes for the line count
		for (let i = 0; i < this._tokens.length; i++) {
			const lineTokens = this._tokens[i];
			if (!(lineTokens instanceof Uint32Array)) throw new Error(`Not supported!`);
			result += 4; // 4 bytes for the byte count
			result += lineTokens.byteLength;
		}
		return result;
	}

	public serialize(destination: Uint8Array, offset: number): number {
		writeUInt32BE(destination, this._startLineNumber, offset); offset += 4;
		writeUInt32BE(destination, this._tokens.length, offset); offset += 4;
		for (let i = 0; i < this._tokens.length; i++) {
			const lineTokens = this._tokens[i];
			if (!(lineTokens instanceof Uint32Array)) throw new Error(`Not supported!`);
			writeUInt32BE(destination, lineTokens.byteLength, offset); offset += 4;
			destination.set(new Uint8Array(lineTokens.buffer), offset); offset += lineTokens.byteLength;
		}
		return offset;
	}

	public applyEdit(range: Range, text: string): void {
		const [eolCount, firstLineLength] = countEOL(text);
		this._acceptDeleteRange(range);
		this._acceptInsertText(new Position(range.start.line+1, range.start.character+1), eolCount, firstLineLength);
	}

	private _acceptDeleteRange(range: Range): void {
		if (range.start.line === range.end.line && range.start.character === range.end.character) return; // Nothing to delete

		const firstLineIndex = (range.start.line+1) - this._startLineNumber;
		const lastLineIndex = (range.end.line+1) - this._startLineNumber;

		// this deletion occurs entirely before this block, so we only need to adjust line numbers
		if (lastLineIndex < 0) {
			const deletedLinesCount = lastLineIndex - firstLineIndex;
			this._startLineNumber -= deletedLinesCount;
			return;
		}

		// this deletion occurs entirely after this block, so there is nothing to do
		if (firstLineIndex >= this._tokens.length) return;

		// this deletion completely encompasses this block
		if (firstLineIndex < 0 && lastLineIndex >= this._tokens.length) {
			this._startLineNumber = 0;
			this._tokens = [];
			return;
		}

		// a delete on a single line
		if (firstLineIndex === lastLineIndex) {
			this._tokens[firstLineIndex] = ContiguousTokensEditing.delete(this._tokens[firstLineIndex], range.start.character, range.end.character);
			return;
		}

		if (firstLineIndex >= 0) {
			// The first line survives
			this._tokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[firstLineIndex], range.end.character);

			if (lastLineIndex < this._tokens.length) {
				// The last line survives
				const lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.end.character);

				// Take remaining text on last line and append it to remaining text on first line
				this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], lastLineTokens);

				// Delete middle lines
				this._tokens.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
			} else {
				// The last line does not survive

				// Take remaining text on last line and append it to remaining text on first line
				this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], null);

				// Delete lines
				this._tokens = this._tokens.slice(0, firstLineIndex + 1);
			}
		} else {
			// The first line does not survive

			const deletedBefore = -firstLineIndex;
			this._startLineNumber -= deletedBefore;

			// Remove beginning from last line
			this._tokens[lastLineIndex] = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.end.character);

			// Delete lines
			this._tokens = this._tokens.slice(lastLineIndex);
		}
	}

	private _acceptInsertText(position: Position, eolCount: number, firstLineLength: number): void {
		if (eolCount === 0 && firstLineLength === 0) return; // Nothing to insert

		const lineIndex = (position.line+1) - this._startLineNumber;

		// this insertion occurs before this block, so we only need to adjust line numbers
		if (lineIndex < 0) {
			this._startLineNumber += eolCount;
			return;
		}

		// this insertion occurs after this block, so there is nothing to do
		if (lineIndex >= this._tokens.length) return;
		
		// Inserting text on one line
		if (eolCount === 0) {
			this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.character, firstLineLength);
			return;
		}

		this._tokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[lineIndex], position.character);
		this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.character, firstLineLength);

		this._insertLines(position.line+1, eolCount);
	}

	private _insertLines(insertIndex: number, insertCount: number): void {
		if (insertCount === 0) return;

		const lineTokens: (Uint32Array | ArrayBuffer | null)[] = new Array(insertCount);
		for (let i = 0; i < insertCount; i++) lineTokens[i] = null;
		this._tokens = arrayInsert(this._tokens, insertIndex, lineTokens);
	}
}






export class ContiguousTokensEditing {
	private static IsNullOrEmpty(lineTokens: Uint32Array|ArrayBuffer|null) : lineTokens is null { return (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS);}

	public static deleteBeginning(lineTokens: Uint32Array | ArrayBuffer | null, toChIndex: number): Uint32Array | ArrayBuffer | null {
		if (ContiguousTokensEditing.IsNullOrEmpty(lineTokens)) return lineTokens;
		return ContiguousTokensEditing.delete(lineTokens, 0, toChIndex);
	}

	public static deleteEnding(lineTokens: Uint32Array | ArrayBuffer | null, fromChIndex: number): Uint32Array | ArrayBuffer | null {
		if (ContiguousTokensEditing.IsNullOrEmpty(lineTokens)) return lineTokens;

		const tokens = toUint32Array(lineTokens);
		const lineTextLength = tokens[tokens.length - 2];
		return ContiguousTokensEditing.delete(lineTokens, fromChIndex, lineTextLength);
	}

	public static delete(lineTokens: Uint32Array | ArrayBuffer | null, fromChIndex: number, toChIndex: number): Uint32Array | ArrayBuffer | null {
		if (ContiguousTokensEditing.IsNullOrEmpty(lineTokens) || fromChIndex === toChIndex) return lineTokens;

		const tokens = toUint32Array(lineTokens);
		const tokensCount = (tokens.length >>> 1);

		// special case: deleting everything
		if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) return EMPTY_LINE_TOKENS;

		const fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, fromChIndex);
		const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
		const fromTokenEndOffset = tokens[fromTokenIndex << 1];

		if (toChIndex < fromTokenEndOffset) {
			// the delete range is inside a single token
			const delta = (toChIndex - fromChIndex);
			for (let i = fromTokenIndex; i < tokensCount; i++) tokens[i << 1] -= delta;
			return lineTokens;
		}

		let dest: number;
		let lastEnd: number;
		if (fromTokenStartOffset !== fromChIndex) {
			tokens[fromTokenIndex << 1] = fromChIndex;
			dest = ((fromTokenIndex + 1) << 1);
			lastEnd = fromChIndex;
		} else {
			dest = (fromTokenIndex << 1);
			lastEnd = fromTokenStartOffset;
		}

		const delta = (toChIndex - fromChIndex);
		for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
			const tokenEndOffset = tokens[tokenIndex << 1] - delta;
			if (tokenEndOffset > lastEnd) {
				tokens[dest++] = tokenEndOffset;
				tokens[dest++] = tokens[(tokenIndex << 1) + 1];
				lastEnd = tokenEndOffset;
			}
		}

		if (dest === tokens.length) return lineTokens; // nothing to trim

		const tmp = new Uint32Array(dest);
		tmp.set(tokens.subarray(0, dest), 0);
		return tmp.buffer;
	}

	public static append(lineTokens: Uint32Array | ArrayBuffer | null, _otherTokens: Uint32Array | ArrayBuffer | null): Uint32Array | ArrayBuffer | null {
		if (_otherTokens === EMPTY_LINE_TOKENS) return lineTokens;
		if (lineTokens === EMPTY_LINE_TOKENS) return _otherTokens;
		if (lineTokens === null) return lineTokens;
		if (_otherTokens === null) return null; // cannot determine combined line length...

		const myTokens = toUint32Array(lineTokens);
		const otherTokens = toUint32Array(_otherTokens);
		const otherTokensCount = (otherTokens.length >>> 1);

		const result = new Uint32Array(myTokens.length + otherTokens.length);
		result.set(myTokens, 0);
		let dest = myTokens.length;
		const delta = myTokens[myTokens.length - 2];
		for (let i = 0; i < otherTokensCount; i++) {
			result[dest++] = otherTokens[(i << 1) + 0] + delta;
			result[dest++] = otherTokens[(i << 1) + 1];
		}
		return result.buffer;
	}

	public static insert(lineTokens: Uint32Array | ArrayBuffer | null, chIndex: number, textLength: number): Uint32Array | ArrayBuffer | null {
		if (ContiguousTokensEditing.IsNullOrEmpty(lineTokens)) return lineTokens; // nothing to do

		const tokens = toUint32Array(lineTokens);
		const tokensCount = (tokens.length >>> 1);

		let fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, chIndex);
		if (fromTokenIndex > 0 && tokens[(fromTokenIndex - 1) << 1] === chIndex) fromTokenIndex--;
		for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) tokens[tokenIndex << 1] += textLength;
		return lineTokens;
	}
}


export class ContiguousMultilineTokensBuilder {

	public static deserialize(buff: Uint8Array): ContiguousMultilineTokens[] {
		let offset = 0;
		const count = readUInt32BE(buff, offset); offset += 4;
		const result: ContiguousMultilineTokens[] = [];
		for (let i = 0; i < count; i++) offset = ContiguousMultilineTokens.deserialize(buff, offset, result);
		return result;
	}

	private readonly _tokens: ContiguousMultilineTokens[];

	constructor() {
		this._tokens = [];
	}

	public add(lineNumber: number, lineTokens: Uint32Array): void {
		if (this._tokens.length > 0) {
			const last = this._tokens[this._tokens.length - 1];
			if (last.endLineNumber + 1 === lineNumber) {
				last.appendLineTokens(lineTokens);
				return;
			}
		}
		this._tokens.push(new ContiguousMultilineTokens(lineNumber, [lineTokens]));
	}

	public finalize(): ContiguousMultilineTokens[] {
		return this._tokens;
	}

	public serialize(): Uint8Array {
		const size = this._serializeSize();
		const result = new Uint8Array(size);
		this._serialize(result);
		return result;
	}

	private _serializeSize(): number {
		let result = 0;
		result += 4; // 4 bytes for the count
		for (let i = 0; i < this._tokens.length; i++) {
			result += this._tokens[i].serializeSize();
		}
		return result;
	}

	private _serialize(destination: Uint8Array): void {
		let offset = 0;
		writeUInt32BE(destination, this._tokens.length, offset); offset += 4;
		for (let i = 0; i < this._tokens.length; i++) {
			offset = this._tokens[i].serialize(destination, offset);
		}
	}
}







/**
 * Represents contiguous tokens in a text model.
 */
 export class ContiguousTokensStore {
	private _lineTokens: (Uint32Array | ArrayBuffer | null)[];
	private _len: number;
	private readonly _languageIdCodec: ILanguageIdCodec;

	constructor(languageIdCodec: ILanguageIdCodec) {
		this._lineTokens = [];
		this._len = 0;
		this._languageIdCodec = languageIdCodec;
	}

	public flush(): void {
		this._lineTokens = [];
		this._len = 0;
	}

	public getTokens(topLevelLanguageId: string, lineIndex: number, lineText: string): LineTokens {
		let rawLineTokens: Uint32Array | ArrayBuffer | null = null;
		if (lineIndex < this._len) rawLineTokens = this._lineTokens[lineIndex];
		if (rawLineTokens !== null && rawLineTokens !== EMPTY_LINE_TOKENS) {
			// return new LineTokens(toUint32Array(rawLineTokens), lineText, this._languageIdCodec);
			return new LineTokens(toUint32Array(rawLineTokens), lineText);
		}

		const lineTokens = new Uint32Array(2);
		lineTokens[0] = lineText.length;
		lineTokens[1] = getDefaultMetadata(this._languageIdCodec.encodeLanguageId(topLevelLanguageId));
		// return new LineTokens(lineTokens, lineText, this._languageIdCodec);
		return new LineTokens(lineTokens, lineText);
	}

	private static _massageTokens(topLevelLanguageId: LanguageId, lineTextLength: number, _tokens: Uint32Array | ArrayBuffer | null): Uint32Array | ArrayBuffer {

		const tokens = _tokens ? toUint32Array(_tokens) : null;

		if (lineTextLength === 0) {
			let hasDifferentLanguageId = false;
			if (tokens && tokens.length > 1) hasDifferentLanguageId = (TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId);
			if (!hasDifferentLanguageId) return EMPTY_LINE_TOKENS;
		}

		if (!tokens || tokens.length === 0) {
			const tokens = new Uint32Array(2);
			tokens[0] = lineTextLength;
			tokens[1] = getDefaultMetadata(topLevelLanguageId);
			return tokens.buffer;
		}

		// Ensure the last token covers the end of the text
		tokens[tokens.length - 2] = lineTextLength;
		
		return ((tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength)
			? tokens.buffer // Store directly the ArrayBuffer pointer to save an object
			: tokens
		);
	}

	private _ensureLine(lineIndex: number): void {
		while (lineIndex >= this._len) {
			this._lineTokens[this._len] = null;
			this._len++;
		}
	}

	private _deleteLines(start: number, deleteCount: number): void {
		if (deleteCount === 0) return;

		if (start + deleteCount > this._len) deleteCount = this._len - start;
		this._lineTokens.splice(start, deleteCount);
		this._len -= deleteCount;
	}

	private _insertLines(insertIndex: number, insertCount: number): void {
		if (insertCount === 0) return;

		const lineTokens: (Uint32Array | ArrayBuffer | null)[] = [];
		for (let i = 0; i < insertCount; i++) lineTokens[i] = null;
		this._lineTokens = arrayInsert(this._lineTokens, insertIndex, lineTokens);
		this._len += insertCount;
	}

	public setTokens(topLevelLanguageId: string, lineIndex: number, lineTextLength: number, _tokens: Uint32Array | ArrayBuffer | null, checkEquality: boolean): boolean {
		const tokens = ContiguousTokensStore._massageTokens(this._languageIdCodec.encodeLanguageId(topLevelLanguageId), lineTextLength, _tokens);
		this._ensureLine(lineIndex);
		const oldTokens = this._lineTokens[lineIndex];
		this._lineTokens[lineIndex] = tokens;
		
		return (checkEquality)? !ContiguousTokensStore._equals(oldTokens, tokens) : false;
	}

	private static _equals(_a: Uint32Array | ArrayBuffer | null, _b: Uint32Array | ArrayBuffer | null) {
		if (!_a || !_b) return !_a && !_b;

		const a = toUint32Array(_a);
		const b = toUint32Array(_b);

		if (a.length !== b.length) return false;
		for (let i = 0, len = a.length; i < len; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	//#region Editing

	public acceptEdit(range: Range, eolCount: number, firstLineLength: number): void {
		this._acceptDeleteRange(range);
		this._acceptInsertText(new Position(range.start.line+1, range.start.character+1), eolCount, firstLineLength);
	}

	private _acceptDeleteRange(range: Range): void {

		const firstLineIndex = range.start.line;
		if (firstLineIndex >= this._len) return;

		if (range.start.line === range.end.line) {
			if (range.start.character === range.end.character) return; // Nothing to delete

			this._lineTokens[firstLineIndex] = ContiguousTokensEditing.delete(this._lineTokens[firstLineIndex], range.start.character, range.end.character);
			return;
		}

		this._lineTokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._lineTokens[firstLineIndex], range.start.character);

		const lastLineIndex = range.end.line;
		let lastLineTokens: Uint32Array | ArrayBuffer | null = null;
		if (lastLineIndex < this._len) lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._lineTokens[lastLineIndex], range.end.character);

		// Take remaining text on last line and append it to remaining text on first line
		this._lineTokens[firstLineIndex] = ContiguousTokensEditing.append(this._lineTokens[firstLineIndex], lastLineTokens);

		// Delete middle lines
		this._deleteLines(range.start.line+1, range.end.line - range.start.line);
	}

	private _acceptInsertText(position: Position, eolCount: number, firstLineLength: number): void {

		if (eolCount === 0 && firstLineLength === 0) return; // Nothing to insert

		const lineIndex = position.line;
		if (lineIndex >= this._len) return;

		if (eolCount === 0) { // Inserting text on one line
			this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position.character, firstLineLength);
			return;
		}

		this._lineTokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._lineTokens[lineIndex], position.character);
		this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position.character, firstLineLength);

		this._insertLines(position.line+1, eolCount);
	}

	//#endregion
}

































/**
 * Represents sparse tokens over a contiguous range of lines.
 */
 export class SparseMultilineTokens {

	public static create(startLineNumber: number, tokens: Uint32Array): SparseMultilineTokens {
		return new SparseMultilineTokens(startLineNumber, new SparseMultilineTokensStorage(tokens));
	}

	private _startLineNumber: number;
	private _endLineNumber: number;
	private readonly _tokens: SparseMultilineTokensStorage;

	/**
	 * (Inclusive) start line number for these tokens.
	 */
	public get startLineNumber(): number {
		return this._startLineNumber;
	}

	/**
	 * (Inclusive) end line number for these tokens.
	 */
	public get endLineNumber(): number {
		return this._endLineNumber;
	}

	private constructor(startLineNumber: number, tokens: SparseMultilineTokensStorage) {
		this._startLineNumber = startLineNumber;
		this._tokens = tokens;
		this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
	}

	public toString(): string {
		return this._tokens.toString(this._startLineNumber);
	}

	private _updateEndLineNumber(): void {
		this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
	}

	public isEmpty(): boolean {
		return this._tokens.isEmpty();
	}

	public getLineTokens(lineNumber: number): SparseLineTokens | null {
		if (this._startLineNumber <= lineNumber && lineNumber <= this._endLineNumber) {
			return this._tokens.getLineTokens(lineNumber - this._startLineNumber);
		}
		return null;
	}

	public getRange(): Range | null {
		const deltaRange = this._tokens.getRange();
		if (!deltaRange) {
			return deltaRange;
		}
		return new Range(this._startLineNumber + deltaRange.start.line+1, deltaRange.start.character+1, this._startLineNumber + deltaRange.end.line+1, deltaRange.end.character+1);
	}

	public removeTokens(range: Range): void {
		const startLineIndex = range.start.line+1 - this._startLineNumber;
		const endLineIndex = range.end.line+1 - this._startLineNumber;

		this._startLineNumber += this._tokens.removeTokens(startLineIndex, range.start.character, endLineIndex, range.end.character);
		this._updateEndLineNumber();
	}

	public split(range: Range): [SparseMultilineTokens, SparseMultilineTokens] {
		// split tokens to two:
		// a) all the tokens before `range`
		// b) all the tokens after `range`
		const startLineIndex = range.start.line+1 - this._startLineNumber;
		const endLineIndex = range.end.line+1 - this._startLineNumber;

		const [a, b, bDeltaLine] = this._tokens.split(startLineIndex, range.start.character, endLineIndex, range.end.character);
		return [new SparseMultilineTokens(this._startLineNumber, a), new SparseMultilineTokens(this._startLineNumber + bDeltaLine, b)];
	}

	public applyEdit(range: Range, text: string): void {
		const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
		this.acceptEdit(range, eolCount, firstLineLength, lastLineLength, text.length > 0 ? text.charCodeAt(0) : CharCode.Null);
	}

	public acceptEdit(range: Range, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void {
		this._acceptDeleteRange(range);
		this._acceptInsertText(new Position(range.start.line+1, range.start.character+1), eolCount, firstLineLength, lastLineLength, firstCharCode);
		this._updateEndLineNumber();
	}

	private _acceptDeleteRange(range: Range): void {
		if (range.start.line === range.end.line && range.start.character === range.end.character) {
			// Nothing to delete
			return;
		}

		const firstLineIndex = range.start.line+1 - this._startLineNumber;
		const lastLineIndex = range.end.line+1 - this._startLineNumber;

		if (lastLineIndex < 0) {
			// this deletion occurs entirely before this block, so we only need to adjust line numbers
			const deletedLinesCount = lastLineIndex - firstLineIndex;
			this._startLineNumber -= deletedLinesCount;
			return;
		}

		const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();

		if (firstLineIndex >= tokenMaxDeltaLine + 1) {
			// this deletion occurs entirely after this block, so there is nothing to do
			return;
		}

		if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
			// this deletion completely encompasses this block
			this._startLineNumber = 0;
			this._tokens.clear();
			return;
		}

		if (firstLineIndex < 0) {
			const deletedBefore = -firstLineIndex;
			this._startLineNumber -= deletedBefore;

			this._tokens.acceptDeleteRange(range.start.character, 0, 0, lastLineIndex, range.end.character);
		} else {
			this._tokens.acceptDeleteRange(0, firstLineIndex, range.start.character, lastLineIndex, range.end.character);
		}
	}

	private _acceptInsertText(position: Position, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void {

		if (eolCount === 0 && firstLineLength === 0) {
			// Nothing to insert
			return;
		}

		const lineIndex = position.line+1 - this._startLineNumber;

		if (lineIndex < 0) {
			// this insertion occurs before this block, so we only need to adjust line numbers
			this._startLineNumber += eolCount;
			return;
		}

		const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();

		if (lineIndex >= tokenMaxDeltaLine + 1) {
			// this insertion occurs after this block, so there is nothing to do
			return;
		}

		this._tokens.acceptInsertText(lineIndex, position.character, eolCount, firstLineLength, lastLineLength, firstCharCode);
	}
}

class SparseMultilineTokensStorage {
	/**
	 * The encoding of tokens is:
	 *  4*i    deltaLine (from `startLineNumber`)
	 *  4*i+1  startCharacter (from the line start)
	 *  4*i+2  endCharacter (from the line start)
	 *  4*i+3  metadata
	 */
	private readonly _tokens: Uint32Array;
	private _tokenCount: number;

	constructor(tokens: Uint32Array) {
		this._tokens = tokens;
		this._tokenCount = tokens.length / 4;
	}

	public toString(startLineNumber: number): string {
		const pieces: string[] = new Array<string>(this._tokenCount);
		for (let i = 0; i < this._tokenCount; i++) {
			pieces.push(`(${this._getDeltaLine(i) + startLineNumber},${this._getStartCharacter(i)}-${this._getEndCharacter(i)})`);
		}
		return `[${pieces.join(',')}]`;
	}

	public getMaxDeltaLine(): number {
		const tokenCount = this._getTokenCount();
		return (tokenCount === 0)? -1 : this._getDeltaLine(tokenCount - 1);
	}

	public getRange(): Range | null {
		const tokenCount = this._getTokenCount();
		if (tokenCount === 0) return null;
		const startChar = this._getStartCharacter(0);
		const maxDeltaLine = this._getDeltaLine(tokenCount - 1);
		const endChar = this._getEndCharacter(tokenCount - 1);
		return new Range(0, startChar + 1, maxDeltaLine, endChar + 1);
	}

	private _getTokenCount(): number {
		return this._tokenCount;
	}

	private _getDeltaLine(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex];
	}

	private _getStartCharacter(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex + 1];
	}

	private _getEndCharacter(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex + 2];
	}

	public isEmpty(): boolean {
		return (this._getTokenCount() === 0);
	}

	public getLineTokens(deltaLine: number): SparseLineTokens | null {
		let low = 0;
		let high = this._getTokenCount() - 1;

		while (low < high) {
			const mid = low + Math.floor((high - low) / 2);
			const midDeltaLine = this._getDeltaLine(mid);

			if (midDeltaLine < deltaLine) {
				low = mid + 1;
			} else if (midDeltaLine > deltaLine) {
				high = mid - 1;
			} else {
				let min = mid;
				while (min > low && this._getDeltaLine(min - 1) === deltaLine) {
					min--;
				}
				let max = mid;
				while (max < high && this._getDeltaLine(max + 1) === deltaLine) {
					max++;
				}
				return new SparseLineTokens(this._tokens.subarray(4 * min, 4 * max + 4));
			}
		}

		if (this._getDeltaLine(low) === deltaLine) {
			return new SparseLineTokens(this._tokens.subarray(4 * low, 4 * low + 4));
		}

		return null;
	}

	public clear(): void {
		this._tokenCount = 0;
	}

	public removeTokens(startDeltaLine: number, startChar: number, endDeltaLine: number, endChar: number): number {
		const tokens = this._tokens;
		const tokenCount = this._tokenCount;
		let newTokenCount = 0;
		let hasDeletedTokens = false;
		let firstDeltaLine = 0;
		for (let i = 0; i < tokenCount; i++) {
			const srcOffset = 4 * i;
			const tokenDeltaLine = tokens[srcOffset];
			const tokenStartCharacter = tokens[srcOffset + 1];
			const tokenEndCharacter = tokens[srcOffset + 2];
			const tokenMetadata = tokens[srcOffset + 3];

			if (
				(tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))
				&& (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))
			) {
				hasDeletedTokens = true;
			} else {
				if (newTokenCount === 0) {
					firstDeltaLine = tokenDeltaLine;
				}
				if (hasDeletedTokens) {
					// must move the token to the left
					const destOffset = 4 * newTokenCount;
					tokens[destOffset] = tokenDeltaLine - firstDeltaLine;
					tokens[destOffset + 1] = tokenStartCharacter;
					tokens[destOffset + 2] = tokenEndCharacter;
					tokens[destOffset + 3] = tokenMetadata;
				}
				newTokenCount++;
			}
		}

		this._tokenCount = newTokenCount;

		return firstDeltaLine;
	}

	public split(startDeltaLine: number, startChar: number, endDeltaLine: number, endChar: number): [SparseMultilineTokensStorage, SparseMultilineTokensStorage, number] {
		const tokens = this._tokens;
		const tokenCount = this._tokenCount;
		const aTokens: number[] = [];
		const bTokens: number[] = [];
		let destTokens: number[] = aTokens;
		let destOffset = 0;
		let destFirstDeltaLine: number = 0;
		for (let i = 0; i < tokenCount; i++) {
			const srcOffset = 4 * i;
			const tokenDeltaLine = tokens[srcOffset];
			const tokenStartCharacter = tokens[srcOffset + 1];
			const tokenEndCharacter = tokens[srcOffset + 2];
			const tokenMetadata = tokens[srcOffset + 3];

			if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))) {
				if ((tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
					// this token is touching the range
					continue;
				} else {
					// this token is after the range
					if (destTokens !== bTokens) {
						// this token is the first token after the range
						destTokens = bTokens;
						destOffset = 0;
						destFirstDeltaLine = tokenDeltaLine;
					}
				}
			}

			destTokens[destOffset++] = tokenDeltaLine - destFirstDeltaLine;
			destTokens[destOffset++] = tokenStartCharacter;
			destTokens[destOffset++] = tokenEndCharacter;
			destTokens[destOffset++] = tokenMetadata;
		}

		return [new SparseMultilineTokensStorage(new Uint32Array(aTokens)), new SparseMultilineTokensStorage(new Uint32Array(bTokens)), destFirstDeltaLine];
	}

	public acceptDeleteRange(horizontalShiftForFirstLineTokens: number, startDeltaLine: number, startCharacter: number, endDeltaLine: number, endCharacter: number): void {
		// This is a bit complex, here are the cases I used to think about this:
		//
		// 1. The token starts before the deletion range
		// 1a. The token is completely before the deletion range
		//               -----------
		//                          xxxxxxxxxxx
		// 1b. The token starts before, the deletion range ends after the token
		//               -----------
		//                      xxxxxxxxxxx
		// 1c. The token starts before, the deletion range ends precisely with the token
		//               ---------------
		//                      xxxxxxxx
		// 1d. The token starts before, the deletion range is inside the token
		//               ---------------
		//                    xxxxx
		//
		// 2. The token starts at the same position with the deletion range
		// 2a. The token starts at the same position, and ends inside the deletion range
		//               -------
		//               xxxxxxxxxxx
		// 2b. The token starts at the same position, and ends at the same position as the deletion range
		//               ----------
		//               xxxxxxxxxx
		// 2c. The token starts at the same position, and ends after the deletion range
		//               -------------
		//               xxxxxxx
		//
		// 3. The token starts inside the deletion range
		// 3a. The token is inside the deletion range
		//                -------
		//             xxxxxxxxxxxxx
		// 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
		//                ----------
		//             xxxxxxxxxxxxx
		// 3c. The token starts inside the deletion range, and ends after the deletion range
		//                ------------
		//             xxxxxxxxxxx
		//
		// 4. The token starts after the deletion range
		//                  -----------
		//          xxxxxxxx
		//
		const tokens = this._tokens;
		const tokenCount = this._tokenCount;
		const deletedLineCount = (endDeltaLine - startDeltaLine);
		let newTokenCount = 0;
		let hasDeletedTokens = false;
		for (let i = 0; i < tokenCount; i++) {
			const srcOffset = 4 * i;
			let tokenDeltaLine = tokens[srcOffset];
			let tokenStartCharacter = tokens[srcOffset + 1];
			let tokenEndCharacter = tokens[srcOffset + 2];
			const tokenMetadata = tokens[srcOffset + 3];

			if (tokenDeltaLine < startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter <= startCharacter)) {
				// 1a. The token is completely before the deletion range
				// => nothing to do
				newTokenCount++;
				continue;
			} else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter < startCharacter) {
				// 1b, 1c, 1d
				// => the token survives, but it needs to shrink
				if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
					// 1d. The token starts before, the deletion range is inside the token
					// => the token shrinks by the deletion character count
					tokenEndCharacter -= (endCharacter - startCharacter);
				} else {
					// 1b. The token starts before, the deletion range ends after the token
					// 1c. The token starts before, the deletion range ends precisely with the token
					// => the token shrinks its ending to the deletion start
					tokenEndCharacter = startCharacter;
				}
			} else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter === startCharacter) {
				// 2a, 2b, 2c
				if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
					// 2c. The token starts at the same position, and ends after the deletion range
					// => the token shrinks by the deletion character count
					tokenEndCharacter -= (endCharacter - startCharacter);
				} else {
					// 2a. The token starts at the same position, and ends inside the deletion range
					// 2b. The token starts at the same position, and ends at the same position as the deletion range
					// => the token is deleted
					hasDeletedTokens = true;
					continue;
				}
			} else if (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter < endCharacter)) {
				// 3a, 3b, 3c
				if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
					// 3c. The token starts inside the deletion range, and ends after the deletion range
					// => the token moves left and shrinks
					if (tokenDeltaLine === startDeltaLine) {
						// the deletion started on the same line as the token
						// => the token moves left and shrinks
						tokenStartCharacter = startCharacter;
						tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
					} else {
						// the deletion started on a line above the token
						// => the token moves to the beginning of the line
						tokenStartCharacter = 0;
						tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
					}
				} else {
					// 3a. The token is inside the deletion range
					// 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
					// => the token is deleted
					hasDeletedTokens = true;
					continue;
				}
			} else if (tokenDeltaLine > endDeltaLine) {
				// 4. (partial) The token starts after the deletion range, on a line below...
				if (deletedLineCount === 0 && !hasDeletedTokens) {
					// early stop, there is no need to walk all the tokens and do nothing...
					newTokenCount = tokenCount;
					break;
				}
				tokenDeltaLine -= deletedLineCount;
			} else if (tokenDeltaLine === endDeltaLine && tokenStartCharacter >= endCharacter) {
				// 4. (continued) The token starts after the deletion range, on the last line where a deletion occurs
				if (horizontalShiftForFirstLineTokens && tokenDeltaLine === 0) {
					tokenStartCharacter += horizontalShiftForFirstLineTokens;
					tokenEndCharacter += horizontalShiftForFirstLineTokens;
				}
				tokenDeltaLine -= deletedLineCount;
				tokenStartCharacter -= (endCharacter - startCharacter);
				tokenEndCharacter -= (endCharacter - startCharacter);
			} else throw new Error(`Not possible!`);

			const destOffset = 4 * newTokenCount;
			tokens[destOffset] = tokenDeltaLine;
			tokens[destOffset + 1] = tokenStartCharacter;
			tokens[destOffset + 2] = tokenEndCharacter;
			tokens[destOffset + 3] = tokenMetadata;
			newTokenCount++;
		}

		this._tokenCount = newTokenCount;
	}

	public acceptInsertText(deltaLine: number, character: number, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void {
		// Here are the cases I used to think about this:
		//
		// 1. The token is completely before the insertion point
		//            -----------   |
		// 2. The token ends precisely at the insertion point
		//            -----------|
		// 3. The token contains the insertion point
		//            -----|------
		// 4. The token starts precisely at the insertion point
		//            |-----------
		// 5. The token is completely after the insertion point
		//            |   -----------
		//
		const isInsertingPreciselyOneWordCharacter = (
			eolCount === 0 && firstLineLength === 1
			&& (
				(firstCharCode >= CharCode.Digit0 && firstCharCode <= CharCode.Digit9)
				|| (firstCharCode >= CharCode.A && firstCharCode <= CharCode.Z)
				|| (firstCharCode >= CharCode.a && firstCharCode <= CharCode.z)
			)
		);
		const tokens = this._tokens;
		const tokenCount = this._tokenCount;
		for (let i = 0; i < tokenCount; i++) {
			const offset = 4 * i;
			let tokenDeltaLine = tokens[offset];
			let tokenStartCharacter = tokens[offset + 1];
			let tokenEndCharacter = tokens[offset + 2];

			if (tokenDeltaLine < deltaLine || (tokenDeltaLine === deltaLine && tokenEndCharacter < character)) {
				// 1. The token is completely before the insertion point
				// => nothing to do
				continue;
			} else if (tokenDeltaLine === deltaLine && tokenEndCharacter === character) {
				// 2. The token ends precisely at the insertion point
				// => expand the end character only if inserting precisely one character that is a word character
				if (isInsertingPreciselyOneWordCharacter) tokenEndCharacter += 1;
				else continue;
			} else if (tokenDeltaLine === deltaLine && tokenStartCharacter < character && character < tokenEndCharacter) {
				// 3. The token contains the insertion point
				if (eolCount === 0) {
					// => just expand the end character
					tokenEndCharacter += firstLineLength;
				} else {
					// => cut off the token
					tokenEndCharacter = character;
				}
			} else {
				// 4. or 5.
				if (tokenDeltaLine === deltaLine && tokenStartCharacter === character) {
					// 4. The token starts precisely at the insertion point
					// => grow the token (by keeping its start constant) only if inserting precisely one character that is a word character
					// => otherwise behave as in case 5.
					if (isInsertingPreciselyOneWordCharacter) continue;
				}
				// => the token must move and keep its size constant
				if (tokenDeltaLine === deltaLine) {
					tokenDeltaLine += eolCount;
					// this token is on the line where the insertion is taking place
					if (eolCount === 0) {
						tokenStartCharacter += firstLineLength;
						tokenEndCharacter += firstLineLength;
					} else {
						const tokenLength = tokenEndCharacter - tokenStartCharacter;
						tokenStartCharacter = lastLineLength + (tokenStartCharacter - character);
						tokenEndCharacter = tokenStartCharacter + tokenLength;
					}
				} else {
					tokenDeltaLine += eolCount;
				}
			}

			tokens[offset + 0] = tokenDeltaLine;
			tokens[offset + 1] = tokenStartCharacter;
			tokens[offset + 2] = tokenEndCharacter;
		}
	}
}

export class SparseLineTokens {

	private readonly _tokens: Uint32Array;

	constructor(tokens: Uint32Array) {
		this._tokens = tokens;
	}

	public getCount(): number {
		return this._tokens.length / 4;
	}

	public getStartCharacter(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex + 1];
	}

	public getEndCharacter(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex + 2];
	}

	public getMetadata(tokenIndex: number): number {
		return this._tokens[4 * tokenIndex + 3];
	}
}





/**
 * Represents sparse tokens in a text model.
 */
 export class SparseTokensStore {

	private _pieces: SparseMultilineTokens[];
	private _isComplete: boolean;
	protected readonly _languageIdCodec: ILanguageIdCodec;

	constructor(languageIdCodec: ILanguageIdCodec) {
		this._pieces = [];
		this._isComplete = false;
		this._languageIdCodec = languageIdCodec;
	}

	public flush(): void {
		this._pieces = [];
		this._isComplete = false;
	}

	public isEmpty(): boolean {
		return (this._pieces.length === 0);
	}

	public set(pieces: SparseMultilineTokens[] | null, isComplete: boolean): void {
		this._pieces = pieces || [];
		this._isComplete = isComplete;
	}

	public setPartial(_range: Range, pieces: SparseMultilineTokens[]): Range {
		// console.log(`setPartial ${_range} ${pieces.map(p => p.toString()).join(', ')}`);

		let range = _range;
		if (pieces.length > 0) {
			const _firstRange = pieces[0].getRange();
			const _lastRange = pieces[pieces.length - 1].getRange();
			if (!_firstRange || !_lastRange) return _range;
			range = _range.union(_firstRange).union(_lastRange);
		}

		let insertPosition: { index: number } | null = null;
		for (let i = 0, len = this._pieces.length; i < len; i++) {
			const piece = this._pieces[i];
			if (piece.endLineNumber < range.start.line+1) {
				// this piece is before the range
				continue;
			}

			if (piece.startLineNumber > range.end.line+1) {
				// this piece is after the range, so mark the spot before this piece
				// as a good insertion position and stop looping
				insertPosition = insertPosition || { index: i };
				break;
			}

			// this piece might intersect with the range
			piece.removeTokens(range);

			if (piece.isEmpty()) {
				// remove the piece if it became empty
				this._pieces.splice(i, 1);
				i--;
				len--;
				continue;
			}

			if (piece.endLineNumber < range.start.line+1) {
				// after removal, this piece is before the range
				continue;
			}

			if (piece.startLineNumber > range.end.line+1) {
				// after removal, this piece is after the range
				insertPosition = insertPosition || { index: i };
				continue;
			}

			// after removal, this piece contains the range
			const [a, b] = piece.split(range);
			if (a.isEmpty()) {
				// this piece is actually after the range
				insertPosition = insertPosition || { index: i };
				continue;
			}
			if (b.isEmpty()) {
				// this piece is actually before the range
				continue;
			}
			this._pieces.splice(i, 1, a, b);
			i++;
			len++;

			insertPosition = insertPosition || { index: i };
		}

		insertPosition = insertPosition || { index: this._pieces.length };

		if (pieces.length > 0) {
			this._pieces = arrayInsert(this._pieces, insertPosition.index, pieces);
		}

		// console.log(`I HAVE ${this._pieces.length} pieces`);
		// console.log(`${this._pieces.map(p => p.toString()).join('\n')}`);

		return range;
	}

	public isComplete(): boolean {
		return this._isComplete;
	}

	public addSparseTokens(lineNumber: number, aTokens: LineTokens): LineTokens {
		if (aTokens.getLineContent().length === 0) {
			// Don't do anything for empty lines
			return aTokens;
		}

		const pieces = this._pieces;

		if (pieces.length === 0) {
			return aTokens;
		}

		const pieceIndex = SparseTokensStore._findFirstPieceWithLine(pieces, lineNumber);
		const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);

		if (!bTokens) {
			return aTokens;
		}

		// const aLen = aTokens.getCount();
		const aLen = aTokens.count;
		const bLen = bTokens.getCount();

		let aIndex = 0;
		const result: number[] = [];
		let resultLen = 0;
		let lastEndOffset = 0;

		const emitToken = (endOffset: number, metadata: number) => {
			if (endOffset === lastEndOffset) {
				return;
			}
			lastEndOffset = endOffset;
			result[resultLen++] = endOffset;
			result[resultLen++] = metadata;
		};

		for (let bIndex = 0; bIndex < bLen; bIndex++) {
			const bStartCharacter = bTokens.getStartCharacter(bIndex);
			const bEndCharacter = bTokens.getEndCharacter(bIndex);
			const bMetadata = bTokens.getMetadata(bIndex);

			const bMask = (
				((bMetadata & MetadataConsts.SEMANTIC_USE_ITALIC) ? MetadataConsts.ITALIC_MASK : 0)
				| ((bMetadata & MetadataConsts.SEMANTIC_USE_BOLD) ? MetadataConsts.BOLD_MASK : 0)
				| ((bMetadata & MetadataConsts.SEMANTIC_USE_UNDERLINE) ? MetadataConsts.UNDERLINE_MASK : 0)
				| ((bMetadata & MetadataConsts.SEMANTIC_USE_STRIKETHROUGH) ? MetadataConsts.STRIKETHROUGH_MASK : 0)
				| ((bMetadata & MetadataConsts.SEMANTIC_USE_FOREGROUND) ? MetadataConsts.FOREGROUND_MASK : 0)
				| ((bMetadata & MetadataConsts.SEMANTIC_USE_BACKGROUND) ? MetadataConsts.BACKGROUND_MASK : 0)
			) >>> 0;
			const aMask = (~bMask) >>> 0;

			// push any token from `a` that is before `b`
			while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
				emitToken(aTokens.getEndOffset(aIndex), aTokens.Metadata(aIndex));
				aIndex++;
			}

			// push the token from `a` if it intersects the token from `b`
			if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
				emitToken(bStartCharacter, aTokens.Metadata(aIndex));
			}

			// skip any tokens from `a` that are contained inside `b`
			while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
				emitToken(aTokens.getEndOffset(aIndex), (aTokens.Metadata(aIndex) & aMask) | (bMetadata & bMask));
				aIndex++;
			}

			if (aIndex < aLen) {
				emitToken(bEndCharacter, (aTokens.Metadata(aIndex) & aMask) | (bMetadata & bMask));
				if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
					// `a` ends exactly at the same spot as `b`!
					aIndex++;
				}
			} else {
				const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);

				// push the token from `b`
				emitToken(bEndCharacter, (aTokens.Metadata(aMergeIndex) & aMask) | (bMetadata & bMask));
			}
		}

		// push the remaining tokens from `a`
		while (aIndex < aLen) {
			emitToken(aTokens.getEndOffset(aIndex), aTokens.Metadata(aIndex));
			aIndex++;
		}

		// return new LineTokens(new Uint32Array(result), aTokens.getLineContent(), this._languageIdCodec);
		return new LineTokens(new Uint32Array(result), aTokens.getLineContent());
	}

	private static _findFirstPieceWithLine(pieces: SparseMultilineTokens[], lineNumber: number): number {
		let low = 0;
		let high = pieces.length - 1;

		while (low < high) {
			let mid = low + Math.floor((high - low) / 2);

			if (pieces[mid].endLineNumber < lineNumber) {
				low = mid + 1;
			} else if (pieces[mid].startLineNumber > lineNumber) {
				high = mid - 1;
			} else {
				while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
					mid--;
				}
				return mid;
			}
		}

		return low;
	}

	public acceptEdit(range: Range, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void {
		for (const piece of this._pieces) {
			piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
		}
	}
}

































































































export function toUint32Array(arr: Uint32Array | ArrayBuffer): Uint32Array {
	return (arr instanceof Uint32Array)? arr : new Uint32Array(arr);
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

























































export const enum StringEOL {
	Unknown = 0,
	Invalid = 3,
	LF = 1,
	CRLF = 2
}



export function countEOL(text: string): [number, number, number, StringEOL] {
	let eolCount = 0;
	let firstLineLength = 0;
	let lastLineStart = 0;
	let eol: StringEOL = StringEOL.Unknown;
	for (let i = 0, len = text.length; i < len; i++) {
		const chr = text.charCodeAt(i);

		if (chr === CharCode.CarriageReturn) {
			if (eolCount === 0) firstLineLength = i;
			eolCount++;
			if (i + 1 < len && text.charCodeAt(i + 1) === CharCode.LineFeed) {
				// \r\n... case
				eol |= StringEOL.CRLF;
				i++; // skip \n
			} else {// \r... case
				eol |= StringEOL.Invalid;
			}
			lastLineStart = i + 1;
		} else if (chr === CharCode.LineFeed) {
			// \n... case
			eol |= StringEOL.LF;
			if (eolCount === 0) firstLineLength = i;
			eolCount++;
			lastLineStart = i + 1;
		}
	}
	return [eolCount, ((eolCount === 0)? text.length : firstLineLength), (text.length - lastLineStart), eol];
}























































export interface ITokenThemeRule {
	token: string;
	foreground?: string;
	background?: string;
	fontStyle?: string;
}







export class ParsedTokenThemeRule {
	_parsedThemeRuleBrand: void = undefined;

	readonly token: string;
	readonly index: number;

	/** -1 if not set. A bitmask of `FontStyle` otherwise. **/
	readonly fontStyle: FontStyle | -1;
	readonly foreground: string | null;
	readonly background: string | null;

	constructor(
		token: string,
		index: number,
		fontStyle: number,
		foreground: string | null,
		background: string | null,
	) {
		this.token = token;
		this.index = index;
		this.fontStyle = fontStyle;
		this.foreground = foreground;
		this.background = background;
	}
}




/** Parse a raw theme into rules. **/
 export function parseTokenTheme(source: ITokenThemeRule[]): ParsedTokenThemeRule[] {
	if (!source || !Array.isArray(source)) return [];

	const result: ParsedTokenThemeRule[] = Array(source.length);
	for (let i = 0, len = source.length; i < len; i++) {
		const entry = source[i];

		let fontStyle: number = FontStyle.NotSet;
		if (typeof entry.fontStyle === 'string') {
			fontStyle = FontStyle.None;

			const segments = entry.fontStyle.split(' ');
			for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
				fontStyle |= ParseFontStyle(segments[j]);
			}
		}

		const foreground = (typeof entry.foreground === 'string')? entry.foreground : null;
		const background = (typeof entry.background === 'string')? entry.background : null;


		result[i] = new ParsedTokenThemeRule(
			entry.token || '',
			i,
			fontStyle,
			foreground,
			background
		);
	}

	return result;
}






/** Resolve rules (i.e. inheritance). **/
 function resolveParsedTokenThemeRules(parsedThemeRules: ParsedTokenThemeRule[], customTokenColors: string[]): TokenTheme {

	// Sort rules lexicographically, and then by index if necessary
	parsedThemeRules.sort((a, b) => {
		const r = strcmp(a.token, b.token);
		return (r !== 0)? r : (a.index - b.index);
	});

	// Determine defaults
	let defaultFontStyle = FontStyle.None;
	let defaultForeground = '000000';
	let defaultBackground = 'ffffff';
	while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === '') {
		const incomingDefaults = parsedThemeRules.shift()!;
		if (incomingDefaults.fontStyle !== FontStyle.NotSet) defaultFontStyle = incomingDefaults.fontStyle;
		if (incomingDefaults.foreground !== null) defaultForeground = incomingDefaults.foreground;
		if (incomingDefaults.background !== null) defaultBackground = incomingDefaults.background;
	}
	const colorMap = new ColorMap();

	// start with token colors from custom token themes
	for (const color of customTokenColors) colorMap.getId(color);


	const foregroundColorId = colorMap.getId(defaultForeground);
	const backgroundColorId = colorMap.getId(defaultBackground);

	const defaults = new ThemeTrieElementRule(defaultFontStyle, foregroundColorId, backgroundColorId);
	const root = new ThemeTrieElement(defaults);
	for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
		const rule = parsedThemeRules[i];
		root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
	}

	return new TokenTheme(colorMap, root);
}




const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;

export class ColorMap {

	private _lastColorId: number;
	private readonly _id2color: Color[];
	private readonly _color2id: Map<string, ColorId>;

	constructor() {
		this._lastColorId = 0;
		this._id2color = [];
		this._color2id = new Map<string, ColorId>();
	}

	public getId(color: string | null): ColorId {
		if (color === null) return 0;

		const match = color.match(colorRegExp);
		if (!match) throw new Error('Illegal value for token color: ' + color);

		color = match[1].toUpperCase();
		let value = this._color2id.get(color);
		if (value) return value;

		value = ++this._lastColorId;
		this._color2id.set(color, value);
		this._id2color[value] = ColorMap.fromHex('#' + color);
		return value;
	}

	public getColorMap(): Color[] {
		return this._id2color.slice(0);
	}

	
	static fromHex(hex: string): Color {
		return ColorMap.parseHex(hex) || new Color(255, 0, 255, 1);
	}


	static parseHex(hex : string) {
		const length = hex.length;
		
		if (length === 0) return null; // Invalid color
		else if (hex.charCodeAt(0) !== 35) { return null; // Does not begin with a #

		} else if (length === 4) {
			// #RGB format
			const r = ColorMap.parseHexDigitSingle(hex.charCodeAt(1));
			const g = ColorMap.parseHexDigitSingle(hex.charCodeAt(2));
			const b = ColorMap.parseHexDigitSingle(hex.charCodeAt(3));
			return new Color(r, g, b, 1);
		} else if (length === 5) {
			// #RGBA format
			const r = ColorMap.parseHexDigitSingle(hex.charCodeAt(1));
			const g = ColorMap.parseHexDigitSingle(hex.charCodeAt(2));
			const b = ColorMap.parseHexDigitSingle(hex.charCodeAt(3));
			const a = ColorMap.parseHexDigitSingle(hex.charCodeAt(4));
			return new Color(r, g, b, a / 255);
		} else if (length === 7) {
			// #RRGGBB format
			const r = ColorMap.parseHexDigitDouble(hex.charCodeAt(1), hex.charCodeAt(2));
			const g = ColorMap.parseHexDigitDouble(hex.charCodeAt(3), hex.charCodeAt(4));
			const b = ColorMap.parseHexDigitDouble(hex.charCodeAt(5), hex.charCodeAt(6));
			return new Color(r, g, b, 1);
		} else if (length === 9) {
			// #RRGGBBAA format
			const r = ColorMap.parseHexDigitDouble(hex.charCodeAt(1), hex.charCodeAt(2));
			const g = ColorMap.parseHexDigitDouble(hex.charCodeAt(3), hex.charCodeAt(4));
			const b = ColorMap.parseHexDigitDouble(hex.charCodeAt(5), hex.charCodeAt(6));
			const a = ColorMap.parseHexDigitDouble(hex.charCodeAt(7), hex.charCodeAt(8));
			return new Color(r, g, b, a / 255);

		// Invalid color
		} else return null;

	}

	static parseHexDigitSingle(code : number) {
		const x = ColorMap.parseHexDigit(code);
		return (16 * x) + x;
	}

	
	static parseHexDigitDouble(codeA : number, codeB : number) {
		return (16 * ColorMap.parseHexDigit(codeA)) + ColorMap.parseHexDigit(codeB);
	}

	static parseHexDigit(code : number) {
		if (code >= 48 && code <=  57) return code-48; //0-9
		if (code >= 65 && code <=  70) return code-65 + 10; //A-F
		if (code >= 97 && code <= 102) return code-97 + 10; //a-f
		return 0;
	}

}









export class TokenTheme {

	public static createFromRawTokenTheme(source: ITokenThemeRule[], customTokenColors: string[]): TokenTheme {
		return this.createFromParsedTokenTheme(parseTokenTheme(source), customTokenColors);
	}

	public static createFromParsedTokenTheme(source: ParsedTokenThemeRule[], customTokenColors: string[]): TokenTheme {
		return resolveParsedTokenThemeRules(source, customTokenColors);
	}

	private readonly _colorMap: ColorMap;
	private readonly _root: ThemeTrieElement;
	private readonly _cache: Map<string, number>;

	constructor(colorMap: ColorMap, root: ThemeTrieElement) {
		this._colorMap = colorMap;
		this._root = root;
		this._cache = new Map<string, number>();
	}

	public getColorMap(): Color[] {
		return this._colorMap.getColorMap();
	}

	/** used for testing purposes **/
	public getThemeTrieElement(): ExternalThemeTrieElement {
		return this._root.toExternalThemeTrieElement();
	}

	public _match(token: string): ThemeTrieElementRule {
		return this._root.match(token);
	}

	public match(languageId: LanguageId, token: string): number {
		// The cache contains the metadata without the language bits set.
		let result = this._cache.get(token);
		if (typeof result === 'undefined') {
			const rule = this._match(token);
			const standardToken = toStandardTokenType(token);
			result = (rule.metadata | (standardToken << MetadataConsts.TOKEN_TYPE_OFFSET)) >>> 0;
			this._cache.set(token, result);
		}

		return (result | (languageId << MetadataConsts.LANGUAGEID_OFFSET)) >>> 0;
	}
}



export function strcmp(a: string, b: string): number { return (a<b)? -1 : (a>b) ? 1 : 0; }

export class ThemeTrieElementRule {
	_themeTrieElementRuleBrand: void = undefined;

	private _fontStyle: FontStyle;
	private _foreground: ColorId;
	private _background: ColorId;
	public metadata: number;

	constructor(fontStyle: FontStyle, foreground: ColorId, background: ColorId) {
		this._fontStyle = fontStyle;
		this._foreground = foreground;
		this._background = background;
		this.metadata = (
			(this._fontStyle << MetadataConsts.FONT_STYLE_OFFSET)
			| (this._foreground << MetadataConsts.FOREGROUND_OFFSET)
			| (this._background << MetadataConsts.BACKGROUND_OFFSET)
		) >>> 0;
	}

	public clone(): ThemeTrieElementRule { return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);}

	public acceptOverwrite(fontStyle: FontStyle, foreground: ColorId, background: ColorId): void {
		if (fontStyle !== FontStyle.NotSet) this._fontStyle = fontStyle;
		if (foreground !== ColorId.None) this._foreground = foreground;
		if (background !== ColorId.None) this._background = background;
		this.metadata = (
			(this._fontStyle << MetadataConsts.FONT_STYLE_OFFSET)
			| (this._foreground << MetadataConsts.FOREGROUND_OFFSET)
			| (this._background << MetadataConsts.BACKGROUND_OFFSET)
		) >>> 0;
	}
}

export class ExternalThemeTrieElement {

	public readonly mainRule: ThemeTrieElementRule;
	public readonly children: Map<string, ExternalThemeTrieElement>;

	constructor(
		mainRule: ThemeTrieElementRule,
		children: Map<string, ExternalThemeTrieElement> | { [key: string]: ExternalThemeTrieElement } = new Map<string, ExternalThemeTrieElement>()
	) {
		this.mainRule = mainRule;
		if (children instanceof Map) {
			this.children = children;
		} else {
			this.children = new Map<string, ExternalThemeTrieElement>();
			for (const key in children) this.children.set(key, children[key]);
		}
	}
}

export class ThemeTrieElement {
	_themeTrieElementBrand: void = undefined;

	private readonly _mainRule: ThemeTrieElementRule;
	private readonly _children: Map<string, ThemeTrieElement>;

	constructor(mainRule: ThemeTrieElementRule) {
		this._mainRule = mainRule;
		this._children = new Map<string, ThemeTrieElement>();
	}

	/** used for testing purposes **/
	public toExternalThemeTrieElement(): ExternalThemeTrieElement {
		const children = new Map<string, ExternalThemeTrieElement>();
		this._children.forEach((element, index) => children.set(index, element.toExternalThemeTrieElement()));
		return new ExternalThemeTrieElement(this._mainRule, children);
	}

	public match(token: string): ThemeTrieElementRule {
		if (token === '') return this._mainRule;

		const dotIndex = token.indexOf('.');
		let head: string, tail: string;
		if (dotIndex === -1) {
			head = token;
			tail = '';
		} else {
			head = token.substring(0, dotIndex);
			tail = token.substring(dotIndex + 1);
		}

		const child = this._children.get(head);
		return (typeof child !== 'undefined')? child.match(tail) : this._mainRule;
	}


	// public insert(rule : ParsedTokenThemeRule) {}
	public insert(token: string, fontStyle: FontStyle, foreground: ColorId, background: ColorId): void {
		if (token === '') {
			// Merge into the main rule
			this._mainRule.acceptOverwrite(fontStyle, foreground, background);
			return;
		}

		const dotIndex = token.indexOf('.');
		let head: string, tail: string;
		if (dotIndex === -1) {
			head = token;
			tail = '';
		} else {
			head = token.substring(0, dotIndex);
			tail = token.substring(dotIndex + 1);
		}

		let child = this._children.get(head);
		if (typeof child === 'undefined') {
			child = new ThemeTrieElement(this._mainRule.clone());
			this._children.set(head, child);
		}

		child.insert(tail, fontStyle, foreground, background);
	}
}







export function generateTokensCSSForColorMap(colorMap: readonly Color[]): string {
	const rules: string[] = new Array<string>(colorMap.length);
	for (let i = 1, len = colorMap.length; i < len; i++) {
		rules[i] = `.mtk${i} { color: ${colorMap[i]}; }`;
	}
	rules.push('.mtki { font-style: italic; }');
	rules.push('.mtkb { font-weight: bold; }');
	rules.push('.mtku { text-decoration: underline; text-underline-position: under; }');
	rules.push('.mtks { text-decoration: line-through; }');
	rules.push('.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }');
	return rules.join('\n');
}














