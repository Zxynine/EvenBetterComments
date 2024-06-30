import * as vscode from "vscode";
import fs = require("fs");
import path = require("path");
import { LanguageLoader } from "../providers/LanguageProvider";

import("../extensions/MapExtensions");
//https://github.com/rafamel/subtle-brackets
//https://github.com/CoenraadS/Bracket-Pair-Colorizer-2/blob/master/src/IExtensionGrammar.ts



export function getModulePath(folderName:string, moduleName:string) { return path.join(vscode.env.appRoot, folderName, moduleName); }
export function getNodeModulePath(moduleName: string) { return path.join(vscode.env.appRoot, 'node_modules.asar', moduleName); }
export function getNodeModule(moduleName: string) { return require(getNodeModulePath(moduleName)); }
/** Returns a node module installed with VSCode, or null if it fails. **/
 export function getCoreNodeModule(moduleName: string) {
	try { return require(path.join(vscode.env.appRoot, 'node_modules.asar', moduleName)); } catch (ex) { }
	try { return require(path.join(vscode.env.appRoot, 'node_modules', moduleName)); } catch (ex) { }
	return null;
}




export class TMRegistry {
	public static readonly vsctm = getNodeModule("vscode-textmate");
	public static readonly oniguruma = getNodeModule("vscode-oniguruma");
	public static readonly onigurumaPath = path.join(getNodeModulePath("vscode-oniguruma"), 'release', 'onig.wasm');
	public static readonly WASMBin = fs.readFileSync(TMRegistry.onigurumaPath).buffer;
	public static readonly vscodeOnigurumaLib: Promise<IOnigLib> = (
		TMRegistry.oniguruma.loadWASM(TMRegistry.WASMBin).then((_: any) => <IOnigLib>{
			createOnigScanner : (patterns) => new TMRegistry.oniguruma.OnigScanner(patterns),
			createOnigString : (string) => new TMRegistry.oniguruma.OnigString(string)
		})
	);

	public static get Current() { return TMRegistry.registry; }
	private static registry : IRegistry|undefined;
	public static async ReloadGrammar() {		
		try {
			TMRegistry.registry = new TMRegistry.vsctm.Registry(<RegistryOptions>{
				onigLib: TMRegistry.vscodeOnigurumaLib,
				getInjections: (scopeName: string) => LanguageLoader.scopeNameToInjections.get(scopeName),
				/** Load the grammar for `scopeName` and all referenced included grammars asynchronously. **/
				loadGrammar: async (scopeName: string) => {
					const path = LanguageLoader.scopeNameToPath.get(scopeName);
					return ((!path)? null :  LanguageLoader.ReadFileAsync(path).then((data) => TMRegistry.vsctm.parseRawGrammar(data, path)));
				}
			});
		} catch (err) {
			TMRegistry.registry = undefined;
			console.error(err);
		}
	}

	//TODO Keep grammars for reuse.
	public static async CreateGrammar(languageId: string): Promise<IGrammar | nulldefined> {
		if (!LanguageLoader.HasLanguage(languageId)) return null;

		const scopeName = LanguageLoader.GetLanguageScopeName(languageId);
		if (!scopeName) {
			console.log(`Failed to load scopeName for language: ${languageId}`);
			return;
		}
		const grammarDefinition = LanguageLoader.scopeNameToGrammar.get(scopeName);
		if (!grammarDefinition) throw new Error(`Missing Textmate Grammar for language: ${languageId}`);

		const scopeNameToId: IEmbeddedLanguagesMap = (grammarDefinition.embeddedLanguages) ? Map.MapValues(grammarDefinition.embeddedLanguages, (s) => LanguageLoader.languageCodec.Encode(s)) : {};
		if (languageId == "html") {
			console.log("Scopes: " + LanguageLoader.languageIdToScopeNames.get(languageId));
			console.log("Chosen: " + scopeName);
		}
		return TMRegistry.registry?.loadGrammarWithConfiguration(
			scopeName, 
			LanguageLoader.languageCodec.Encode(languageId), 
			<IGrammarConfiguration>{
				embeddedLanguages: scopeNameToId,
				tokenTypes: grammarDefinition.tokenTypes,
				balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
				unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors
			}
		) ?? Promise.resolve(null);
	}
}
