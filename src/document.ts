import * as vscode from 'vscode';
// import * as vsctm from 'vscode-textmate';

import "./extensions/ArrayExtensions";
// import { ExtentionProvider } from './providers/ExtentionProvider';
import { TextDocumentContentChangeEvent as ChangeEvent } from 'vscode';
import { TMRegistry } from './Tokenisation/TextmateLoader';
import { LanguageLoader } from './providers/LanguageProvider';
import { StandardLineTokens } from './Tokenisation/tokenisation';

function HyperScopeError(err : any, message : string, ...optionalParams : any[]) {
	console.error("HyperScopes: "+message, ...optionalParams, err);
}


export function LoadDocumentsAndGrammer() {
	LanguageLoader.LoadLanguages();
	TMRegistry.ReloadGrammar();
	DocumentLoader.reloadDocuments();
}

















export function GetDocumentScopeAt(document:vscode.TextDocument, position:vscode.Position) {
	return DocumentLoader.getDocument(document.uri)?.getScopeAt(position);
}


export function TryGetDocumentScopeAt(document:vscode.TextDocument, position:vscode.Position) : TokenInfo|undefined {
	try { return DocumentLoader.getDocument(document.uri)?.getScopeAt(position); } 
	catch (err) { HyperScopeError(err, "Unable to get Scope at position: ", position, "\n"); }
	return undefined;
}
export function TryGetDocumentScopeLine(document:vscode.TextDocument, position:vscode.Position) : TokenInfo[]|undefined {
	try { return DocumentLoader.getDocument(document.uri)?.getLineScopes(position); } 
	catch (err) { HyperScopeError(err, "Unable to get Scope at position: ", position, "\n"); }
	return undefined;
}
export function TryGetDocumentScopeFull(document:vscode.TextDocument) : TokenInfo[][]|undefined {
	try { return DocumentLoader.getDocument(document.uri)?.getAllScopes(); } 
	catch (err) { HyperScopeError(err, "Unable to get Scopes for the document", "\n"); }
	return undefined;
}
export function TryGetDocumentScopeFullFlat(document:vscode.TextDocument) : TokenInfo[]|undefined {
	try { return DocumentLoader.getDocument(document.uri)?.getAllScopesFlat(); } 
	catch (err) { HyperScopeError(err, "Unable to get Scopes for the document", "\n"); }
	return undefined;
}

export async function TryGetGrammar(scopeName : string) : Promise<IGrammar|undefined> {
	try { if(TMRegistry.Current) return await TMRegistry.Current.loadGrammar(scopeName) ?? undefined; } 
	catch(err) { HyperScopeError(err, "Unable to get grammar for scope: ", scopeName, "\n"); }
	return undefined;
}



export const GetGetScopeAtAPI = { 
	getScopeAt: TryGetDocumentScopeAt, 
	getScopeLine: TryGetDocumentScopeLine,
	getGrammar: TryGetGrammar 
};




//.........................................................................................................................



//.........................................................................................................................



export class DocumentLoader {
	private static readonly documentsMap : Map<vscode.Uri, DocumentController> = new Map<vscode.Uri, DocumentController>();

	public static getDocument(uri : vscode.Uri) {
		return DocumentLoader.documentsMap.get(uri);
	}

	public static getDocumentController(document : vscode.TextDocument) {
		return DocumentLoader.documentsMap.get(document.uri);
	}


	public static async openDocument(document : vscode.TextDocument) {
		if (DocumentLoader.documentsMap.has(document.uri)) { //Refreshes if exists.
			DocumentLoader.documentsMap.get(document.uri)!.refresh();
		} else if (TMRegistry.Current) { //If it does not exist, open it.
			const scopeName = LanguageLoader.languageToScopeName.get(document.languageId);
			if (scopeName) TMRegistry.Current.loadGrammar(scopeName).then(grammar =>{
				if (grammar) DocumentLoader.documentsMap.set(document.uri, new DocumentController(document, grammar));
			});
		}
	}

	public static updateDocument(document: vscode.TextDocument) {
		if (DocumentLoader.documentsMap.has(document.uri)) {
			DocumentLoader.documentsMap.get(document.uri)!.refresh();
		}
	}

	public static closeDocument(document:vscode.TextDocument) {
		if (DocumentLoader.documentsMap.has(document.uri)) {
			DocumentLoader.documentsMap.get(document.uri)!.dispose();
			DocumentLoader.documentsMap.delete(document.uri);
		}
	}




	public static async reloadDocuments() {
		DocumentLoader.unloadDocuments();
		vscode.workspace.textDocuments.forEach(DocumentLoader.openDocument);
		console.log("HyperScopes: Reloaded all documents.");
		//TODO: add a trigger here to refresh comment parsing, first pass did not have access to token data.
	}

	public static unloadDocuments() {
		for (const document of DocumentLoader.documentsMap.values()) document.dispose();
		DocumentLoader.documentsMap.clear();
	}
}


//.........................................................................................................................




abstract class DisposableContext implements vscode.Disposable {
	protected readonly subscriptions: vscode.Disposable[] = [];
	public readonly dispose = () =>	this.subscriptions.forEach((s) => s.dispose());
}



// //TODO: add notification delay

// export class DocumentMonitor extends DisposableContext {
// 	// private readonly subscriptions: vscode.Disposable[] = [];
// 	// public readonly dispose = () =>	this.subscriptions.forEach((s) => s.dispose());

// 	// Stores the state for each line
// 	public readonly document: vscode.TextDocument;

// 	//Tools
// 	private static readonly ChangeSorter = (ChangeL:ChangeEvent, ChangeR:ChangeEvent) => ChangeL.range.start.isAfter(ChangeR.range.start) ? 1 : -1;
// 	private static readonly GetTextLinecount = (text : string) => text.match(/[\r\n]+/g)?.length ?? 0;
// 	private static readonly GetRangeLinecount = (range : vscode.Range) => (range.end.line - range.start.line);


