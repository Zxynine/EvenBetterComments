import * as vscode from "vscode";
import fs = require("fs");
import path = require("path");
import { LanguageLoader } from "../providers/LanguageProvider";
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


	public static async CreateGrammar(languageId: string): Promise<IGrammar | nulldefined> {
		if (!LanguageLoader.HasLanguage(languageId)) return null;
		return this.InternalCreateGrammar(languageId, LanguageLoader.languageCodec.encodeLanguageId(languageId));

	}

	private static async InternalCreateGrammar(languageId: string, encodeLanguageId: number) {
		const scopeName = LanguageLoader.languageToScopeName.get(languageId);
		if (typeof scopeName !== 'string') throw new Error(`Missing Textmate Grammar for language: ${languageId}`);
		const grammarDefinition = LanguageLoader.scopeNameToDefinition.get(scopeName);
		if (!grammarDefinition) throw new Error(`Missing Textmate Grammar for language: ${languageId}`);

		var scopeNameToId: IEmbeddedLanguagesMap = <IEmbeddedLanguagesMap>{};
		if (grammarDefinition.embeddedLanguages) {
			for (const EmbLanSymbol of Object.keys(grammarDefinition.embeddedLanguages)) {
				scopeNameToId[EmbLanSymbol] = LanguageLoader.languageCodec.encodeLanguageId(grammarDefinition.embeddedLanguages[EmbLanSymbol]);
			}
		}

		return await TMRegistry.registry?.loadGrammarWithConfiguration(
			scopeName, 
			encodeLanguageId, 
			<IGrammarConfiguration>{
				embeddedLanguages: scopeNameToId,
				tokenTypes: grammarDefinition.tokenTypes,
				balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
				unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors
			}
		);
	}
}






























// export class LanguageConfig {
// 	public readonly grammar: IGrammar;
// 	public readonly regex: RegExp;
// 	public readonly bracketToId: Map<string, { open: boolean, key: number }>;

// 	constructor(grammar: IGrammar, regex: RegExp, bracketToId: Map<string, { open: boolean, key: number }>) {
// 		this.grammar = grammar;
// 		this.regex = regex;
// 		this.bracketToId = bracketToId;
// 	}
// }

// export const enum AstNodeKind {
// 	Text = 0,
// 	Bracket = 1,
// 	Pair = 2,
// 	UnexpectedClosingBracket = 3,
// 	List = 4,
// }




// export interface Tokenizer {
// 	readonly offset: Length.Length;
// 	readonly length: Length.Length;

// 	read(): Token | null;
// 	peek(): Token | null;
// 	skip(length: Length.Length): void;

// 	getText(): string;
// }




// let bracketParis = [
// 	["(", ")"], 
// 	["{", "}"], 
// 	["[", "]"]
// ]

// let quoteBrackets = ['"', "'", "`"]

















































































// export class TextMateLoader {
// 	private readonly languageConfigs = new Map<string, LanguageConfig>();
// 	private languageId = 1;
	
// 	constructor() {
// 		LanguageLoader.LoadLanguages();
// 	}

// 	public tryGetLanguageConfig(languageID: string) {
// 		const existingTokenizer = this.languageConfigs.get(languageID);
// 		if (existingTokenizer) return existingTokenizer;
		
// 		const scopeName = LanguageLoader.languageToScopeName.get(languageID);
// 		if (!scopeName) return;
// 		const configPath = LanguageLoader.languageToConfigPath.get(languageID);
// 		if (!configPath) return;

// 		//Reading the grammar file and returning brackets array
// 		const loadedPromise = new Promise<[string[]]>((resolve, reject) => {
// 			fs.readFile(configPath, (error, content) => {
// 				if (error) reject(error);
// 				else {
// 					const config = JSON5.parse(content.toString());
// 					const brackets = (config as any).brackets as [string[]];
// 					resolve(brackets);
// 				}
// 			});
// 		//
// 		});
		
		


// 		//Takes bracket array and creates language configs and returns grammar.
// 		return loadedPromise.then((brackets: [string[]]) => {
// 			if (!brackets) return null;
// 			const registry = TMRegistry.Current;
// 			if (!registry) return null;

// 			return registry.loadGrammarWithConfiguration(scopeName, this.languageId++, {}).then((grammar) => {
// 				if (grammar) {
// 					if (!this.languageConfigs.has(languageID)) {
// 						const mappedBrackets = brackets.map((b) => ({ open: b[0], close: b[1] }))
// 							.filter((e) => e.open !== "<" && e.close !== ">");

// 						if (mappedBrackets.length === 0) return;

// 						const bracketToId = new Map<string, { open: boolean, key: number }>();
// 						for (let i = 0; i < brackets.length; i++) {
// 							const bracket = brackets[i];
// 							bracketToId.set(bracket[0], { open: true, key: i });
// 							bracketToId.set(bracket[1], { open: false, key: i });
// 						}

// 						// let maxBracketLength = mappedBrackets.map(bracket=> Math.max(bracket.open.length, bracket.close.length)).reduce((maxLength, bracketMax)=>Math.max(maxLength, bracketMax));
// 						this.languageConfigs.set(languageID, new LanguageConfig(grammar, getRegexForBrackets(mappedBrackets), bracketToId));
// 					}
// 				}
// 				return grammar;
// 			});
// 		});
// 	}
// }

// export default TextMateLoader;