/**
 * refer to `draivin.hscopes` && `yfzhao20.hscopes-booster`
 * @license MIT
 */
import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';
import { CommentLinkLensProvider, DocumentCommentLinkProvider } from "./providers/CommentLinkProvider";
import { LoadDocumentsAndGrammer, DocumentLoader, reloadGrammar, GetGetScopeAtAPI } from "./document";
import { highlighterDecoratiuon } from './providers/DecorationProvider';


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** The id used for this command. */
export const ExtentionID = "evenbettercomments";

/** All command ids contributed by this extension. */
 export const enum CommandIds {
	ReloadDecorations = 'evenbettercomments.reloadDecorations',
	ReloadConfiguration = 'evenbettercomments.reloadConfiguration',
	ReloadDocuments = 'hscopes-booster.reloadDocuments',
	ReloadGrammar = 'hscopes-booster.reloadGrammar',
	ShowScope = 'vscode-show-scopes.show',
	ShowLineScopes = 'vscode-show-scopes.show-line',
	ShowScopeInspector = 'vscode-show-scopes.show-inspector',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * MAIN ACTIVATE FUNCTION
 * this method is called when vs code is activated
**/
export function activate(context: vscode.ExtensionContext) {
	let activeEditor: vscode.TextEditor;
	const configuration: Configuration = new Configuration();
	const parser: Parser = new Parser(configuration);

	// Called to handle events below
	const updateDecorations = () => parser.UpdateDecorations(activeEditor);

	function CheckSetActiveEditor(editor : vscode.TextEditor|undefined) {
		if (editor) SetActiveEditor(editor);
	}
	function SetActiveEditor(editor : vscode.TextEditor) {
		// Set new editor
		activeEditor = editor;
		// Set regex for updated language
		parser.SetRegex(editor.document.languageId);
		// Trigger update to set decorations for newly active file
		triggerUpdateDecorations();
	}

	//TODO: incorporate this into the document script
	function CheckUpdateDecorations(event : vscode.TextDocumentChangeEvent) {
		// Trigger updates if the text was changed in the same document
		if (activeEditor && event.document === activeEditor.document) triggerUpdateDecorations();
	}
	

	// IMPORTANT: To avoid calling update too often, set a timer for 100ms to wait before updating decorations
	var timeout: NodeJS.Timer;
	// Called to handle events above
	function triggerUpdateDecorations() {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(updateDecorations, 100);
	}

	// Get the active editor for the first time and initialise the regex
	if (vscode.window.activeTextEditor) SetActiveEditor(vscode.window.activeTextEditor);




	//............................................................................
	// * This section deals with comment decorations

	context.subscriptions.push(vscode.extensions.onDidChange(configuration.UpdateLanguagesDefinitions)); // Handle extensions being added or removed
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(CheckSetActiveEditor)); // Handle active file changed
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(CheckUpdateDecorations)); // Handle file contents changed

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadDecorations, updateDecorations));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadConfiguration, configuration.UpdateLanguagesDefinitions));


	//............................................................................
	// * This section deals with the comment links and lens
		
	// Register our CodeLens provider and push to the context so it can be disposed of later
	context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "*" }, new CommentLinkLensProvider()));
	context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ language: "*" }, new DocumentCommentLinkProvider()));

	//............................................................................

	// * This section deals with loading scopes of documents
	LoadDocumentsAndGrammer();
	/** EXPORT API */
	const api = GetGetScopeAtAPI();

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(DocumentLoader.openDocument)); //Handle documents being opened
	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(DocumentLoader.closeDocument)); //Handle documents bing closed

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadDocuments, DocumentLoader.reloadDocuments));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ReloadGrammar, reloadGrammar));
	//............................................................................
	
	// * This section deals with displaying scopes in editor
	

	const extensionOutputChannel = vscode.window.createOutputChannel('scopes', 'yaml');
	async function HyperscopesDisplayScopes() {
		console.log("HyperScopes: show command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const token = api.getScopeAt(activeTextEditor.document, activeTextEditor.selection.active);
			if (token) {
				extensionOutputChannel.show(true);
				extensionOutputChannel.appendLine(token.GetTokenDisplayInfo());

				let counter = 0;
				activeTextEditor.setDecorations(highlighterDecoratiuon, []);
				const intervalId = setInterval(() => {
					if (counter++ > 5) clearInterval(intervalId);
					activeTextEditor.setDecorations(highlighterDecoratiuon, ((counter%2)===0)? [token.range] : []);
				}, 100);
			} else console.log("HyperScopes: Token not found.");
		}
	}
	async function HyperscopesDisplayScopesLine() {
		console.log("HyperScopes: show line command run!");
		const activeTextEditor = vscode.window.activeTextEditor;
		if (activeTextEditor) {
			const tokenArray = api.getScopeLine(activeTextEditor.document, activeTextEditor.selection.active);
			if (tokenArray) {
				const highlightRange : vscode.Range[] = [];
				tokenArray.forEach(token => {
					if (token) highlightRange.push(activeEditor.document.lineAt(token.range.start).range)
				});
				if (highlightRange.length) {
					extensionOutputChannel.show(true);
					for (const token of tokenArray) if (token) extensionOutputChannel.appendLine(token.GetTokenDisplayInfo());

					let counter = 0;
					activeTextEditor.setDecorations(highlighterDecoratiuon, []);
					const intervalId = setInterval(() => {
						if (counter++ > 5) clearInterval(intervalId);
						activeTextEditor.setDecorations(highlighterDecoratiuon, ((counter%2)===0)? highlightRange : []);
					}, 100);

				}
			}
		}
	}

	const StartScopeInspector = async () => { if (vscode.window.activeTextEditor) vscode.commands.executeCommand('editor.action.inspectTMScopes'); }
	

	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowScope, HyperscopesDisplayScopes));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowLineScopes, HyperscopesDisplayScopesLine));
	context.subscriptions.push(vscode.commands.registerCommand(CommandIds.ShowScopeInspector, StartScopeInspector));
	//............................................................................
	/** EXPORT API */
	return api;
}

export function deactivate() { DocumentLoader.unloadDocuments() }




