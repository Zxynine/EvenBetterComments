/**
 * refer to `draivin.hscopes` && `yfzhao20.hscopes-booster`
 * @license MIT
 */
import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { Parser } from './parser';
import { CommentLinkProvider, CommentLinkHoverProvider } from "./providers/CommentLinkProvider";
import { LoadDocumentsAndGrammer, openDocument, closeDocument, reloadGrammar, reloadDocuments, unloadDocuments, GetGetScopeAtAPI } from "./document";
import { highlighterDecoratiuon } from './providers/DecorationProvider';


/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ExtentionID = "evenbettercomments";


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * MAIN ACTIVATE FUNCTION
 * this method is called when vs code is activated
 */
export function activate(context: vscode.ExtensionContext) {
	let activeEditor: vscode.TextEditor;
	let configuration: Configuration = new Configuration();
	let parser: Parser = new Parser(configuration);

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

	context.subscriptions.push(vscode.extensions.onDidChange(configuration.UpdateLanguagesDefinitions)); // Handle extensions being added or removed
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(CheckSetActiveEditor)); // Handle active file changed
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(CheckUpdateDecorations)); // Handle file contents changed


	//............................................................................
	// * This section deals with the comment links and lens
		
	// Register our CodeLens provider and push to the context so it can be disposed of later
	context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "*" }, new CommentLinkProvider()));
	context.subscriptions.push(vscode.languages.registerHoverProvider({ language: "*" }, new CommentLinkHoverProvider()))

	//............................................................................

	// * This section deals with loading scopes of documents
	LoadDocumentsAndGrammer();
	/** EXPORT API */
	const api = GetGetScopeAtAPI();

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(openDocument));
	context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(closeDocument));
	context.subscriptions.push(vscode.commands.registerCommand('hscopes-booster.reloadDocuments', reloadDocuments));
	context.subscriptions.push(vscode.commands.registerCommand('hscopes-booster.reloadGrammar', reloadGrammar));
	//............................................................................
	
	// * This section deals with displaying scopes in editor
	

	const StartScopeInspector = async () => { if (vscode.window.activeTextEditor) vscode.commands.executeCommand('editor.action.inspectTMScopes'); }
	
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
				for (const token of tokenArray) {
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
		}
	}


	context.subscriptions.push(vscode.commands.registerCommand('vscode-show-scopes.show', HyperscopesDisplayScopes));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-show-scopes.show-line', HyperscopesDisplayScopesLine));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-show-scopes.show-inspector', StartScopeInspector));
	//............................................................................
	/** EXPORT API */
	return api;
}

export function deactivate() { unloadDocuments() }








// /**
//  * All command ids contributed by this extension.
//  */
//  export const enum CommandIds {
// 	// ──── Core ────────────────────────────────────────────────────────────
// 	Run = 'commands.run',
// 	Rerun = 'commands.rerun',
// 	SelectAndRun = 'commands.selectAndRun',
// 	NewCommand = 'commands.newCommand',
// 	NewFolder = 'commands.newFolder',
// 	DeleteCommand = 'commands.deleteCommand',
// 	SuggestCommands = 'commands.suggestCommands',
// 	RevealCommand = 'commands.revealCommand',
// 	RevealCommand2 = 'commands.revealCommand2',
// 	OpenAsQuickPick = 'commands.openAsQuickPick',
// 	SssignKeybinding = 'commands.assignKeybinding',
// 	AddToStatusBar = 'commands.addToStatusBar',
// 	NewCommandInFolder = 'commands.newCommandInFolder',
// 	RevealCommandsInSettignsGUI = 'commands.revealCommandsInSettignsGUI',
// 	EscapeCommandUriArgument = 'commands.escapeCommandUriArgument',
// 	// ──── Additional ──────────────────────────────────────────────────────
// 	ToggleSetting = 'commands.toggleSetting',
// 	IncrementSetting = 'commands.incrementSetting',
// 	ClipboardWrite = 'commands.clipboardWrite',
// 	SetEditorLanguage = 'commands.setEditorLanguage',
// 	OpenFolder = 'commands.openFolder',
// 	ShowNotification = 'commands.showNotification',
// 	ShowStatusBarNotification = 'commands.showStatusBarNotification',
// 	RunInTerminal = 'commands.runInTerminal',
// 	StartDebugging = 'commands.startDebugging',
// 	ToggleTheme = 'commands.toggleTheme',
// 	OpenExternal = 'commands.openExternal',
// 	RevealFileInOS = 'commands.revealFileInOS',
// 	Open = 'commands.open',
// }