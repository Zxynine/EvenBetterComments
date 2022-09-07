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


















export async function TryGetGrammar(scopeName : string) : Promise<IGrammar|undefined> {
	try { if(TMRegistry.Current) return await TMRegistry.Current.loadGrammar(scopeName) ?? undefined; } 
	catch(err) { HyperScopeError(err, "Unable to get grammar for scope: ", scopeName, "\n"); }
	return undefined;
}



export const GetGetScopeAtAPI = { 
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
	private tokensArray : Array<ITokenizeLineResult2 | undefined> = [];
	private documentText : Array<string> = [];
	private contentChangesArray : Array<vscode.TextDocumentContentChangeEvent> = []; // Stores text-change

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
		this.contentChangesArray = [];
		this.parseEntireDocument();
	}


	//...............................................................................

	public getLineTokenData(linePosition : vscode.Position) : StandardLineTokens|undefined {
		if (!this.grammar) return;
		linePosition = this.document.validatePosition(linePosition);
		
		this.validateLine(linePosition.line);
		this.contentChangesArray.length = 0; //clears changes

		const tok2arr = this.tokensArray[linePosition.line];
		return (tok2arr)? new StandardLineTokens(tok2arr.tokens, this.document.lineAt(linePosition).text) : undefined;
	}

	public getLinesTokenData(lineRange : vscode.Range) : Array<StandardLineTokens> {
		if (!this.grammar) return [];
		lineRange = this.document.validateRange(lineRange);
		
		this.validateLines(lineRange.start.line, lineRange.end.line);
		this.contentChangesArray.length = 0; //clears changes

		const lineCount = lineRange.end.line - lineRange.start.line;
		const returnTokens : StandardLineTokens[] = new Array(lineCount+1); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex <= lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineRange.start.line + lineIndex];
			if (lineTokensArray) returnTokens[lineIndex] = new StandardLineTokens(lineTokensArray.tokens, this.document.lineAt(lineRange.start.line + lineIndex).text);
		}
		return returnTokens;
	}

	public getDocumentTokenData() : Array<StandardLineTokens> {
		if (!this.grammar) return [];
		
		this.validateDocument();
		this.contentChangesArray.length = 0; //clears changes

		const lineCount = this.document.lineCount;
		const returnTokens : StandardLineTokens[] = new Array(lineCount); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex < lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineIndex];
			if (lineTokensArray) returnTokens[lineIndex] = new StandardLineTokens(lineTokensArray.tokens, this.document.lineAt(lineIndex).text);
		}
		return returnTokens;
	}

	//...............................................................................
	// * Validation
	// TODO: FIXME: if some other extensions call this API by changing text without triggering `onDidChangeTextDocument` event in this extension, it may cause an error.

	private validateLine(lineIndex : number) {
		if(this.documentText[lineIndex] !== this.document.lineAt(lineIndex).text){
			this.parseLine(this.document.lineAt(lineIndex));
		}
	}

	private validateLines(startLine:number, endLine:number) {
		for (let lineIndex = startLine; (lineIndex <= endLine); lineIndex++){
			this.validateLine(lineIndex);
		}
	}

	private validateDocument() {
		//If line counts are the same, validate each line. If different, reparse entire document.
		if (this.documentText.length === this.document.lineCount) {
			for (let lineIndex = 0; (lineIndex < this.document.lineCount); lineIndex++){
				this.validateLine(lineIndex);
			}
		} else this.refresh();
	}

	//...............................................................................
	// * Parsing
	private parseLine(line : vscode.TextLine) {
		if(!this.grammar) return;
		// Update text content
		this.documentText[line.lineNumber] = line.text;
		const TooLong = ((line.text.length > 20000)); // Don't tokenize line if too long
		this.tokensArray[line.lineNumber] = (!TooLong)? this.grammar.tokenizeLine2(line.text, this.getLineState(line.lineNumber-1)) : undefined;
	}

	private parseLines(startLine:number, endLine:number){
		for (let lineIndex = startLine; (lineIndex <= endLine); lineIndex++){
			this.parseLine(this.document.lineAt(lineIndex));
		}
	}

	private parseRange(range : vscode.Range){
		range = this.document.validateRange(range);
		this.parseLines(range.start.line, range.end.line);
	}

	private parseEntireDocument() : void {
		this.parseLines(0, this.document.lineCount-1);
	}

	//...............................................................................
	
	private getLineState(lineIndex:number) { return (lineIndex >= 0)? this.tokensArray[lineIndex]?.ruleStack : undefined; }
}



//.........................................................................................................................












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