// 	public constructor(doc: vscode.TextDocument) { super();
// 		this.document = doc;
// 		/* Store content changes. Will be clear when calling `getScopeAt()`. */
// 		this.subscriptions.push(vscode.workspace.onDidChangeTextDocument(this.onTextDocumentChange));
// 		// this.parseEntireDocument();
// 	}

// 	private onTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
// 		if (event.document == this.document && event.contentChanges.length) { //Validates changes
// 			this.applyChanges([...event.contentChanges].sort(DocumentMonitor.ChangeSorter)); //Sorts changes to apply so that line changes can just reparse the rest of the doc.
// 		}
// 	}


// 	private applyChanges(sortedChanges: readonly vscode.TextDocumentContentChangeEvent[]) {
// 		for(let change of sortedChanges){
// 			const changeEndLine = change.range.end.line;
// 			// if (insert line count !== replaced content line count) then: parse the rest of document and return;
// 			if((DocumentMonitor.GetRangeLinecount(change.range) !== DocumentMonitor.GetTextLinecount(change.text))){
// 				// this.parseRange(new vscode.Range(changeEndLine+1, 0 , this.document.lineCount, 0));
// 				return;
// 			} else {

// 			}
// 		}
// 	}

// }









//.........................................................................................................................


//TODO: implement this directly with comment parsing to reduce needless parsing

//TODO: look into content changes array and see what its used or if its needed

export class DocumentController extends DisposableContext {
	// Stores the state for each line
	private readonly grammar: IGrammar;
	public readonly document: vscode.TextDocument;
	private tokensArray : Array<ITokenizeLineResult | undefined> = [];
	private tokens2Array : Array<ITokenizeLineResult2 | undefined> = [];
	private documentText : Array<string> = [];

	//Tools
	private static readonly ChangeSorter = (ChangeL:ChangeEvent, ChangeR:ChangeEvent) => ChangeL.range.start.isAfter(ChangeR.range.start) ? 1 : -1;

	public constructor(doc: vscode.TextDocument, textMateGrammar: IGrammar) {
		super();
		this.grammar = textMateGrammar;
		this.document = doc;
		this.parseEntireDocument();
		/* Store content changes. Will be clear when calling `getScopeAt()`. */
		this.subscriptions.push(vscode.workspace.onDidChangeTextDocument(this.onTextDocumentChange));
	}

