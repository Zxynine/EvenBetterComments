import * as vscode from 'vscode';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from "vscode-oniguruma";
import { readFileSync, promises } from "fs";
import { join as pathJoin } from "path";
import "./extensions/ArrayExtensions";
import { ExtentionProvider } from './providers/ExtentionProvider';
import { TextDocumentContentChangeEvent as ChangeEvent } from 'vscode';


function HyperScopeError(err : any, message : string, ...optionalParams : any[]) {
	console.error("HyperScopes: "+message, ...optionalParams, err);
}


export function LoadDocumentsAndGrammer() {
	reloadGrammar();
	reloadDocuments();
}



const wasmBin = readFileSync(pathJoin(__dirname, '../node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
const vscodeOnigurumaLib : Promise<vsctm.IOnigLib> = oniguruma.loadWASM(wasmBin).then(
	() => <vsctm.IOnigLib>{
		createOnigScanner : (patterns) => new oniguruma.OnigScanner(patterns),
		createOnigString : (str) => new oniguruma.OnigString(str)
	}
);

export let registry : vsctm.Registry|undefined;
export function reloadGrammar() {
	try {
		registry = new vsctm.Registry(<vsctm.RegistryOptions>{
			onigLib: vscodeOnigurumaLib,

			getInjections: (scopeName) => {
				return (ExtentionProvider.AllExtentionGrammarsFlat.filter((g) => g.scopeName && g.injectTo?.some((s) => (s === scopeName))).map((g) => g.scopeName!));
			},

			loadGrammar: async (scopeName) => {
				try {
					const matchingGrammars = ExtentionProvider.AllExtentionPathGrammarsFlat.filter((g) => (g.scopeName === scopeName) && g.path);
					if (matchingGrammars.length > 0) {
						const filePath = pathJoin(matchingGrammars[0].extensionPath, matchingGrammars[0].path!);
						let content = await promises.readFile(filePath, 'utf-8');
						return vsctm.parseRawGrammar(content, filePath);
					}
				} catch (err) { HyperScopeError(err, `Unable to load grammar for scope: '${scopeName}'.`);  }
				return undefined;
			},
		});
	} catch (err) {
		registry = undefined;
		console.error(err);
	}
}


//TODO add objectpooling.
//Stores all of the documents being tokenized.
let documentsMap : Map<vscode.Uri, DocumentController> = new Map();
export function getDocument(uri:vscode.Uri) {
	return documentsMap.get(uri);
}
export function GetDocumentScopeAt(document:vscode.TextDocument, position:vscode.Position) {
	return documentsMap.get(document.uri)?.getScopeAt(position);
}

export function getLanguageScopeName(languageId : string): string|undefined {
	try {
		const matchingLanguages = ExtentionProvider.AllExtentionGrammarsReduced.filter((g) => g.language === languageId);
		if (matchingLanguages.length > 0) return matchingLanguages[0].scopeName; // console.info(`Mapping language ${languageId} to initial scope ${matchingLanguages[0].scopeName}`);
	} catch (err) { HyperScopeError(err, "HyperScopes: Unable to get scope name for language: ", languageId, "\n"); }
	return undefined;
}

export function TryGetDocumentScopeAt(document:vscode.TextDocument, position:vscode.Position) : TokenInfo|undefined {
	try { return documentsMap.get(document.uri)?.getScopeAt(position); } 
	catch (err) { HyperScopeError(err, "Unable to get Scope at position: ", position, "\n"); }
	return undefined;
}
export function TryGetDocumentScopeLine(document:vscode.TextDocument, position:vscode.Position) : TokenInfo[]|undefined {
	try { return documentsMap.get(document.uri)?.getLineScopes(position); } 
	catch (err) { HyperScopeError(err, "Unable to get Scope at position: ", position, "\n"); }
	return undefined;
}

export async function TryGetGrammar(scopeName : string) : Promise<vsctm.IGrammar|undefined> {
	try { if(registry) return await registry.loadGrammar(scopeName) ?? undefined; } 
	catch(err) { HyperScopeError(err, "Unable to get grammar for scope: ", scopeName, "\n"); }
	return undefined;
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
			} else console.log("HyperScopes: Could not find scope with name: " + document.languageId); //plainText passes through here
		}
	} catch (err) { HyperScopeError(err, "Unable to load document controller"); }
}

