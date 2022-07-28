
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











export const enum IgnoreBracketsInTokens {
	value = StandardTokenType.Comment | StandardTokenType.String | StandardTokenType.RegEx
}
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

	public static getClassNameFromMetadata(metadata: number): string {
		const foreground = this.getForeground(metadata);
		const background = this.getForeground(metadata);
		const fontStyle = this.getFontStyle(metadata);

		let className = 'mtk' + foreground;
		className += ' mtk' + background;
		if (fontStyle & FontStyle.Italic)    className += ' mtki';
		if (fontStyle & FontStyle.Bold)      className += ' mtkb';
		if (fontStyle & FontStyle.Underline) className += ' mtku';

		return className;
	}

	public static getInlineStyleFromMetadata(metadata: number, colorMap: string[]): string {
		const foreground = this.getForeground(metadata);
		const background = this.getForeground(metadata);
		const fontStyle = this.getFontStyle(metadata);
		let result = '';

		result += `foreground color: ${colorMap[foreground]};`;
		result += `background color: ${colorMap[background]};`;
		if (fontStyle & FontStyle.Italic)    result += 'font-style: italic;';
		if (fontStyle & FontStyle.Bold)      result += 'font-weight: bold;';
		if (fontStyle & FontStyle.Underline) result += 'text-decoration: underline;';
		return result;
	}

	
	public static getPresentationFromMetadata(metadata: number): ITokenPresentation {
		const foreground = this.getForeground(metadata);
		const background = this.getForeground(metadata);
		const fontStyle = this.getFontStyle(metadata);

		return {
			foreground: foreground,
			background: background,
			italic: Boolean(fontStyle & FontStyle.Italic),
			bold: Boolean(fontStyle & FontStyle.Bold),
			underline: Boolean(fontStyle & FontStyle.Underline),
			strikethrough: Boolean(fontStyle & FontStyle.Strikethrough),
		};
	}
}















export class TokenArray {
	public static readonly EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;

	public static Count(tokens: IToken2Array) {
		return (tokens.length >>> 1);
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

	

	

	public static GetTokenName(token : StandardTokenType) {
		switch (token) {
			case StandardTokenType.Other : return "Other";
			case StandardTokenType.Comment : return "Comment";
			case StandardTokenType.String : return "String";
			case StandardTokenType.RegEx : return "Regex";
			default: return "None";
		}
	}

}




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



export class StandardLineTokens {
	private readonly _tokens: IToken2Array;
	private readonly _tokensCount: number;
	private readonly _tokensEndOffset: number;
	private readonly _text: string;

	private GetMetadata(tokenIndex:number): number {
		return this._tokens[(tokenIndex << 1) + 1];
	}
	public getStartOffset(tokenIndex: number): number {
		return (tokenIndex>0)? this._tokens[(tokenIndex-1) << 1] : 0;
	}
	public getEndOffset(tokenIndex: number): number {
		return (tokenIndex<=this._tokensCount)? this._tokens[tokenIndex << 1] : this._tokensEndOffset;
	}


	constructor(tokens: IToken2Array, text: string) {
		this._tokens = tokens;
		this._tokensCount = (this._tokens.length >>> 1);
		this._text = text;
		this._tokensEndOffset = text.length;
	}

	public get count(): number { return this._tokensCount; }
	public get LineText(): string { return this._text; }
	//Gets the combined metadata of all tokens in the line, this allows for easy queries.
	public get LineMetadata() {
		let metaResult = 0;
		for (let i = 0; i<this._tokensCount; i++) metaResult |= this._tokens[(i<<1)+1];
		return metaResult;
	}

	public hasTokenType(tokenType:StandardTokenType) {
		return TokenArray.containsTokenType(this._tokens, tokenType);
	}

	public indexOf(tokenType:StandardTokenType) {
		return TokenArray.findIndexOfType(this._tokens, tokenType);
	}

	public offsetOf(tokenType:StandardTokenType) {
		const Index = TokenArray.findIndexOfType(this._tokens, tokenType);
		return (Index === -1)? -1 : this.getEndOffset(Index);
	}


	public getOffsetDelta(tokenIndex: number): number {
		if (tokenIndex <= 0) return 0;
		const offsetStart = this._tokens[(tokenIndex-1) << 1];
		const offsetEnd = this._tokens[tokenIndex << 1];
		return offsetEnd-offsetStart;
	}