	private onTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
		if (event.document == this.document && event.contentChanges.length) { //Validates changes
			//Sorts changes to apply so that line changes can just reparse the rest of the doc.
			this.applyChanges([...event.contentChanges].sort(DocumentController.ChangeSorter));
		}
	}


	private applyChanges(sortedChanges: readonly vscode.TextDocumentContentChangeEvent[]) {
		for(let change of sortedChanges){
			const changeEndLine = change.range.end.line;
			// compare ruleStack
			const initState = this.tokensArray[changeEndLine]?.ruleStack;
			this.parseRange(change.range);
			const lastState = this.tokensArray[changeEndLine]?.ruleStack;
			// if (insert line count !== replaced content line count || ruleStack !== init ruleStack) then: parse the rest of document and return;
			if((change.range.lineCount !== change.text.lineCount) || (initState !== lastState)){
				this.parseLines(changeEndLine+1, this.document.lineCount);
				return;
			}
		}
	}

	//...............................................................................
	
	public refresh() {
		this.tokensArray = [];
		this.tokens2Array = [];
		this.parseEntireDocument();
	}

	//...............................................................................
	// * Getting Scopes/API

	public getScopeAt(position : vscode.Position) : TokenInfo{
		if (!this.grammar) return TokenInfo.Default(position);
		position = this.document.validatePosition(position);
		this.validateLine(position.line);

		const token = this.tokensArray[position.line]?.tokens.last(token=> token.startIndex <= position.character);
		return (token)? TokenInfo.Create(this.document, position.line, token) : TokenInfo.Default(position);
	}


	public getLineScopes(linePosition : vscode.Position) : Array<TokenInfo> {
		if (!this.grammar) return [];
		linePosition = this.document.validatePosition(linePosition);
		this.validateLine(linePosition.line);

		const lineTokens = this.tokensArray[linePosition.line];
		return (lineTokens)? TokenInfo.CreateLineArray(this.document, linePosition.line, lineTokens) : [];
	}

	public getScopesForLines(lineRange : vscode.Range) : Array<Array<TokenInfo>> {
		if (!this.grammar) return [];
		lineRange = this.document.validateRange(lineRange);
		this.validateRange(lineRange);

		const lineCount = lineRange.end.line - lineRange.start.line;
		const returnTokens : TokenInfo[][] = new Array(lineCount+1); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex <= lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineRange.start.line + lineIndex];
			returnTokens[lineIndex] = (lineTokensArray)? TokenInfo.CreateLineArray(this.document, lineRange.start.line + lineIndex, lineTokensArray) : [];
		}


		return returnTokens;
	}


	public getAllScopes() : Array<Array<TokenInfo>> {
		if (!this.grammar) return [];
		this.validateDocument();
		//We should now have an up to date varsion of all tokens.

		const returnTokens : TokenInfo[][] = new Array(this.document.lineCount);
		for (let lineIndex = 0; (lineIndex < this.document.lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineIndex];
			returnTokens[lineIndex] = (lineTokensArray)? TokenInfo.CreateLineArray(this.document, lineIndex, lineTokensArray) : [];
		}

		return returnTokens;
	}

	public getAllScopesFlat() : Array<TokenInfo> {
		if (!this.grammar) return [];
		this.validateDocument();
		//We should now have an up to date varsion of all tokens.

		const returnTokens : TokenInfo[] = new Array(this.document.lineCount);
		for (let lineIndex = 0; (lineIndex < this.document.lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineIndex];
			if (lineTokensArray) returnTokens.push.apply(TokenInfo.CreateLineArray(this.document, lineIndex, lineTokensArray));
		}

		return returnTokens;
	}

	//...............................................................................
	//* Getting token data

	public getLineTokenData(linePosition : vscode.Position) : StandardLineTokens|undefined {
		if (!this.grammar) return;
		linePosition = this.document.validatePosition(linePosition);
		
		this.validateLine(linePosition.line);

		const tok2arr = this.tokens2Array[linePosition.line];
		return (tok2arr)? new StandardLineTokens(tok2arr.tokens, this.document.lineAt(linePosition).text) : undefined;
	}

	public getLinesTokenData(lineRange : vscode.Range) : Array<StandardLineTokens> {
		if (!this.grammar) return [];
		lineRange = this.document.validateRange(lineRange);
		
		this.validateLines(lineRange.start.line, lineRange.end.line);

		const lineCount = lineRange.end.line - lineRange.start.line;
		const returnTokens : StandardLineTokens[] = new Array(lineCount+1); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex <= lineCount); lineIndex++){
			const lineTokensArray = this.tokens2Array[lineRange.start.line + lineIndex];
			if (lineTokensArray) returnTokens[lineIndex] = new StandardLineTokens(lineTokensArray.tokens, this.document.lineAt(lineRange.start.line + lineIndex).text);
		}
		return returnTokens;
	}

	public getDocumentTokenData() : Array<StandardLineTokens> {
		if (!this.grammar) return [];
		this.validateDocument();
		
		const lineCount = this.document.lineCount;
		const returnTokens : StandardLineTokens[] = new Array(lineCount); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex < lineCount); lineIndex++){
			const lineTokensArray = this.tokens2Array[lineIndex];
			if (lineTokensArray) returnTokens[lineIndex] = new StandardLineTokens(lineTokensArray.tokens, this.document.lineAt(lineIndex).text);
		}
		return returnTokens;
	}

	//...............................................................................
	// * Validation
	// TODO: FIXME: if some other extensions call this API by changing text without triggering `onDidChangeTextDocument` event in this extension, it may cause an error.

	private validateLine(lineIndex : number) {
		const line : vscode.TextLine = this.document.lineAt(lineIndex);
		if (this.documentText[lineIndex] !== line.text) this.parseLine(line);
	}

	private validateLines(startLine:number, endLine:number) {
		for (let lineIndex = startLine; (lineIndex <= endLine); lineIndex++){
			this.validateLine(lineIndex);
		}
	}
	
	private validateRange(range: vscode.Range) {
		this.validateLines(range.start.line, range.end.line);
	}

	private validateDocument() {
		//If line counts are the same, validate each line. If different, reparse entire document.
		if (this.documentText.length === this.document.lineCount) {
			this.validateLines(0, this.document.lineCount-1);
		} else this.refresh();
	}



	//...............................................................................
	// * Parsing
	private parseLine(line : vscode.TextLine) : void {
		if(!this.grammar) return;
		// Update text content
		this.documentText[line.lineNumber] = line.text;
		const TooLong = ((line.text.length > 20000)); // Don't tokenize line if too long
		this.tokensArray[line.lineNumber]  = (!TooLong)? this.grammar.tokenizeLine(line.text, this.getLineState(line.lineNumber-1)) : undefined;
		this.tokens2Array[line.lineNumber] = (!TooLong)? this.grammar.tokenizeLine2(line.text, this.getLineState2(line.lineNumber-1)) : undefined;
	}

	private parseLines(startLine:number, endLine:number) : void {
		for (let lineIndex = startLine; (lineIndex <= endLine); lineIndex++){
			this.parseLine(this.document.lineAt(lineIndex));
		}
	}

	private parseRange(range : vscode.Range) : void {
		range = this.document.validateRange(range);
		this.parseLines(range.start.line, range.end.line);
	}

	private parseEntireDocument() : void {
		this.parseLines(0, this.document.lineCount-1);
	}




	//...............................................................................
	
	private getLineState(lineIndex:number) { return (lineIndex >= 0)? this.tokensArray[lineIndex]?.ruleStack : undefined; }
	private getLineState2(lineIndex:number) { return (lineIndex >= 0)? this.tokens2Array[lineIndex]?.ruleStack : undefined; }
}



//.........................................................................................................................


















/** for getScopeAt */
export class TokenInfo {
	range:vscode.Range;
	text:string;
	scopes:Array<string>;
	token:IToken;

	get lineNumber():number { return this.range.start.line; } //Should only exist on single line
	//...............................................................................

	constructor(range:vscode.Range, text:string, scopes:Array<string>, token:IToken) {
		this.range = range;
		this.text = text;
		this.scopes = scopes;
		this.token = token;
	}
	

	public static Create(document:vscode.TextDocument, lineIndex:number, token:IToken) : TokenInfo {
		return new TokenInfo(
			new vscode.Range(lineIndex, token.startIndex, lineIndex, token.endIndex),
			document.lineAt(lineIndex).text.substring(token.startIndex, token.endIndex),
			token.scopes,
			token
		);
	}

	public static CreateLineArray(document:vscode.TextDocument, lineIndex:number, lineTokens:ITokenizeLineResult) : Array<TokenInfo> {
		const lineText = document.lineAt(lineIndex).text;
		return lineTokens.tokens.map((token) => new TokenInfo(
			new vscode.Range(lineIndex, token.startIndex, lineIndex, token.endIndex),
			lineText.substring(token.startIndex, token.endIndex),
			token.scopes,
			token
		));
	}

	public static Default(position:vscode.Position) : TokenInfo {
		return new TokenInfo(new vscode.Range(position,position),"",[], <IToken>{});
	}
	//...............................................................................

	public GetTokenDisplayInfo() : string {
		const tokenLength = this.text.length;
		const tokenLine = this.range.start.line+1; //Documents disply lines counting from 1.
		const tokenText = (tokenLength < 120)? `'${this.text.replace("'","''")}'` : `'${this.text.substring(0, 116).replace("'","''")}...'`; //double single quote escapes it to be displayed
		const tokenScopes = this.scopes.sort().join('\n  - '); //Why sort them? surely the order matters...
		const baseScope = this.scopes[0].split('.')[0];
		// const 

		return `\n---\nText: ${tokenText}\nLine: ${tokenLine}\nLength: ${tokenLength}\nScopes:\n  - ${tokenScopes}\nBase Scope: ${baseScope}`;

	}

