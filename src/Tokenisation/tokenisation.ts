import { Color } from "vscode";
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
			if (this._tokens[i] !== other._tokens[i]) {
				return false;
			}
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

	/**
	 * -1 if not set. A bitmask of `FontStyle` otherwise.
	**/
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




/**
 * Parse a raw theme into rules.
 */
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






/**
 * Resolve rules (i.e. inheritance).
 */
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














