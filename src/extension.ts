/**
 * refer to `draivin.hscopes` && `yfzhao20.hscopes-booster`
 * @license MIT
 */
import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';
import { CommentLinkLensProvider, DocumentCommentLinkProvider } from "./providers/CommentLinkProvider";
import { LoadDocumentsAndGrammer, DocumentLoader, GetGetScopeAtAPI } from "./document";
import { TMRegistry } from './Tokenisation/TextmateLoader';
import { PulseRange } from './providers/DecorationProvider';

//https://github.com/gitkraken/vscode-gitlens/blob/main/src/context.ts
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** The id used for this command. */
export const ExtentionID = "evenbettercomments";

/** All command ids contributed by this extension. */
 export const enum CommandIds {
	ReloadDecorations = 'evenbettercomments.reloadDecorations',
	ReloadConfiguration = 'evenbettercomments.reloadConfiguration',
	ReloadDocuments = 'evenbettercomments.reloadDocuments',
	ReloadGrammar = 'evenbettercomments.reloadGrammar',
	ShowScope = 'evenbettercomments.hscopes.show-scope',
	ShowLineScopes = 'evenbettercomments.hscopes.show-line-scopes',
	ShowScopeInspector = 'evenbettercomments.hscopes.show-scope-inspector',
	ShowLineComments = 'evenbettercomments.hscopes.show-line-comments',
	RemoveAllCommentsDocument = 'evenbettercomments.hscopes.remove-all-comments-document',
	RemoveAllCommentsSelection = 'evenbettercomments.hscopes.remove-all-comments-selection',

	ShowLineTokens = 'evenbettercomments.hscopes.show-line-tokens',
}

const AllLanguages : vscode.DocumentSelector = { language: "*" };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO: Create output channel here
//https://github.com/gitkraken/vscode-gitlens/blob/main/src/terminal.ts


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * MAIN ACTIVATE FUNCTION
 * this method is called when vs code is activated
**/
export async function activate(context: vscode.ExtensionContext) {
	LoadDocumentsAndGrammer();
	let activeEditor: vscode.TextEditor;
	const parser: Parser = new Parser();

	// Called to handle events below
	const updateDecorations = () => parser.UpdateDecorations(activeEditor);

	// IMPORTANT: To avoid calling update too often, set a timer for 100ms to wait before updating decorations
	var timeout: NodeJS.Timer;
	// Called to handle events above
	function triggerUpdateDecorations() {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(updateDecorations, 100);
	}

	async function CheckSetActiveEditor(editor? : vscode.TextEditor) {
		if (editor === undefined) return;
		// Set new editor
		activeEditor = editor;
		// Set regex for updated language
		await parser.SetRegex(editor.document.languageId);
		// Trigger update to set decorations for newly active file
		triggerUpdateDecorations();
	}

	//TODO: incorporate this into the document script
	function CheckUpdateDecorations(event : vscode.TextDocumentChangeEvent) {
		// Trigger updates if the text was changed in the same document
		//TODO: Specify how much of the document changed, as to not reparse tags constantly.
		if (activeEditor && event.document === activeEditor.document) triggerUpdateDecorations();
	}
	

	// Get the active editor for the first time and initialise the regex
	await CheckSetActiveEditor(vscode.window.activeTextEditor);




	//............................................................................
	// * This section deals with comment decorations

	context.subscriptions.push(vscode.extensions.onDidChange(Configuration.UpdateLanguagesDefinitions)); // Handle extensions being added or removed
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(CheckSetActiveEditor)); // Handle active file changed
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(CheckUpdateDecorations)); // Handle file contents changed

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadDecorations, updateDecorations));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadConfiguration, Configuration.UpdateLanguagesDefinitions));


	//............................................................................
	// * This section deals with the comment links and lens
		
	// Register our CodeLens provider and push to the context so it can be disposed of later
	context.subscriptions.push(vscode.languages.registerCodeLensProvider(AllLanguages, new CommentLinkLensProvider()));
	context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(AllLanguages, new DocumentCommentLinkProvider()));

	//............................................................................

	// * This section deals with loading scopes of documents
	/** EXPORT API */
	const API = GetGetScopeAtAPI;

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(DocumentLoader.openDocument)); //Handle documents being opened
	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(DocumentLoader.closeDocument)); //Handle documents bing closed

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadDocuments, DocumentLoader.reloadDocuments));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadGrammar, TMRegistry.ReloadGrammar));
	//............................................................................
	
	// * This section deals with displaying scopes in editor
	const OutputChannel = vscode.window.createOutputChannel('HyperScopes', 'yaml');

	async function HyperscopesDisplayScopes() {
		console.log("HyperScopes: show scope command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const token = API.getScopeAt(activeTextEditor.document, activeTextEditor.selection.active);
			if (token) {
				OutputChannel.show(true);
				OutputChannel.appendLine(token.GetTokenDisplayInfo());
				PulseRange(activeTextEditor, [token.range]);
			} else console.log("HyperScopes: Token not found.");
		}
	}
	async function HyperscopesDisplayScopesLine() {
		console.log("HyperScopes: show line scopes command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const tokenArray = API.getScopeLine(activeTextEditor.document, activeTextEditor.selection.active);
			if (tokenArray) {
				const highlightRange = tokenArray.mappedFilter(token => Boolean(token), token => activeEditor.document.lineAt(token.range.start).range);
				if (highlightRange.length) {
					OutputChannel.show(true);
					for (const token of tokenArray) if (token) OutputChannel.appendLine(token.GetTokenDisplayInfo());
					PulseRange(activeTextEditor, highlightRange);
				}
			} else console.log("HyperScopes: Token Array not found.");
		}
	}

	const StartScopeInspector = async () => (vscode.window.activeTextEditor)&& vscode.commands.executeCommand('editor.action.inspectTMScopes');

	async function HyperscopesDisplayTokensLine() {
		console.log("HyperScopes: show line scopes command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const tokenArray = API.getTokenLine(activeTextEditor.document, activeTextEditor.selection.active);
			if (tokenArray) {
				const lineRange = activeEditor.document.lineAt(activeTextEditor.selection.active).range;
				OutputChannel.show(true);
				OutputChannel.appendLine(tokenArray.toString());
				PulseRange(activeTextEditor, [lineRange]);
			} else console.log("HyperScopes: Token Array not found.");
		}
		
	}

	async function HyperscopesDisplayLineComments() {
		console.log("HyperScopes: show line comments command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const Selection = activeTextEditor.selection;
			if (Selection.isEmpty) return;
			const ActiveDocument = DocumentLoader.getDocument(activeTextEditor.document.uri);
			if (!ActiveDocument) return;

			
			OutputChannel.appendLine("\n~~~~~~~~~~~~~~~~~~~~~~~~\n");
			OutputChannel.appendLine("Ranges of comments in selection (goes by char not col!): ");
			function RangeToString(range:vscode.Range){ return `[Ln: ${range.start.line}, Chars: ${range.start.character}-${range.end.character}]` }

			const CollectedRanges:vscode.Range[] = [];
			const TokensArrays = ActiveDocument.getRangeTokenData(Selection);
			let i = Selection.start.line;
			for (const TokenArray of TokensArrays) {
				const Ranges = TokenArray.FindRangesOf(StandardTokenType.Comment, i++);
				CollectedRanges.push(...Ranges);
				OutputChannel.appendLine(Ranges.map(RangeToString).join(', '));
			}
			PulseRange(activeTextEditor, CollectedRanges);

			OutputChannel.appendLine("\n~~~~~~~~~~~~~~~~~~~~~~~~\n");
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowScope, HyperscopesDisplayScopes));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowLineScopes, HyperscopesDisplayScopesLine));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowLineComments, HyperscopesDisplayLineComments));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowScopeInspector, StartScopeInspector));

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowLineTokens, HyperscopesDisplayTokensLine));
	
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.RemoveAllCommentsDocument, RemoveAllCommentsInDocument));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.RemoveAllCommentsSelection, RemoveAllCommentsInSelection));
	//............................................................................
	/** EXPORT API */
	return API;
}