export function reloadDocuments(){
	unloadDocuments();
	vscode.workspace.textDocuments.forEach((doc) => openDocument(doc));
	console.log("HyperScopes: Reloaded all documents.");
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
		getScopeAt: TryGetDocumentScopeAt, 
		getScopeLine: TryGetDocumentScopeLine,
		getScopeForLanguage: getLanguageScopeName, 
		getGrammar: TryGetGrammar 
	};
}








//.........................................................................................................................


//TODO: implement this directly with comment parsing to reduce needles parsing



export class DocumentController implements vscode.Disposable {
	private readonly subscriptions: vscode.Disposable[] = [];
	public readonly dispose = () =>	this.subscriptions.forEach((s) => s.dispose());

	// Stores the state for each line
	private readonly grammar: vsctm.IGrammar;
	private readonly document: vscode.TextDocument;
	private tokensArray : Array<vsctm.ITokenizeLineResult | undefined> = [];
	private documentText : Array<string> = [];
	private contentChangesArray : Array<vscode.TextDocumentContentChangeEvent> = []; // Stores text-change

	//Tools
	private static readonly ChangeSorter = (ChangeL:ChangeEvent, ChangeR:ChangeEvent) => ChangeL.range.start.isAfter(ChangeR.range.start) ? 1 : -1;
	private static readonly GetTextLinecount = (text : string) => text.match(/[\r\n]+/g)?.length ?? 0;
	private static readonly GetRangeLinecount = (range : vscode.Range) => (range.end.line - range.start.line);
	private getLineState(lineIndex:number) {
		return (lineIndex >= 0)? this.tokensArray[lineIndex]?.ruleStack ?? null : null;
	}

	public constructor(doc: vscode.TextDocument, textMateGrammar: vsctm.IGrammar) {
		this.grammar = textMateGrammar;
		this.document = doc;
		this.parseEntireDocument();
		/* Store content changes. Will be clear when calling `getScopeAt()`. */
		this.subscriptions.push(vscode.workspace.onDidChangeTextDocument(this.onTextDocumentChange));
	}

	private onTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
		if (event.document == this.document && event.contentChanges.length) {
			const changes = [...event.contentChanges].sort(DocumentController.ChangeSorter);
			this.contentChangesArray = changes;
			this.applyChanges(changes);
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
			if((DocumentController.GetRangeLinecount(change.range) !== DocumentController.GetTextLinecount(change.text)) || (initState !== lastState)){
				this.parseRange(new vscode.Range(changeEndLine+1, 0 , this.document.lineCount, 0));
				return;
			}
		}
	}

	
	public refresh() {
		this.tokensArray = [];
		this.contentChangesArray = [];
		this.parseEntireDocument();
	}

	//...............................................................................
	// * Getting Scopes/API

	public getScopeAt(position : vscode.Position) : TokenInfo{
		if (!this.grammar) return TokenInfo.Default(position);
		// let a = process.hrtime()[1] //? TEST SPEED
		position = this.document.validatePosition(position);
		
		this.validateLine(position.line);
		this.contentChangesArray.length = 0; //clears changes

		const token = this.tokensArray[position.line]?.tokens.last(token=> token.startIndex <= position.character);
		return (token)? TokenInfo.Create(this.document, position.line, token) : TokenInfo.Default(position);
	}


	public getLineScopes(linePosition : vscode.Position) : Array<TokenInfo> {
		if (!this.grammar) return [];
		linePosition = this.document.validatePosition(linePosition);
		
		this.validateLine(linePosition.line);
		this.contentChangesArray.length = 0; //clears changes

		const lineTokens = this.tokensArray[linePosition.line];
		return (lineTokens)? TokenInfo.CreateLineArray(this.document, linePosition.line, lineTokens) : [];
	}

	public getScopesForLines(lineRange : vscode.Range) : Array<Array<TokenInfo>> {
		if (!this.grammar) return [];
		lineRange = this.document.validateRange(lineRange);

		this.validateLines(lineRange.start.line, lineRange.end.line);
		this.contentChangesArray.length = 0; //clears changes

		const lineCount = lineRange.end.line - lineRange.start.line;
		const returnTokens : TokenInfo[][] = new Array(lineCount+1); //same line is 0 so array length of 1
		for (let lineIndex = 0; (lineIndex <= lineCount); lineIndex++){
			const lineTokensArray = this.tokensArray[lineIndex];
			returnTokens[lineIndex] = (lineTokensArray)? TokenInfo.CreateLineArray(this.document, lineIndex, lineTokensArray) : [];
		}

		return returnTokens;
	}


	public getAllScopes() : Array<Array<TokenInfo>> {
		if (!this.grammar) return [];
		
		this.validateDocument();
		this.contentChangesArray.length = 0; //clears changes
		//We should now have an up to date varsion of all tokens.

		const returnTokens : TokenInfo[][] = new Array(this.document.lineCount);
		for (let lineIndex = 0; (lineIndex < returnTokens.length); lineIndex++){
			const lineTokensArray = this.tokensArray[lineIndex];
			returnTokens[lineIndex] = (lineTokensArray)? TokenInfo.CreateLineArray(this.document, lineIndex, lineTokensArray) : [];
		}

		return returnTokens;
	}




	//...............................................................................
	// * Validation
	//TODO: add return bool for changes maybe?
	private validateLine(lineIndex : number) {
		// TODO: FIXME: if some other extensions call this API by changing text without triggering `onDidChangeTextDocument` event in this extension, it may cause an error.
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
		this.tokensArray[line.lineNumber] = ((line.text.length > 20000)
			? undefined // Don't tokenize line if too long
			: this.grammar.tokenizeLine(line.text, this.getLineState(line.lineNumber-1))
		);
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
		this.parseLines(0, this.document.lineCount);
	}


}



