import { Color, Position, Range } from "vscode";

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

export function ParseFontStyle(segment : string) : FontStyle { switch (segment) {
	case 'strikethrough': return FontStyle.Strikethrough;
	case 'underline': return FontStyle.Underline;
	case 'overline': return FontStyle.Overline;
	case 'italic': return FontStyle.Italic;
	case 'bold': return FontStyle.Bold;
	default : return FontStyle.None;
}}





const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp|meta\.embedded)\b/;
export function StringToTokenType(token: string): StandardTokenType {
	const m = token.match(STANDARD_TOKEN_TYPE_REGEXP);
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


export function TokenTypeToString(token : StandardTokenType) { switch (token) {
	case StandardTokenType.Other : return "Other";
	case StandardTokenType.Comment : return "Comment";
	case StandardTokenType.String : return "String";
	case StandardTokenType.RegEx : return "RegEx";
	case StandardTokenType.NotSet : return "Not Set";
	default: return "????";
}}

export function ExtractTokenString(token:string|string[]) {
	if (typeof token !== 'string') token = token.join(' '); //Joins with space to preserve word bounds
	const m = token.match(STANDARD_TOKEN_TYPE_REGEXP);
	if (!m) return "Other";
	switch (token) {
		case 'comment': return "Comment"; 
		case 'string': return "String";
		case 'regex': return "RegEx";
		case 'regexp': return "RegEx";
		case "meta.embedded": return "Other";
		default: return "Other";
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
export function ignoreBracketsInToken(standardTokenType: StandardTokenType): boolean { return (standardTokenType & IgnoreBracketsInTokens.value) !== 0; }
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
	
	ITALIC_MASK        = 0b00000000000000000000100000000000,
	BOLD_MASK          = 0b00000000000000000001000000000000,
	UNDERLINE_MASK     = 0b00000000000000000010000000000000,
	STRIKETHROUGH_MASK = 0b00000000000000000100000000000000,
}


export type TokenMetadata = number;
export namespace TokenMetadata {
	export function Query(metadata:TokenMetadata, query:MetadataConsts) { return (metadata & query) !== 0; }


	export const Default = (
		(FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET)
		| (ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET)
		| (ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET)
	) >>> 0;


	export function getDefault(topLevelLanguageId: LanguageId): TokenMetadata {
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


	export function getLanguageId(metadata: TokenMetadata): LanguageId       { return (metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET; }
	export function getTokenType(metadata: TokenMetadata): StandardTokenType { return (metadata & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET; }
	export function getFontStyle(metadata: TokenMetadata): FontStyle         { return (metadata & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET; }
	export function getForeground(metadata: TokenMetadata): ColorId          { return (metadata & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET; }
	export function getBackground(metadata: TokenMetadata): ColorId          { return (metadata & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET; }
	export function hasBalancedBrackets(metadata: TokenMetadata): boolean    { return (metadata & MetadataConsts.B_BRACKETS_MASK) !== 0; }

	export function getClassName(metadata: TokenMetadata): string {
		const foreground = TokenMetadata.getForeground(metadata);
		// const background = this.getBackground(metadata);
		const fontStyle = TokenMetadata.getFontStyle(metadata);

		let className = 'mtk' + foreground;
		if (fontStyle & FontStyle.Italic)        className += ' mtki';
		if (fontStyle & FontStyle.Bold)          className += ' mtkb';
		if (fontStyle & FontStyle.Overline)      className += ' mtko';
		if (fontStyle & FontStyle.Underline)     className += ' mtku';
		if (fontStyle & FontStyle.Strikethrough) className += ' mtks';
		return className;
	}

	export function getInlineStyle(metadata: TokenMetadata, colorMap: string[]): string {
		const foreground = TokenMetadata.getForeground(metadata);
		const background = TokenMetadata.getBackground(metadata);
		const fontStyle = TokenMetadata.getFontStyle(metadata);
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

	

	export function getPresentation(metadata: TokenMetadata): ITokenPresentation {
		const foreground = TokenMetadata.getForeground(metadata);
		const background = TokenMetadata.getBackground(metadata);
		const fontStyle = TokenMetadata.getFontStyle(metadata);

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


	//Utilities...


	export function ContainsTokenType(metadata:TokenMetadata, tokenType:StandardTokenType):bool { return (TokenMetadata.getTokenType(metadata) & tokenType) === tokenType;}
	export function IsTokenType(metadata:TokenMetadata, tokenType:StandardTokenType):bool { return TokenMetadata.getTokenType(metadata) === tokenType;}


	export function toBinaryString(encodedTokenAttributes: TokenMetadata): string {
		let r = encodedTokenAttributes.toString(2);
		while (r.length < 32) r = "0"+r;
		return r;
	}

	export function print(encodedTokenAttributes: TokenMetadata): void {
		const languageId = TokenMetadata.getLanguageId(encodedTokenAttributes);
		const tokenType = TokenMetadata.getTokenType(encodedTokenAttributes);
		const fontStyle = TokenMetadata.getFontStyle(encodedTokenAttributes);
		const foreground = TokenMetadata.getForeground(encodedTokenAttributes);
		const background = TokenMetadata.getBackground(encodedTokenAttributes);

		console.log({
			languageId: languageId,
			tokenType: tokenType,
			fontStyle: fontStyle,
			foreground: foreground,
			background: background,
		});
	}

	export function toString(encodedTokenAttributes: TokenMetadata): string {
		const languageId = TokenMetadata.getLanguageId(encodedTokenAttributes);
		const tokenType = TokenMetadata.getTokenType(encodedTokenAttributes);
		const fontStyle = TokenMetadata.getFontStyle(encodedTokenAttributes);
		const foreground = TokenMetadata.getForeground(encodedTokenAttributes);
		const background = TokenMetadata.getBackground(encodedTokenAttributes);

		return String({
			languageId: languageId,
			tokenType: tokenType,
			fontStyle: fontStyle,
			foreground: foreground,
			background: background,
		});
	}



	/**
	 * Updates the fields in `metadata`.
	 * A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
	 */
	export function set(
		encodedTokenAttributes: TokenMetadata,
		languageId: number,
		tokenType: OptionalStandardTokenType,
		containsBalancedBrackets: boolean | null,
		fontStyle: FontStyle,
		foreground: number,
		background: number
	): number {
		let _languageId = TokenMetadata.getLanguageId(encodedTokenAttributes);
		let _tokenType = TokenMetadata.getTokenType(encodedTokenAttributes);
		let _fontStyle = TokenMetadata.getFontStyle(encodedTokenAttributes);
		let _foreground = TokenMetadata.getForeground(encodedTokenAttributes);
		let _background = TokenMetadata.getBackground(encodedTokenAttributes);
		let _containsBalancedBracketsBit: 0|1 =	TokenMetadata.hasBalancedBrackets(encodedTokenAttributes) ? 1:0;

		if (languageId !== 0) _languageId = languageId;
		if (tokenType !== OptionalStandardTokenType.NotSet) _tokenType = fromOptionalTokenType(tokenType);
		if (fontStyle !== FontStyle.NotSet) _fontStyle = fontStyle;
		if (foreground !== 0) _foreground = foreground;
		if (background !== 0) _background = background;
		if (containsBalancedBrackets !== null) _containsBalancedBracketsBit = containsBalancedBrackets ? 1:0;

		return (
			((_languageId << MetadataConsts.LANGUAGEID_OFFSET) |
				(_tokenType << MetadataConsts.TOKEN_TYPE_OFFSET) |
				(_containsBalancedBracketsBit << MetadataConsts.B_BRACKETS_OFFSET) |
				(_fontStyle << MetadataConsts.FONT_STYLE_OFFSET) |
				(_foreground << MetadataConsts.FOREGROUND_OFFSET) |
				(_background << MetadataConsts.BACKGROUND_OFFSET)) 
			>>> 0
		);
	}


		
	export function getSemanticMask(Metadata:TokenMetadata) {
		return (
			((Metadata & MetadataConsts.SEMANTIC_USE_ITALIC) ? MetadataConsts.ITALIC_MASK : 0)
			| ((Metadata & MetadataConsts.SEMANTIC_USE_BOLD) ? MetadataConsts.BOLD_MASK : 0)
			| ((Metadata & MetadataConsts.SEMANTIC_USE_UNDERLINE) ? MetadataConsts.UNDERLINE_MASK : 0)
			| ((Metadata & MetadataConsts.SEMANTIC_USE_STRIKETHROUGH) ? MetadataConsts.STRIKETHROUGH_MASK : 0)
			| ((Metadata & MetadataConsts.SEMANTIC_USE_FOREGROUND) ? MetadataConsts.FOREGROUND_MASK : 0)
			| ((Metadata & MetadataConsts.SEMANTIC_USE_BACKGROUND) ? MetadataConsts.BACKGROUND_MASK : 0)
		) >>> 0;
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
		return TokenMetadata.ContainsTokenType(metaResult, desiredType);
	}
	

	public static tokenTypeCount(tokens: IToken2Array, desiredType: StandardTokenType) {
		const count = (tokens.length >>> 1);
		let tokenCount = 0;
		for (let i = 0; i<count; i++) {
			if ((TokenMetadata.getTokenType(tokens[(i<<1)+1]) & desiredType) === desiredType) tokenCount++;
		}
		return tokenCount;
	}
	

	public static _equals(_a: ITokenArrayRange, _b: ITokenArrayRange) {
		if (!_a || !_b) return !_a && !_b;

		const a = toUint32Array(_a);
		const b = toUint32Array(_b);

		if (a.length !== b.length) return false;
		for (let i = 0, len = a.length; i < len; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	public static UInt32ArrayEquals(A : Uint32Array, B : Uint32Array) {
		if (A.length !== A.length) return false;
		for (let i = 0, len = A.length; i < len; i++) {
			if (A[i] !== B[i]) return false;
		}
		return true;
	}


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

	
	public static IsNullOrEmpty(lineTokens: Uint32Array|ArrayBuffer|null) : lineTokens is null { return (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS);}

	public static FlattenMetadata(tokens: IToken2Array): TokenMetadata {
		const count = (tokens.length >>> 1);
		let FlatMetadata: TokenMetadata = 0;
		for (let i = 0; i<count; i++) FlatMetadata |= tokens[(i<<1)+1];
		return FlatMetadata;
	}

	public static ArrayToString(tokens: IToken2Array) {
		let result = '';
		const count = (tokens.length >>> 1);
		for (let i = 0; i<count; i++) {
			const Metadata = tokens[(i << 1)+1]
			const StartOffset = (i >= 0)? tokens[i << 1] : 0;
			const EndOffset = (i<(count-1))? tokens[(i+1) << 1] : "EOL";
			const LanguageID = TokenMetadata.getLanguageId(Metadata);

			const TokenType = TokenTypeToString(TokenMetadata.getTokenType(Metadata));
			result += `[${i}:\trange=${StartOffset}-${EndOffset},\ttype=${TokenType},\tlanguage=${LanguageID}]\n`;
		}
		return result;
	}
}










export class Token {
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



export const EMPTY_LINE_TOKENS = new Uint32Array(0).buffer;

export function matchScope(scope: string, scopes: readonly string[]) : boolean {
	if(!scope) return true;

	let idx = 0;
	for(const part of scope.split(/\s+/)) {
		while(idx < scopes.length && !scopes[idx].startsWith(part)) ++idx;
		if(idx >= scopes.length) return false;
		else ++idx;
	}
	return true;
}








export interface ITokenData {
	readonly ForeOffset: 0|int;
	readonly AftOffset: -1|int;
	readonly MetaData: TokenMetadata;
}

export interface ITokenLineData {
	readonly Count : int;
	readonly Line? : int;
	readonly Text? : string;
	Metadata(index:int): TokenMetadata;
	ForeOffset(index:int): 0|int;
	AftOffset(index:int): -1|int;
	GetRaw(index:int): int;
	Equals(other:ITokenLineData): bool;
	ToString(): string;

	// AllMetaData(): Generator<TokenMetadata>;
	// AllForeOffsets(): Generator<TokenMetadata>;
	// AllAftOffsets(): Generator<TokenMetadata>;
}


export abstract class AbstactTokenLineData implements ITokenLineData {
	protected readonly _tokens: IToken2Array;
	protected readonly _tokensEndOffset: number;

	public readonly Text: string;
	public readonly Count: int;
	public readonly Line: int;

	constructor(tokens: IToken2Array, line: int, text: string) {
		this._tokensEndOffset = text.length;
		this._tokens = tokens;

		this.Count = (tokens.length >>> 1);
		this.Text = text;
		this.Line = line;
	}

	public Metadata(tokenIndex: int): TokenMetadata { return this._tokens[(tokenIndex << 1) + 1]; }
	public ForeOffset(tokenIndex: int): 0|int { return (tokenIndex>=0)? this._tokens[(tokenIndex + 0) << 1] : 0; }
	public AftOffset(tokenIndex: int): -1|int { return (tokenIndex<=(this.Count+1))? this._tokens[(tokenIndex + 1) << 1] : this._tokensEndOffset; }
	public GetRaw(rawIndex: int): int { return this._tokens[rawIndex]; }

	public Equals(other: ITokenLineData): bool {
		return false;
	}

	public ToString(): string {
		return '';
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







// export class TestingDocumentTokenArray {
	



// }





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
	
	public Metadata(tokenIndex:number): number { return this._tokens[(tokenIndex << 1) + 1]; }
	public StartOffset(tokenIndex: number): number { return (tokenIndex>=0)? this._tokens[(tokenIndex + 0) << 1] : 0; }
	public EndOffset(tokenIndex: number): number { return (tokenIndex<=(this._tokensCount+1))? this._tokens[(tokenIndex + 1) << 1] : this._tokensEndOffset; }
	public GetRaw(rawIndex: number) : number { return this._tokens[rawIndex]; }

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
	public getClassName     (tokenIndex: number){ return TokenMetadata.getClassName     (this.Metadata(tokenIndex));}
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

	public toTokenTypeArray() : Array<StandardTokenType> { return this.FromEnumerate(this.getTokenType); }

	public getToken(index:number):IToken2 {
		return <IToken2> {
			startOffset: (index>0)? this._tokens[(index+0) << 1] : 0,
			endOffset: (index<this._tokensCount)? this._tokens[(index+1) << 1] : this._tokensEndOffset,
			metaData: (index<this._tokensCount)? this._tokens[(index<<1)+1] : this._tokens[(this._tokensCount<<1)-1]
		};
	}

	public toDataString(): string {
		return [...this.Metadatas()].map(TokenMetadata.toString).join(", ");
	}

	public toString(): string {
		return TokenTools.ArrayToString(this._tokens);
	}

	public GetTokenString(index:int): string {
		const TokenFore = this.StartOffset(index);
		const TokenAft = this.EndOffset(index);
		return this._text.slice(TokenFore, TokenAft);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Queries

	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public IndexOf(offset: number): number { return AbstractTokenArray.findIndexInTokensArray(this._tokens, offset); }
	public Contains(tokenType:StandardTokenType) { return TokenMetadata.ContainsTokenType(this.LineMetadata, tokenType); }
	public ContainsBefore(offset: number): bool {
		let metaResult = 0;
		for (let i = 0; i<this._tokensCount; i++) {
			if (this.StartOffset(i) >= offset) break;
			else metaResult |= this._tokens[(i<<1)+1];
		}
		return TokenMetadata.ContainsTokenType(this.LineMetadata, metaResult);
	}


	public FindIndexOf(tokenType:StandardTokenType) {
		for (let i = 0; i<this._tokensCount; i++) {
			if (TokenMetadata.getTokenType(this._tokens[(i<<1)+1]) == tokenType) return i;
		}
		return -1;
	}

	public FindRangesOf(tokenType:StandardTokenType, line:int = 0) {
		const RangeArray = new Array<Range>();
		let startPos: Position|undefined = undefined;

		for (let i = 0; i<this._tokensCount; i++) {
			const TokenType = TokenMetadata.getTokenType(this._tokens[(i<<1)+1]);

			if (startPos !== undefined && TokenType !== tokenType) {
				RangeArray.push(new Range(startPos, new Position(line, this.StartOffset(i))))
				startPos = undefined;
			} else if (TokenType === tokenType) {
				startPos = new Position(line, this.StartOffset(i));
			}
		}

		if (startPos !== undefined) {
			RangeArray.push(new Range(startPos, new Position(line, this._tokensEndOffset)))
		}
		return RangeArray;
	}


	/**
	 * Find the token containing offset `offset` //Talking about column offset.
	 * @param offset The search offset
	 * @return The index of the token containing the offset.
	 */
	public findTokenIndexAtOffset(offset: number): number {
		return AbstractTokenArray.findIndexInTokensArray(this._tokens, offset);
	}
	

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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



























export abstract class BaseTokenArray {
	protected readonly _languageIdCodec: ILanguageIdCodec;

	public constructor(languageIdCodec: ILanguageIdCodec) {
		this._languageIdCodec = languageIdCodec;
	}
}



export class SimpleTokenArray {
	protected readonly _tokens: IToken2Array;
	protected readonly _tokensCount: number;

	public get count(): number { return this._tokensCount; }
	
	constructor(tokens: IToken2Array) {
		this._tokensCount = (tokens.length >>> 1);
		this._tokens = tokens;
	}

	public Metadata(tokenIndex:number): number { return this._tokens[(tokenIndex << 1) + 1]; }
	public StartOffset(tokenIndex: number): number { return (tokenIndex>0)? this._tokens[(tokenIndex+0) << 1] : 0; }
	public EndOffset(tokenIndex: number): number { return (tokenIndex<=this._tokensCount)? this._tokens[(tokenIndex+1) << 1] : -1; }
}


export class SparseLineTokens {
	protected readonly _tokens: IToken2Array;
	constructor(tokens: IToken2Array) { this._tokens = tokens; }


	public get count(): number { return this._tokens.length >> 2; }

	public getStartCharacter(tokenIndex: number): number { return this._tokens[(tokenIndex << 2) + 1]; }
	public getEndCharacter(tokenIndex: number): number { return this._tokens[(tokenIndex << 2) + 2]; }
	public getMetadata(tokenIndex: number): number { return this._tokens[(tokenIndex << 2) + 3]; }
}




export class StandardLineTokens extends AbstractTokenArray {
	constructor(tokens: IToken2Array, text: string) { super(tokens, text); }

	public hasTokenType(tokenType:StandardTokenType) { return TokenTools.containsTokenType(this._tokens, tokenType); }
	public indexOf(tokenType:StandardTokenType) { return TokenTools.findIndexOfType(this._tokens, tokenType); }

	public offsetOf(tokenType:StandardTokenType) {
		const Index = TokenTools.findIndexOfType(this._tokens, tokenType);
		return (Index === -1)? -1 : this.StartOffset(Index);
	}

	public getOffsetDelta(tokenIndex: number): number {
		if (tokenIndex <= 0) return 0;
		const offsetStart = this._tokens[(tokenIndex+0) << 1];
		const offsetEnd = this._tokens[(tokenIndex+1) << 1];
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












































































































export function toUint32Array(arr: Uint32Array | ArrayBuffer): Uint32Array {
	return (arr instanceof Uint32Array)? arr : new Uint32Array(arr);
}



export function base64(s: string): string;
export function base64(bytes: Uint8Array): string;
export function base64(data: string | Uint8Array): string {
	return Buffer.from(data).toString('base64');
}

export function fromBase64(s: string): Uint8Array {
	return Buffer.from(s, 'base64');
}

// const textEncoder = new TextEncoder();

// export function base64(s: string): string;
// export function base64(bytes: Uint8Array): string;
// export function base64(data: string | Uint8Array): string {
// 	let bytes = typeof data === 'string' ? textEncoder.encode(data) : data;

// 	let output = '';
// 	for (let i = 0, { length } = bytes; i < length; i++) {
// 		output += String.fromCharCode(bytes[i]);
// 	}
// 	return globalThis.btoa(output);
// }

// export function fromBase64(s: string): Uint8Array {
// 	const decoded = globalThis.atob(s);

// 	const len = decoded.length;
// 	const bytes = new Uint8Array(len);
// 	for (let i = 0; i < len; i++) {
// 		bytes[i] = decoded.charCodeAt(i);
// 	}
// 	return bytes;
// }



export function encodeUtf8Hex(s: string): string {
	return Buffer.from(s, 'utf8').toString('hex');
}

export function decodeUtf8Hex(hex: string): string {
	return Buffer.from(hex, 'hex').toString('utf8');
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














































//https://github.com/KamiKillertO/vscode-colorize/blob/develop/src/lib/util/color-util.ts








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

	public getColorMap(): Color[] { return this._id2color.slice(0); }
	static fromHex(hex: string): Color { return ColorMap.parseHex(hex) || new Color(255, 0, 255, 1); }


	static parseHex(hex : string) {
		const length = hex.length;
		
		if (length === 0) return null; // Invalid color
		else if (hex.charCodeAt(0) !== 35) return null; // Does not begin with a #
		switch (length) {
			case 4: {
				// #RGB format
				const r = ColorMap.parseHexDigitSingle(hex.charCodeAt(1));
				const g = ColorMap.parseHexDigitSingle(hex.charCodeAt(2));
				const b = ColorMap.parseHexDigitSingle(hex.charCodeAt(3));
				return new Color(r, g, b, 1);
			}
			case 5: {
				// #RGBA format
				const r = ColorMap.parseHexDigitSingle(hex.charCodeAt(1));
				const g = ColorMap.parseHexDigitSingle(hex.charCodeAt(2));
				const b = ColorMap.parseHexDigitSingle(hex.charCodeAt(3));
				const a = ColorMap.parseHexDigitSingle(hex.charCodeAt(4));
				return new Color(r, g, b, a / 255);
			}
			case 7: {
				// #RRGGBB format
				const r = ColorMap.parseHexDigitDouble(hex.charCodeAt(1), hex.charCodeAt(2));
				const g = ColorMap.parseHexDigitDouble(hex.charCodeAt(3), hex.charCodeAt(4));
				const b = ColorMap.parseHexDigitDouble(hex.charCodeAt(5), hex.charCodeAt(6));
				return new Color(r, g, b, 1);
			}
			case 9: {
				// #RRGGBBAA format
				const r = ColorMap.parseHexDigitDouble(hex.charCodeAt(1), hex.charCodeAt(2));
				const g = ColorMap.parseHexDigitDouble(hex.charCodeAt(3), hex.charCodeAt(4));
				const b = ColorMap.parseHexDigitDouble(hex.charCodeAt(5), hex.charCodeAt(6));
				const a = ColorMap.parseHexDigitDouble(hex.charCodeAt(7), hex.charCodeAt(8));
				return new Color(r, g, b, a / 255);

			// Invalid color
			} default : return null;
		}
	}

	static parseHexDigitSingle(code : number) {
		const x = CharCodes.ParseHexDigit(code);
		return (x << 4) + x;
	}

	
	static parseHexDigitDouble(codeA : number, codeB : number) {
		return (CharCodes.ParseHexDigit(codeA) << 4) + CharCodes.ParseHexDigit(codeB);
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

	public getColorMap(): Color[] { return this._colorMap.getColorMap(); }

	/** used for testing purposes **/
	public getThemeTrieElement(): ExternalThemeTrieElement { return this._root.toExternalThemeTrieElement(); }

	public _match(token: string): ThemeTrieElementRule { return this._root.match(token); }

	public match(languageId: LanguageId, token: string): number {
		// The cache contains the metadata without the language bits set.
		let result = this._cache.get(token);
		if (typeof result === 'undefined') {
			const rule = this._match(token);
			const standardToken = StringToTokenType(token);
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
		if (children instanceof Map) this.children = children;
		else {
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
		return (child !== undefined)? child.match(tail) : this._mainRule;
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