	public IsComment() : boolean {
		return (this.scopes[0].startsWith('comment') || ((this.scopes.length > 1) && this.scopes[1].startsWith('comment')));
	}
}















// public *getDocumentLines() {
// 	for (let lineIndex = 0; (lineIndex < this.document.lineCount); lineIndex++){
// 		yield this.document.lineAt(lineIndex);
// 	}
// }








































// export const TokenTools = {
// 	//Find first token whose end index comes after/on range start. This is the first token in array
// 	//Find last token whose start index comes before/on range end. This is the last token in array.
// 	SelectRange: (lineTokens:vsctm.ITokenizeLineResult, startCharacter:number, endCharacter:number) => {
// 		if (startCharacter > endCharacter) return lineTokens.tokens; //Not a valid range
// 		const StartIndex = lineTokens.tokens.firstIndex((Token)=> Token.endIndex >= startCharacter);
// 		const EndIndex = lineTokens.tokens.lastIndex((Token)=> Token.startIndex <= endCharacter);
// 		if (StartIndex === -1 || EndIndex === -1) return []; //No valid tokens
// 		return lineTokens.tokens.slice(StartIndex, EndIndex);
// 	},
// 	FindToken: (lineTokens:vsctm.ITokenizeLineResult, position:vscode.Position) => lineTokens.tokens.first(
// 		(token)=> token.startIndex <= position.character && position.character <= token.endIndex
// 	),

// 	CreateRangeFor: (token:vsctm.IToken, lineNumber:number) => new vscode.Range(lineNumber, token.startIndex, lineNumber, token.endIndex),
// 	SelectTokenText: (token:vsctm.IToken, text:string) => text.substring(token.startIndex, token.endIndex),
// }










// export function matchScope(scope: string, scopes: string[]) : boolean {
// 	if(!scope) return true;
// 	const parts = scope.split(/\s+/);
// 	let idx = 0;
// 	for(let part of parts) {
// 		while(idx < scopes.length && !scopes[idx].startsWith(part)) ++idx;
// 		if(idx >= scopes.length) return false;
// 		else ++idx;
// 	}
// 	return true;
// }










































// /**
//  * The state of the tokenizer between two lines.
//  * It is useful to store flags such as in multiline comment, etc.
//  * The model will clone the previous line's state and pass it in to tokenize the next line.
//  */
//  export interface IState {
// 	clone(): IState;
// 	equals(other: IState): boolean;
// }


//  export const enum LanguageId {
// 	Null = 0, PlainText = 1
// }

// export class Token {
// 	_tokenBrand: void = undefined;

// 	public readonly offset: number;
// 	public readonly type: string;
// 	public readonly language: string;

// 	constructor(offset: number, type: string, language: string) {
// 		this.offset = offset;
// 		this.type = type;
// 		this.language = language;
// 	}

// 	public toString(): string { return `(${this.offset}, ${this.type})`; }
// }


// export class TokenizationResult {
// 	_tokenizationResultBrand: void = undefined;

// 	public readonly tokens: Token[];
// 	public readonly endState: IState;

// 	constructor(tokens: Token[], endState: IState) {
// 		this.tokens = tokens;
// 		this.endState = endState;
// 	}
// }

//  export interface ITokenizationSupport {
// 	getInitialState(): IState;
// 	tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
// 	tokenizeEncoded(line: string, hasEOL: boolean, state: IState): EncodedTokenizationResult;
// }
// https://github.com/microsoft/vscode/blob/9776b9d4378ad95aa7b815a3413eed003cb6024b/src/vs/workbench/services/textMate/browser/abstractTextMateService.ts#L159



//  export class EncodedTokenizationResult {
// 	_encodedTokenizationResultBrand: void = undefined;

// 	/** The tokens in binary format. Each token occupies two array indices. For token i:
// 	 *  - at offset 2*i => startIndex
// 	 *  - at offset 2*i + 1 => metadata
// 	 */
// 	public readonly tokens: Uint32Array;
// 	public readonly endState: IState;

// 	constructor(tokens: Uint32Array, endState: IState) {
// 		this.tokens = tokens;
// 		this.endState = endState;
// 	}
// }

//  export interface ILanguageIdCodec {
// 	encodeLanguageId(languageId: string): LanguageId;
// 	decodeLanguageId(languageId: LanguageId): string;
// }

// /**
//  * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
//  * The following assumptions have been made:
//  *  - languageId < 256 => needs 8 bits
//  *  - unique color count < 512 => needs 9 bits
//  *
//  * The binary format is:
//  * - -------------------------------------------
//  *     3322 2222 2222 1111 1111 1100 0000 0000
//  *     1098 7654 3210 9876 5432 1098 7654 3210
//  * - -------------------------------------------
//  *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
//  *     bbbb bbbb ffff ffff fFFF FBTT LLLL LLLL
//  * - -------------------------------------------
//  *  - L = LanguageId (8 bits)
//  *  - T = StandardTokenType (2 bits)
//  *  - B = Balanced bracket (1 bit)
//  *  - F = FontStyle (4 bits)
//  *  - f = foreground color (9 bits)
//  *  - b = background color (9 bits)
//  */
//  export const enum MetadataConsts {
// 	LANGUAGEID_MASK = 0b00000000000000000000000011111111,
// 	TOKEN_TYPE_MASK = 0b00000000000000000000001100000000,
// 	BALANCED_BRACKETS_MASK = 0b00000000000000000000010000000000,
// 	FONT_STYLE_MASK = 0b00000000000000000111100000000000,
// 	FOREGROUND_MASK = 0b00000000111111111000000000000000,
// 	BACKGROUND_MASK = 0b11111111000000000000000000000000,

// 	ITALIC_MASK = 0b00000000000000000000100000000000,
// 	BOLD_MASK = 0b00000000000000000001000000000000,
// 	UNDERLINE_MASK = 0b00000000000000000010000000000000,
// 	STRIKETHROUGH_MASK = 0b00000000000000000100000000000000,

