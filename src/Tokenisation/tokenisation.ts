

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
	if (fontStyle & FontStyle.Overline) style += " overline";
	if (fontStyle & FontStyle.Italic) style += 'italic ';
	if (fontStyle & FontStyle.Bold) style += 'bold ';
	return (style === '')? 'none' : style.trim();
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
	TOKEN_TYPE_MASK = 0b00000000000000000000011100000000,
	FONT_STYLE_MASK = 0b00000000000000000011100000000000,
	FOREGROUND_MASK = 0b00000000011111111100000000000000,
	BACKGROUND_MASK = 0b11111111100000000000000000000000,

	LANGUAGEID_OFFSET = 0, //0b00000000000000000000000000000001
	TOKEN_TYPE_OFFSET = 8, //0b00000000000000000000000100000000
	// BALANCED_BRACKETS_OFFSET = 10,
	FONT_STYLE_OFFSET = 11,//0b00000000000000000000100000000000
	FOREGROUND_OFFSET = 14,//0b00000000000000000100000000000000
	BACKGROUND_OFFSET = 23,//0b00000000100000000000000000000000
}

export function MaskAndShift(this:MetadataConsts, mask:MetadataConsts, offset:MetadataConsts) { return (this & mask) >>> offset; }


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

	public static getClassName(metadata: number): string {
		const foreground = this.getForeground(metadata);
		// const background = this.getBackground(metadata);
		const fontStyle = this.getFontStyle(metadata);

		let className = 'mtk' + foreground;
		if (fontStyle & FontStyle.Italic)        className += ' mtki';
		if (fontStyle & FontStyle.Bold)          className += ' mtkb';
		if (fontStyle & FontStyle.Underline)     className += ' mtku';
		if (fontStyle & FontStyle.Strikethrough) className += ' mtks';
		if (fontStyle & FontStyle.Overline)      className += ' mtko';
		return className;
	}

	public static getInlineStyle(metadata: number, colorMap: string[]): string {
		const foreground = this.getForeground(metadata);
		const background = this.getBackground(metadata);
		const fontStyle = this.getFontStyle(metadata);
		let result = '';

		result += `foreground color: ${colorMap[foreground]};`;
		result += `background color: ${colorMap[background]};`;
		if (fontStyle & FontStyle.Italic)    result += 'font-style: italic;';
		if (fontStyle & FontStyle.Bold)      result += 'font-weight: bold;';
		if (fontStyle & FontStyle.Underline) result += 'text-decoration: underline;';
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






// export function toBinaryStr(encodedTokenAttributes: EncodedTokenAttributes): string {
// 	let r = encodedTokenAttributes.toString(2);
// 	while (r.length < 32) {
// 		r = "0" + r;
// 	}
// 	return r;
// }

// export function print(encodedTokenAttributes: EncodedTokenAttributes): void {
// 	const languageId = EncodedTokenAttributes.getLanguageId(encodedTokenAttributes);
// 	const tokenType = EncodedTokenAttributes.getTokenType(encodedTokenAttributes);
// 	const fontStyle = EncodedTokenAttributes.getFontStyle(encodedTokenAttributes);
// 	const foreground = EncodedTokenAttributes.getForeground(encodedTokenAttributes);
// 	const background = EncodedTokenAttributes.getBackground(encodedTokenAttributes);

// 	console.log({
// 		languageId: languageId,
// 		tokenType: tokenType,
// 		fontStyle: fontStyle,
// 		foreground: foreground,
// 		background: background,
// 	});
// }





export class TokenTools {
	public static Count(tokens: IToken2Array) { return (tokens.length >>> 1); }
	
	public static Metadata(tokens: IToken2Array, index:int) { return tokens[(index << 1) + 1] }

	public static StartOffset(tokens: IToken2Array, index: number): number {
		return (index>0)? tokens[(index-1) << 1] : 0;
	}
	public static EndOffset(tokens: IToken2Array, index: number): number {
		const count = (tokens.length >>> 1);
		return (index<=count)? tokens[index << 1] : tokens[(count << 1) - 1];
	}

	public static *Iterate(tokens: IToken2Array) : Generator<number> {
		const count = (tokens.length >>> 1);
		for (let i =0; i<count; i++) yield i;
	}

	//Binary search
	public static findIndexInArray(tokens: IToken2Array, desiredIndex: number): number {
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


	public static findIndexOfType(tokens: IToken2Array, desiredType: StandardTokenType) {
		const count = (tokens.length >>> 1);
		for (let i = 0; i<count; i++) {
			if (TokenMetadata.getTokenType(tokens[(i<<1)+1]) == desiredType) return i;
		}
		return -1;
	}

	public static toOffsetArray(tokens: IToken2Array, lineTextLength: number) : Array<number> {
		const count = (tokens.length >>> 1);
		const offsets = new Array<number>(count+2);

		//Represents the start of the line
		offsets[0] = tokens[0<<1];
		for (let i = 1; i<count; i++) offsets[i+1] = tokens[i<<1];
		//Represents token at end of the line.
		offsets[count+1] = lineTextLength;
		return offsets;
	}

	public static toTokenTypeArray(tokens: IToken2Array) : Array<StandardTokenType> {
		const count = (tokens.length >>> 1);
		const types = new Array<StandardTokenType>(count);
		for (let i = 0; i<count; i++) types[i] = TokenMetadata.getTokenType(tokens[(i<<1)+1]);
		return types;
	}

	public static containsTokenType(tokens: IToken2Array, desiredType: StandardTokenType) {
		const count = (tokens.length >>> 1);
		let metaResult = 0;
		for (let i = 0; i<count; i++) metaResult |= tokens[(i<<1)+1];
		const IsolatedTypes = TokenMetadata.getTokenType(metaResult);
		return (IsolatedTypes & desiredType) === desiredType;

	}

	
	public static readonly GetTokenName = TokenTypeToString;





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
			startOffset: index>0? this._tokens[(index-1) << 1] : 0,
			endOffset: index<this._tokensCount? this._tokens[index<<1] : this._tokensEndOffset,
			metaData: index<this._tokensCount? this._tokens[(index<<1)+1] : this._tokens[(this._tokensCount<<1)-1]
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




