export function deactivate() { DocumentLoader.unloadDocuments() }


























export function GetAllDocumentComments(ActiveEditor:vscode.TextEditor) {
	const ActiveDocument = DocumentLoader.getDocument(ActiveEditor.document.uri);
	if (!ActiveDocument) return [];

	return ActiveDocument.getDocumentTokenData().flatMap((TokenArray, index) => TokenArray.FindRangesOf(StandardTokenType.Comment, index));
}

export function GetAllSelectedComments(ActiveEditor:vscode.TextEditor) {
	const Selection = ActiveEditor.selection;
	if (Selection.isEmpty) return [];
	const ActiveDocument = DocumentLoader.getDocument(ActiveEditor.document.uri);
	if (!ActiveDocument) return [];

	const start = Selection.start.line;
	return ActiveDocument.getRangeTokenData(Selection).flatMap((TokenArray, index) => TokenArray.FindRangesOf(StandardTokenType.Comment, start + index));
}








export async function RemoveAllCommentsInDocument() {
	const ActiveEditor = vscode.window.activeTextEditor;
	if (!ActiveEditor) return;
	const CollectedRanges:vscode.Range[] = GetAllDocumentComments(ActiveEditor);
	PulseRange(ActiveEditor, CollectedRanges);
	
	const Confirmation = await vscode.window.showInformationMessage("Are you sure you want to remove all comments?", "Yes", "No");
	if (Confirmation === 'Yes') await ActiveEditor.edit(Builder => {
		for (const Range of CollectedRanges) Builder.delete(Range);
	});
}


export async function RemoveAllCommentsInSelection() {
	const ActiveEditor = vscode.window.activeTextEditor;
	if (!ActiveEditor) return;
	const CollectedRanges:vscode.Range[] = GetAllSelectedComments(ActiveEditor);
	PulseRange(ActiveEditor, CollectedRanges);

	const Confirmation = await vscode.window.showInformationMessage("Are you sure you want to remove all selected comments?", "Yes", "No");
	if (Confirmation === 'Yes') await ActiveEditor.edit(Builder => {
		for (const Range of CollectedRanges) Builder.delete(Range);
	});
}















/* 
Baseline:

Activate 3783
Profile 1.34

75516 errors




New FS system

Activate 2446

299 errors



10ms Profile 

*/