// 	// Semantic tokens cannot set the language id, so we can
// 	// use the first 8 bits for control purposes
// 	SEMANTIC_USE_ITALIC = 0b00000000000000000000000000000001,
// 	SEMANTIC_USE_BOLD = 0b00000000000000000000000000000010,
// 	SEMANTIC_USE_UNDERLINE = 0b00000000000000000000000000000100,
// 	SEMANTIC_USE_STRIKETHROUGH = 0b00000000000000000000000000001000,
// 	SEMANTIC_USE_FOREGROUND = 0b00000000000000000000000000010000,
// 	SEMANTIC_USE_BACKGROUND = 0b00000000000000000000000000100000,

// 	LANGUAGEID_OFFSET = 0,
// 	TOKEN_TYPE_OFFSET = 8,
// 	BALANCED_BRACKETS_OFFSET = 10,
// 	FONT_STYLE_OFFSET = 11,
// 	FOREGROUND_OFFSET = 15,
// 	BACKGROUND_OFFSET = 24
// }


// /**
//  * A standard token type.
//  */
//  export const enum StandardTokenType {
// 	Other = 0,
// 	Comment = 1,
// 	String = 2,
// 	RegEx = 3
// }


// export function nullTokenize(languageId: string, state: IState): TokenizationResult {
// 	return new TokenizationResult([new Token(0, '', languageId)], state);
// }

// export function nullTokenizeEncoded(languageId: LanguageId, state: IState | null): EncodedTokenizationResult {
// 	const tokens = new Uint32Array(2);
// 	tokens[0] = 0;
// 	tokens[1] = (
// 		(languageId << MetadataConsts.LANGUAGEID_OFFSET)
// 		| (StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET)
// 		| (FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET)
// 		| (ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET)
// 		| (ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET)
// 	) >>> 0;

// 	return new EncodedTokenizationResult(tokens, state === null ? NullState : state);
// }

// /**
//  * Open ended enum at runtime
//  */
//  export const enum ColorId {
// 	None = 0,
// 	DefaultForeground = 1,
// 	DefaultBackground = 2
// }

// /**
//  * A font style. Values are 2^x such that a bit mask can be used.
//  */
//  export const enum FontStyle {
// 	NotSet = -1,
// 	None = 0,
// 	Italic = 1,
// 	Bold = 2,
// 	Underline = 4,
// 	Strikethrough = 8,
// }

// export const NullState: IState = new class implements IState {
// 	public equals(other: IState): boolean { return (this === other); }
// 	public clone(): IState { return this; }
// };





// function getSafeTokenizationSupport(languageIdCodec: ILanguageIdCodec, languageId: string): ITokenizationSupport {
// 	const tokenizationSupport = TokenizationRegistry.get(languageId);
// 	if (tokenizationSupport) return tokenizationSupport;

// 	const encodedLanguageId = languageIdCodec.encodeLanguageId(languageId);
// 	return {
// 		getInitialState: () => NullState,
// 		tokenize: (line: string, hasEOL: boolean, state: IState) => nullTokenize(languageId, state),
// 		tokenizeEncoded: (line: string, hasEOL: boolean, state: IState) => nullTokenizeEncoded(encodedLanguageId, state)
// 	};
// }

























// /**
//  * @internal
//  */
//  export interface ITokenizationSupportChangedEvent {
// 	changedLanguages: string[];
// 	changedColorMap: boolean;
// }

// /**
//  * @internal
//  */
// export interface ITokenizationSupportFactory {
// 	createTokenizationSupport(): vscode.ProviderResult<ITokenizationSupport>;
// }

// export interface IDisposable {
// 	dispose(): void;
// }

// /**
//  * @internal
//  */
//  export interface ITokenizationRegistry {

// 	/**
// 	 * An event triggered when:
// 	 *  - a tokenization support is registered, unregistered or changed.
// 	 *  - the color map is changed.
// 	 */
// 	onDidChange: vscode.Event<ITokenizationSupportChangedEvent>;

// 	/**
// 	 * Fire a change event for a language.
// 	 * This is useful for languages that embed other languages.
// 	 */
// 	fire(languageIds: string[]): void;

// 	/**
// 	 * Register a tokenization support.
// 	 */
// 	register(languageId: string, support: ITokenizationSupport): IDisposable;

// 	/**
// 	 * Register a tokenization support factory.
// 	 */
// 	registerFactory(languageId: string, factory: ITokenizationSupportFactory): IDisposable;

// 	/**
// 	 * Get or create the tokenization support for a language.
// 	 * Returns `null` if not found.
// 	 */
// 	getOrCreate(languageId: string): Promise<ITokenizationSupport | null>;

// 	/**
// 	 * Get the tokenization support for a language.
// 	 * Returns `null` if not found.
// 	 */
// 	get(languageId: string): ITokenizationSupport | null;

// 	/**
// 	 * Returns false if a factory is still pending.
// 	 */
// 	isResolved(languageId: string): boolean;

// 	/**
// 	 * Set the new color map that all tokens will use in their ColorId binary encoded bits for foreground and background.
// 	 */
// 	setColorMap(colorMap: vscode.Color[]): void;

// 	getColorMap(): vscode.Color[] | null;

// 	getDefaultBackground(): vscode.Color | null;
// }


// export class DisposableStore implements IDisposable {

// 	static DISABLE_DISPOSED_WARNING = false;

// 	private _toDispose = new Set<IDisposable>();
// 	private _isDisposed = false;

// 	constructor() {
// 		trackDisposable(this);
// 	}

// 	/**
// 	 * Dispose of all registered disposables and mark this object as disposed.
// 	 *
// 	 * Any future disposables added to this object will be disposed of on `add`.
// 	 */
// 	public dispose(): void {
// 		if (this._isDisposed) {
// 			return;
// 		}

// 		markAsDisposed(this);
// 		this._isDisposed = true;
// 		this.clear();
// 	}

// 	/**
// 	 * Returns `true` if this object has been disposed
// 	 */
// 	public get isDisposed(): boolean {
// 		return this._isDisposed;
// 	}