//.........................................................................................................................






export const TokenTools = {
	//Find first token whose end index comes after/on range start. This is the first token in array
	//Find last token whose start index comes before/on range end. This is the last token in array.
	SelectRange: (lineTokens:vsctm.ITokenizeLineResult, startCharacter:number, endCharacter:number) => {
		if (startCharacter > endCharacter) return lineTokens.tokens; //Not a valid range
		const StartIndex = lineTokens.tokens.firstIndex((Token)=> Token.endIndex >= startCharacter);
		const EndIndex = lineTokens.tokens.lastIndex((Token)=> Token.startIndex <= endCharacter);
		if (StartIndex === -1 || EndIndex === -1) return []; //No valid tokens
		return lineTokens.tokens.slice(StartIndex, EndIndex);
	},
	FindToken: (lineTokens:vsctm.ITokenizeLineResult, position:vscode.Position) => lineTokens.tokens.first(
		(token)=> token.startIndex <= position.character && position.character <= token.endIndex
	),

	CreateRangeFor: (token:vsctm.IToken, lineNumber:number) => new vscode.Range(lineNumber, token.startIndex, lineNumber, token.endIndex),
	SelectTokenText: (token:vsctm.IToken, text:string) => text.substring(token.startIndex, token.endIndex),
}







//.........................................................................................................................






/** for getScopeAt */
export class TokenInfo {
	range:vscode.Range;
	text:string;
	scopes:Array<string>;

	get lineNumber():number { return this.range.start.line; } //Should only exist on single line
	//...............................................................................

	constructor(range:vscode.Range, text:string, scopes:Array<string>) {
		this.range = range;
		this.text = text;
		this.scopes = scopes;
	}
	

	public static Create(document:vscode.TextDocument, lineIndex:number, token:vsctm.IToken) : TokenInfo {
		return new TokenInfo(
			new vscode.Range(lineIndex, token.startIndex, lineIndex, token.endIndex),
			document.lineAt(lineIndex).text.substring(token.startIndex, token.endIndex),
			token.scopes,
		);
	}

	public static CreateLineArray(document:vscode.TextDocument, lineIndex:number, lineTokens:vsctm.ITokenizeLineResult) : Array<TokenInfo> {
		const lineText = document.lineAt(lineIndex).text;
		return lineTokens.tokens.map((token) => new TokenInfo(
			new vscode.Range(lineIndex, token.startIndex, lineIndex, token.endIndex),
			lineText.substring(token.startIndex, token.endIndex),
			token.scopes,
		));
	}

	public static Default(position:vscode.Position) : TokenInfo {
		return new TokenInfo(new vscode.Range(position,position),"",[]);
	}
	//...............................................................................

	public GetTokenDisplayInfo() : string {
		const tokenLength = this.text.length;
		const tokenText = (tokenLength < 120)? `'${this.text.replace("'","''")}'` : `'${this.text.substring(0, 116).replace("'","''")}...'`; //double single quote escapes it to be displayed
		const tokenScopes = this.scopes.sort().join('\n  - '); //Why sort them? surely the order matters...
		const baseScope = this.scopes[0].split('.')[0];

		return `\n---\nText: ${tokenText}\nLength: ${tokenLength}\nScopes:\n  - ${tokenScopes}\nBase Scope: ${baseScope}`;

	}

	public IsComment() : boolean {
		return (this.scopes[0].startsWith('comment') || ((this.scopes.length > 1) && this.scopes[1].startsWith('comment')));
	}
}









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