	public getTokenType(tokenIndex: number): StandardTokenType { return TokenMetadata.getTokenType(this.GetMetadata(tokenIndex)); }
	public getLanguageId(tokenIndex: number): LanguageId { return TokenMetadata.getLanguageId(this.GetMetadata(tokenIndex)); }
	public getFontStyle(tokenIndex: number): FontStyle { return TokenMetadata.getFontStyle(this.GetMetadata(tokenIndex)); }
	public getForeground(tokenIndex: number): ColorId { return TokenMetadata.getForeground(this.GetMetadata(tokenIndex)); }
	public getBackground(tokenIndex: number): ColorId { return TokenMetadata.getBackground(this.GetMetadata(tokenIndex)); }


	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public findTokenIndexAtOffset(offset: number): number {
		return LineTokens.findIndexInTokensArray(this._tokens, offset);
	}
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Conversions

	public toOffsetArray() : Array<number> {
		const offsets = new Array<number>(this._tokensCount+2);

		//Represents the start of the line
		offsets[0] = this.getEndOffset(0);
		for (let i = 1; i<this._tokensCount; i++) offsets[i+1] = this.getEndOffset(i);
		//Represents token at end of the line.
		offsets[this._tokensCount+1] = this._tokensEndOffset;

		return offsets;
	}

	public toTokenTypeArray() : Array<StandardTokenType> {
		const types = new Array<StandardTokenType>(this._tokensCount);
		for (let i = 0; i<this._tokensCount; i++) {
			types[i] = this.getTokenType(i);
		}
		return types;
	}

	public getToken(index:number):IToken2 {
		return <IToken2> {
			startOffset: index>0? this._tokens[(index-1) << 1] : 0,
			endOffset: index<this._tokensCount? this._tokens[index<<1] : this._tokensEndOffset,
			metaData: index<this._tokensCount? this._tokens[(index<<1)+1] : this._tokens[(this._tokensCount<<1)-1]
		};
	}


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Iterators
	public *Metadatas() { for (let i = 0; i<this._tokensCount; i++) yield this._tokens[(i<<1)+1]; }
	public *Offsets() {
		for (let i = 0; i<this._tokensCount; i++) yield this._tokens[(i<<1)];
		yield this._tokensEndOffset;
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



















export interface IViewLineTokens {
	equals(other: IViewLineTokens): boolean;
	getCount(): number;
	getForeground(tokenIndex: number): ColorId;
	getEndOffset(tokenIndex: number): number;
	getClassName(tokenIndex: number): string;
	getInlineStyle(tokenIndex: number, colorMap: string[]): string;
	findTokenIndexAtOffset(offset: number): number;
}




export class LineTokens implements IViewLineTokens {
	// _lineTokensBrand: void;

	private readonly _tokens: IToken2Array;
	private readonly _tokensCount: number;
	private readonly _text: string;

	constructor(tokens: IToken2Array, text: string) {
		this._tokens = tokens;
		this._tokensCount = (this._tokens.length >>> 1);
		this._text = text;
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
	public getCount(): number { return this._tokensCount; }

	public getStartOffset(tokenIndex: number): number {
		return (tokenIndex>0)? this._tokens[(tokenIndex - 1) << 1] : 0;
	}

	public getLanguageId(tokenIndex: number): LanguageId {
		const metadata = this._tokens[(tokenIndex << 1) + 1];
		return TokenMetadata.getLanguageId(metadata);
	}

	public getStandardTokenType(tokenIndex: number): StandardTokenType {
		const metadata = this._tokens[(tokenIndex << 1) + 1];
		return TokenMetadata.getTokenType(metadata);
	}

	public getForeground(tokenIndex: number): ColorId {
		const metadata = this._tokens[(tokenIndex << 1) + 1];
		return TokenMetadata.getForeground(metadata);
	}

	public getClassName(tokenIndex: number): string {
		const metadata = this._tokens[(tokenIndex << 1) + 1];
		return TokenMetadata.getClassNameFromMetadata(metadata);
	}

	public getInlineStyle(tokenIndex: number, colorMap: string[]): string {
		const metadata = this._tokens[(tokenIndex << 1) + 1];
		return TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
	}

	public getEndOffset(tokenIndex: number): number {
		return this._tokens[tokenIndex << 1];
	}

	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public findTokenIndexAtOffset(offset: number): number {
		return LineTokens.findIndexInTokensArray(this._tokens, offset);
	}

	public inflate(): IViewLineTokens {
		return this;
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

	//Binary search
	public static findIndexInTokensArray(tokens: IToken2Array, desiredIndex: number): number {
		if (tokens.length <= 2) return 0;

		let low = 0;
		let high = (tokens.length >>> 1) - 1;

		while (low < high) {
			let mid = low + Math.floor((high - low) * 0.5);
			let endOffset = tokens[(mid << 1)];

			if (endOffset === desiredIndex) return mid+1;
			else if (endOffset < desiredIndex) low = mid+1;
			else if (endOffset > desiredIndex) high = mid;
		}

		return low;
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
		for (let i = this._firstTokenIndex, len = source.getCount(); i < len; i++) {
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

	public getCount(): number {
		return this._tokensCount;
	}

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




