// 	/**
// 	 * Dispose of all registered disposables but do not mark this object as disposed.
// 	 */
// 	public clear(): void {
// 		try {
// 			dispose(this._toDispose.values());
// 		} finally {
// 			this._toDispose.clear();
// 		}
// 	}

// 	public add<T extends IDisposable>(o: T): T {
// 		if (!o) {
// 			return o;
// 		}
// 		if ((o as unknown as DisposableStore) === this) {
// 			throw new Error('Cannot register a disposable on itself!');
// 		}

// 		setParentOfDisposable(o, this);
// 		if (this._isDisposed) {
// 			if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
// 				console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
// 			}
// 		} else {
// 			this._toDispose.add(o);
// 		}

// 		return o;
// 	}
// }

// export abstract class Disposable implements IDisposable {

// 	static readonly None = Object.freeze<IDisposable>({ dispose() { } });

// 	protected readonly _store = new DisposableStore();

// 	constructor() {
// 		trackDisposable(this);
// 		setParentOfDisposable(this._store, this);
// 	}

// 	public dispose(): void {
// 		markAsDisposed(this);

// 		this._store.dispose();
// 	}

// 	protected _register<T extends IDisposable>(o: T): T {
// 		if ((o as unknown as Disposable) === this) {
// 			throw new Error('Cannot register a disposable on itself!');
// 		}
// 		return this._store.add(o);
// 	}
// }

// // export const TokenizationRegistry: ITokenizationRegistry = new TokenizationRegistryImpl();

// export class TokenizationRegistry implements ITokenizationRegistry {

// 	private readonly _map = new Map<string, ITokenizationSupport>();
// 	private readonly _factories = new Map<string, TokenizationSupportFactoryData>();

// 	private readonly _onDidChange = new Emitter<ITokenizationSupportChangedEvent>();
// 	public readonly onDidChange: vscode.Event<ITokenizationSupportChangedEvent> = this._onDidChange.event;

// 	private _colorMap: vscode.Color[] | null;

// 	constructor() {
// 		this._colorMap = null;
// 	}

// 	public fire(languages: string[]): void {
// 		this._onDidChange.fire({
// 			changedLanguages: languages,
// 			changedColorMap: false
// 		});
// 	}

// 	public register(language: string, support: ITokenizationSupport) {
// 		this._map.set(language, support);
// 		this.fire([language]);
// 		return toDisposable(() => {
// 			if (this._map.get(language) !== support) {
// 				return;
// 			}
// 			this._map.delete(language);
// 			this.fire([language]);
// 		});
// 	}

// 	public registerFactory(languageId: string, factory: ITokenizationSupportFactory): IDisposable {
// 		this._factories.get(languageId)?.dispose();
// 		const myData = new TokenizationSupportFactoryData(this, languageId, factory);
// 		this._factories.set(languageId, myData);
// 		return toDisposable(() => {
// 			const v = this._factories.get(languageId);
// 			if (!v || v !== myData) {
// 				return;
// 			}
// 			this._factories.delete(languageId);
// 			v.dispose();
// 		});
// 	}

// 	public async getOrCreate(languageId: string): Promise<ITokenizationSupport | null> {
// 		// check first if the support is already set
// 		const tokenizationSupport = this.get(languageId);
// 		if (tokenizationSupport) {
// 			return tokenizationSupport;
// 		}

// 		const factory = this._factories.get(languageId);
// 		if (!factory || factory.isResolved) {
// 			// no factory or factory.resolve already finished
// 			return null;
// 		}

// 		await factory.resolve();

// 		return this.get(languageId);
// 	}

// 	public get(language: string): ITokenizationSupport | null {
// 		return (this._map.get(language) || null);
// 	}

// 	public isResolved(languageId: string): boolean {
// 		const tokenizationSupport = this.get(languageId);
// 		if (tokenizationSupport) return true;

// 		const factory = this._factories.get(languageId);
// 		if (!factory || factory.isResolved) return true;
// 		return false;
// 	}

// 	public setColorMap(colorMap: vscode.Color[]): void {
// 		this._colorMap = colorMap;
// 		this._onDidChange.fire({
// 			changedLanguages: Array.from(this._map.keys()),
// 			changedColorMap: true
// 		});
// 	}

// 	public getColorMap(): vscode.Color[] | null {
// 		return this._colorMap;
// 	}

// 	public getDefaultBackground(): vscode.Color | null {
// 		if (this._colorMap && this._colorMap.length > ColorId.DefaultBackground) {
// 			return this._colorMap[ColorId.DefaultBackground];
// 		}
// 		return null;
// 	}
// }





// class TokenizationSupportFactoryData extends Disposable {

// 	private _isDisposed: boolean = false;
// 	private _resolvePromise: Promise<void> | null = null;
// 	private _isResolved: boolean = false;
// 	public get isResolved(): boolean {return this._isResolved;}

// 	constructor(
// 		private readonly _registry: TokenizationRegistry,
// 		private readonly _languageId: string,
// 		private readonly _factory: ITokenizationSupportFactory,
// 	) {super();}

// 	public override dispose(): void {
// 		this._isDisposed = true;
// 		super.dispose();
// 	}

// 	public async resolve(): Promise<void> {
// 		this._resolvePromise ??= this._create();
// 		return this._resolvePromise;
// 	}

// 	private async _create(): Promise<void> {
// 		const value = await Promise.resolve(this._factory.createTokenizationSupport());
// 		this._isResolved = true;
// 		if (value && !this._isDisposed) {
// 			this._register(this._registry.register(this._languageId, value));
// 		}
// 	}
// }







































	// ExcludeTokensBefore: (lineTokens:vsctm.ITokenizeLineResult, position:vscode.Position) => {
	// 	const sliceIndex = lineTokens.tokens.findIndex((Token) => Token.startIndex >= position.character);
	// 	return (sliceIndex===-1)? lineTokens.tokens : lineTokens.tokens.slice(sliceIndex, -1);
	// },
	// ExcludeTokensAfter: (lineTokens:vsctm.ITokenizeLineResult, position:vscode.Position) => {
	// 	const sliceIndex = lineTokens.tokens.findIndex((Token) => Token.endIndex <= position.character);
	// 	return (sliceIndex===-1)? lineTokens.tokens : lineTokens.tokens.slice(0, sliceIndex);
	// },




