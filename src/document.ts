import * as vscode from 'vscode';
// import * as vsctm from 'vscode-textmate';

import "./extensions/ArrayExtensions";
// import { ExtentionProvider } from './providers/ExtentionProvider';
import { TextDocumentContentChangeEvent as ChangeEvent } from 'vscode';
import { TMRegistry } from './Tokenisation/TextmateLoader';
import { LanguageLoader } from './providers/LanguageProvider';
import { StandardLineTokens } from './Tokenisation/tokenisation';
import { Configuration } from './configuration';

function HyperScopeError(err : any, message : string, ...optionalParams : any[]) {
	console.error("HyperScopes: "+message, ...optionalParams, err);
}


export function LoadDocumentsAndGrammer() {
	// LanguageLoader.LoadLanguages();
	Configuration.UpdateLanguagesDefinitions();
	TMRegistry.ReloadGrammar();
	DocumentLoader.reloadDocuments();
}











export function FunctionWrapper<TArgs extends any[], TReturn extends any, T extends Func<TArgs, TReturn>>(func:T) {
	return (...args: TArgs) => {
		try { return func(...args); }
		catch (err) { HyperScopeError(err, "Error caught for function: ", func, ...args); }
		return undefined;
	}
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
			const scopeName = LanguageLoader.GetLanguageScopeName(document.languageId);
			if (scopeName) return TMRegistry.Current.loadGrammar(scopeName).then(grammar =>{
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
	public readonly dispose = () =>	{
		this.subscriptions.forEach((s) => s.dispose());
		this.subscriptions.length = 0;
	}
}










//.........................................................................................................................


//TODO: implement this directly with comment parsing to reduce needless parsing
export class DocumentController extends DisposableContext {
	// private readonly SortedChangeEvent = new vscode.EventEmitter<readonly vscode.TextDocumentContentChangeEvent[]>();
	// public onSortedTextDocumentChange = this.SortedChangeEvent.event;

	public static readonly MaxLineLength = 20000;
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
		if (event.document.uri === this.document.uri && event.contentChanges.length) { //Validates changes
			//Sorts changes to apply so that line changes can just reparse the rest of the doc.
			this.applyChanges([...event.contentChanges].sort(DocumentController.ChangeSorter));
		}
	}


	private applyChanges(sortedChanges: readonly vscode.TextDocumentContentChangeEvent[]) {
		// this.SortedChangeEvent.fire(sortedChanges);
		for(let change of sortedChanges){
			const changeEndLine = change.range.end.line;
			// compare ruleStack
			const initState = this.tokensArray[changeEndLine]?.ruleStack;
			this.parseRange(change.range);
			const lastState = this.tokensArray[changeEndLine]?.ruleStack;
			// if (insert line count !== replaced content line count || ruleStack !== init ruleStack) then: parse the rest of document and return;
			if((change.range.lineCount !== change.text.lineCount) || (initState !== lastState)){
				this.parseLines(changeEndLine+1, this.document.lineCount);
				break;
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

	public getScopeAt(position : vscode.Position) : TokenInfo {
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

	
	public getRangeTokenData(lineRange : vscode.Range) : Array<StandardLineTokens> {
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
	private internalValidateLine(lineIndex : number) {
		const line : vscode.TextLine = this.document.lineAt(lineIndex);
		if (this.documentText[lineIndex] !== line.text) this.internalParseLine(line);
	}

	protected validateLine(lineIndex : number) {
		if(!this.grammar) return;
		if (0 <= lineIndex && lineIndex < this.document.lineCount) this.internalValidateLine(lineIndex);
	}

	protected validateLines(startLine:number, endLine:number) {
		if(!this.grammar) return;
		for (; (startLine <= endLine); startLine++) this.internalValidateLine(startLine);
	}
	
	protected validateRange(range: vscode.Range) {
		range = this.document.validateRange(range);
		this.validateLines(range.start.line, range.end.line);
	}

	protected validateDocument() {
		//If line counts are the same, validate each line. If different, reparse entire document.
		if (this.documentText.length === this.document.lineCount) this.validateLines(0, this.document.lineCount-1);
		else this.refresh();
	}



	//...............................................................................
	private internalParseLine(line : vscode.TextLine) {
		// Update text content
		this.documentText[line.lineNumber] = line.text;
		const TooLong = (line.text.length > DocumentController.MaxLineLength); // Don't tokenize line if too long
		this.tokensArray[line.lineNumber]  = (!TooLong)? this.grammar.tokenizeLine(line.text, this.getLineState(line.lineNumber-1)) : undefined;
		this.tokens2Array[line.lineNumber] = (!TooLong)? this.grammar.tokenizeLine2(line.text, this.getLineState2(line.lineNumber-1)) : undefined;
	}

	// * Parsing
	protected parseLine(lineIndex : number) : void {
		if(!this.grammar) return;
		if (0 <= lineIndex && lineIndex < this.document.lineCount) this.internalParseLine(this.document.lineAt(lineIndex));
	}

	protected parseLines(startLine:number, endLine:number) : void {
		if(!this.grammar) return;
		for (; (startLine <= endLine); startLine++) this.internalParseLine(this.document.lineAt(startLine));
	}

	protected parseRange(range : vscode.Range) : void {
		range = this.document.validateRange(range);
		this.parseLines(range.start.line, range.end.line);
	}

	protected parseEntireDocument() : void {
		this.parseLines(0, this.document.lineCount-1);
	}




	//...............................................................................
	// * Iterators
	protected *IterateLines(start:int, end:int) {
		if(!this.grammar) return;
		for (; (start <= end); ++start) yield this.document.lineAt(start);
	}
	protected *IterateRange(range : vscode.Range) {
		range = this.document.validateRange(range);
		return this.IterateLines(range.start.line, range.end.line);
	}
	protected *IterateDocument() {
		return this.IterateLines(0, this.document.lineCount-1);
	}


	//...............................................................................
	// * Utilities

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






































// https://github.com/microsoft/vscode/blob/9776b9d4378ad95aa7b815a3413eed003cb6024b/src/vs/workbench/services/textMate/browser/abstractTextMateService.ts#L159

