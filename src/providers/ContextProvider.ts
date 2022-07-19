
import { ExtensionContext, workspace, commands, DocumentSymbol, TextDocument, TextEditor, Selection, Range, window, TextEditorRevealType } from "vscode";
import { ExtentionID } from "../extension";

export class ExtensionService {
	private static instance: ExtensionService;
	
	private constructor(private context: ExtensionContext) {}

	/**
	 * Creates the singleton instance for the extension
	 * @param context 
	 */
	public static getInstance(context?: ExtensionContext): ExtensionService {
		if (!ExtensionService.instance && context) ExtensionService.instance = new ExtensionService(context);
		return ExtensionService.instance;
	}

	/**
	 * Get state
	 * @param propKey 
	 * @param type 
	 * @returns 
	 */
	public async getState<T>(propKey: string, type: "workspace"|"global" = "global"): Promise<T | undefined> {
		return (type === "global")? await this.context.globalState.get(propKey) : await this.context.workspaceState.get(propKey);
	}

	/**
	 * Store value in the state
	 * @param propKey 
	 * @param propValue 
	 * @param type 
	 */
	public async setState<T>(propKey: string, propValue: T, type: "workspace"|"global" = "global"): Promise<void> {
		if (type === "global") await this.context.globalState.update(propKey, propValue);
		else await this.context.workspaceState.update(propKey, propValue);
	}

	/**
	 * Get a config setting
	 * @param key 
	 * @returns 
	 */
	public getSetting<T>(key: string): T | undefined {
		const extConfig = workspace.getConfiguration(ExtentionID);
		return extConfig.get<T>(key);
	}
}


export const GetSymbols = (document : TextDocument) => commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);

/**
 * Reveal symbol in editor.
 *
 * - Briefly highlight the entire line
 * - Move cursor to the symbol position
 */
 export async function goToSymbol(editor: TextEditor | undefined, symbolName: string) {
	if (!editor) {
		window.showErrorMessage('No TextEditor provided.');
		return;
	}
	const symbols = await GetSymbols(editor.document);

	let foundSymbol: DocumentSymbol | undefined;
	findSymbol(symbols, (symbol)=> symbol.name === symbolName);

	if (foundSymbol) {
		editor.selection = new Selection(foundSymbol.range.start, foundSymbol.range.start);
		editor.revealRange(foundSymbol.range, TextEditorRevealType.AtTop);
		// Highlight for a short time revealed range
		const range = new Range(foundSymbol.range.start.line, 0, foundSymbol.range.start.line, 0);
		const lineHighlightDecorationType = window.createTextEditorDecorationType({
			backgroundColor: '#ffb12938',
			isWholeLine: true,
		});
		editor.setDecorations(lineHighlightDecorationType, [range]);
		setTimeout(() => editor.setDecorations(lineHighlightDecorationType, []), 700);
	}
}


/** Recursively walk through document symbols. */
export function forEachSymbol(symbols: DocumentSymbol[], forEach: (symbol: DocumentSymbol)=> void) {
	for (let symbol=symbols.pop(); symbol !== undefined; symbol=symbols.pop()) {
		forEach(symbol);
		symbols.concat(symbol.children);
	}
}

export function findSymbol(symbols: DocumentSymbol[], find: (symbol:DocumentSymbol)=> boolean) {
	for (let symbol=symbols.pop(); symbol !== undefined; symbol=symbols.pop()) {
		if (find(symbol)) return symbol;
		symbols.concat(symbol.children);
	}
	return undefined;
}


/**
 * Return all registered vscode commands (excluding internal).
 */
export async function getAllVscodeCommands() {
	return await commands.getCommands(true);
}