// public getRangeScopes(range : vscode.Range) : Array<Array<TokensInfo>> {
// 	if (!this.grammar) return [];
// 	range = this.document.validateRange(range);

// 	if (range.isSingleLine) {
// 		const line = range.start.line;
// 		this.validateLine(line);
// 		this.contentChangesArray.length = 0; //clears changes
		
// 		const lineTokens = this.tokensArray[line]?.tokens.filter((T)=> T.startIndex <= range.start.character && range.end.character <= T.endIndex);
// 		return [(lineTokens)? lineTokens.map((T) => TokensInfo.Create(this.document, line, T)) : []];
// 	} else {
// 		const returnTokens : TokensInfo[][] = new Array(this.document.lineCount);
// 		for (let lineIndex = range.start.line; (lineIndex <= range.end.line); lineIndex++){
// 			this.validateLine(lineIndex);
// 			const lineTokens = this.tokensArray[lineIndex];
// 			if (lineTokens) {
// 				returnTokens[lineIndex] = (
// 					(lineIndex === range.start.line)
// 						? lineTokens.tokens
// 							.filter((T)=> T.startIndex <= range.start.character)
// 							.map((T) => TokensInfo.Create(this.document, lineIndex, T))
// 					:(lineIndex === range.end.line)
// 						? lineTokens.tokens
// 							.filter((T)=> range.end.character <= T.endIndex)
// 							.map((T) => TokensInfo.Create(this.document, lineIndex, T))
// 					: TokensInfo.CreateLineArray(this.document, lineIndex, lineTokens)
// 				);
// 			} else returnTokens[lineIndex] = [];
// 		}
// 		this.contentChangesArray.length = 0; //clears changes
// 		return returnTokens;
// 	}
// }




			// for (let index = lineTokens.tokens.length; index--;) {
			// 	const token = lineTokens.tokens[index];
			// 	if (token.startIndex <= position.character ){
			// 		// console.log(process.hrtime()[1]-a); //? TEST SPEED
			// 		return TokenInfo.Create(this.document, position.line, token);
			// 	}
			// }



// /** A grammar */

// export interface IGrammar {
// 	/** Tokenize `lineText` using previous line state `prevState`. */
// 	tokenizeLine(lineText: string, prevState: StackElement | null): ITokenizeLineResult;
// }

// export interface ITokenizeLineResult {
// 	readonly tokens: IToken[];
// 	/** The `prevState` to be passed on to the next line tokenization. */
// 	readonly ruleStack: StackElement;
// }

// export interface IToken {
// 	startIndex: number;
// 	readonly endIndex: number;
// 	readonly scopes: string[];
// }

// export interface StackElement {
// 	_stackElementBrand: void;
// 	readonly depth: number;
// 	clone(): StackElement;
// 	equals(other: StackElement): boolean;
// }

// export interface Token {
// 	range: vscode.Range;
// 	text: string;
// 	scopes: string[];
// }

// export interface HScopesAPI {
// 	getScopeAt(document: vscode.TextDocument, position: vscode.Position): Token | null;
// 	getGrammar(scopeName: string): Promise<IGrammar | null>;
// 	getScopeForLanguage(language: string): string | null;
// }


















/*
import * as vscode from 'vscode';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from "vscode-oniguruma";
import { readFileSync, promises } from "fs";
import { join as pathJoin } from "path";










const wasmBin = readFileSync(pathJoin(__dirname, '../node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
	return {
		createOnigScanner(patterns: string[]) { return new oniguruma.OnigScanner(patterns); },
		createOnigString(s: string) { return new oniguruma.OnigString(s); }
	};
});


export let registry : vsctm.Registry|undefined;
export function reloadGrammar() {
	try {
		registry = new vsctm.Registry({
			onigLib: vscodeOnigurumaLib,
			getInjections: (scopeName) => {
				let extensions = vscode.extensions.all.map((x) => x.packageJSON as ExtensionPackage).filter((x) => x?.contributes?.grammars);
				return (extensions.flatMap((e) => e.contributes!.grammars!)
				.filter((g) => g.scopeName && g.injectTo?.some((s:string) => (s === scopeName)))
				.map((g) => g.scopeName!)
				);
			},
			loadGrammar: async (scopeName) => {
				try {
					let grammars = vscode.extensions.all.filter((x) => x.packageJSON?.contributes?.grammars).flatMap((e) => 
					e.packageJSON.contributes.grammars.map((g:ExtensionGrammar) => {
						return { extensionPath: e.extensionPath, ...g };
					})
					);
					const matchingGrammars = grammars.filter((g) => (g.scopeName === scopeName));
					if (matchingGrammars.length > 0) {
						const grammar = matchingGrammars[0];
						const filePath = pathJoin(grammar.extensionPath, grammar.path);
						let content = await promises.readFile(filePath, 'utf-8');
						return vsctm.parseRawGrammar(content, filePath);
					}
				} catch (err) { console.error(`HyperScopes: Unable to load grammar for scope ${scopeName}.`, err);  }
				return undefined;
			},
		});
	} catch (err) {
		registry = undefined;
		console.error(err);
	}
}






let documentsMap : Map<vscode.Uri, DocumentController> = new Map();
export function getDocument(uri:vscode.Uri) {
	return documentsMap.get(uri);
}

export async function openDocument(document : vscode.TextDocument) {
	try {
		const thisDocController = documentsMap.get(document.uri);
		if (thisDocController) thisDocController.refresh();
		else if (registry) {
			const scopeName = getLanguageScopeName(document.languageId);
			if (scopeName) {
				const grammar = await registry.loadGrammar(scopeName);
				if (grammar) documentsMap.set(document.uri, new DocumentController(document, grammar));
			}
		}
	} catch (err) { console.log("HyperScopes: Unable to load document controller",err); }
}
export function reloadDocuments(){
	unloadDocuments();
	vscode.workspace.textDocuments.forEach((doc) => openDocument(doc))
}

export function closeDocument(document:vscode.TextDocument) {
	const thisDocController = documentsMap.get(document.uri);
	if (thisDocController) {
		thisDocController.dispose();
		documentsMap.delete(document.uri);
	}
}
export function unloadDocuments() {
	for (const thisDocController of documentsMap.values()) {
		thisDocController.dispose();
	}
	documentsMap.clear();
}




export function GetGetScopeAtAPI() {
	return {
		getScopeAt(document:vscode.TextDocument, position:vscode.Position) : TokensInfo|undefined {
			try { return getDocument(document.uri)?.getScopeAt(position); } 
			catch (err) { console.error("HyperScopes: Unable to get Scope at position: ", position, "\n",err); }
			return undefined;
		},
	}
}








export interface ExtensionPackage {
	contributes?: {
		languages?: { id: string; configuration: string }[];
		grammars?: ExtensionGrammar[];
	};
}


export interface ExtensionGrammar {
	language?: string;
	scopeName?: string;
	path?: string;
	embeddedLanguages?: { [scopeName: string]: string };
	injectTo?: string[];
}

export function getLanguageScopeName(languageId : string): string | undefined {
	try {
		const matchingLanguages = (vscode.extensions.all
			.map((x) => (x.packageJSON as ExtensionPackage)?.contributes?.grammars!)
			.filter((x) => x).reduce((a: ExtensionGrammar[], b: ExtensionGrammar[]) => [...a, ...b], [])
		).filter((g) => g.language === languageId);
		if (matchingLanguages.length > 0) return matchingLanguages[0].scopeName; // console.info(`Mapping language ${languageId} to initial scope ${matchingLanguages[0].scopeName}`);
	} catch (err) { console.log("HyperScopes: Unable to get language scope name", err);  }
	return undefined;
}















export class DocumentController implements vscode.Disposable {
	private subscriptions: vscode.Disposable[] = [];

	// Stores the state for each line
	private grammar: vsctm.IGrammar;
	private document: vscode.TextDocument;
	private tokensArray : Array<vsctm.ITokenizeLineResult | undefined> = [];
	private documentText : Array<string> = [];
	private contentChangesArray : Array<vscode.TextDocumentContentChangeEvent> = []; // Stores text-change

	public constructor(doc: vscode.TextDocument, textMateGrammar: vsctm.IGrammar) {
		this.grammar = textMateGrammar;
		this.document = doc;

		this.parseEntireDocument();
		this.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
			if (e.document == this.document && e.contentChanges.length){
				const changes = [...e.contentChanges].sort((change1, change2) => change1.range.start.isAfter(change2.range.start) ? 1 : -1);
				this.contentChangesArray = changes;
				this.applyChanges(changes);
			}
		}));
	}


	public dispose() {
		this.subscriptions.forEach((s) => s.dispose());
	}


	public getScopeAt(position : vscode.Position) : TokensInfo{
		// let a = process.hrtime()[1] //? TEST SPEED
		if (!this.grammar) return TokensInfo.Default(position);
		position = this.document.validatePosition(position);

		// TODO: FIXME: if some other extensions call this API by changing text without triggering `onDidChangeTextDocument` event in this extension, it may cause an error.
		if(!this.contentChangesArray.length && this.documentText[position.line] !== this.document.lineAt(position.line).text){
			this.parseRange(new vscode.Range(position,position));
		}
		this.contentChangesArray.length = 0;

		const token = this.tokensArray[position.line];
		if (token) {
			for (let index = token.tokens.length; index--;) {
				const thisToken = token.tokens[index];
				if (thisToken.startIndex <= position.character ){
					// console.log(process.hrtime()[1]-a); //? TEST SPEED
					return TokensInfo.Create(this.document, position.line, thisToken);
				}
			}
		}

		return TokensInfo.Default(position);
	}

	private applyChanges(sortedChanges: readonly vscode.TextDocumentContentChangeEvent[]) {
		for(let change of sortedChanges){
			// compare ruleStack
			const initState = this.tokensArray[change.range.end.line]?.ruleStack;
			this.parseRange(this.document.validateRange(change.range));
			const lastState = this.tokensArray[change.range.end.line]?.ruleStack;

			// if (insert line count !== replaced content line count || ruleStack !== init ruleStack) 
			//  {parse the rest of document; return} 
			if((change.range.end.line - change.range.start.line) !== (change.text.match(/[\r\n]+/g)?.length ?? 0) || initState !== lastState  ){
				const moreRange = new vscode.Range(change.range.end.line+1, 0 , this.document.lineCount, 0);
				this.parseRange(this.document.validateRange(moreRange));
				return;
			}
		}

	}



	public refresh() {
		this.tokensArray = [];
		this.parseEntireDocument();
	}


	//...............................................................................
	private parseLine(line : vscode.TextLine) {
		if(!this.grammar) return;
		// Update text content
		this.documentText[line.lineNumber] = line.text;
		// Don't tokenize line if too long
		if(line.text.length > 20000) {
			this.tokensArray[line.lineNumber] = undefined;
		} else {
			// Tokenize line
			const prevState = line.lineNumber ?  this.tokensArray[line.lineNumber-1]?.ruleStack ?? null : null;
			const lineTokens = this.grammar.tokenizeLine(line.text, prevState);
			this.tokensArray[line.lineNumber] = lineTokens;
		}
	}

	private parseRange(range : vscode.Range){
		range = this.document.validateRange(range);
		for (let lineIndex = range.start.line; (lineIndex <= range.end.line); lineIndex++){
			this.parseLine(this.document.lineAt(lineIndex));
		}
	}

	private parseEntireDocument() : void {
		const docRange = new vscode.Range(0, 0, this.document.lineCount, 0);
		this.parseRange(docRange);
        this.contentChangesArray = [];  
	}

}





*/