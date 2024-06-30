import * as path from "path";
import * as vscode from "vscode";
import * as fs from 'fs';
import { Console } from "../Utilities/Logging/Console";




export interface IExtensionPackage {
	contributes?: IExtensionContributes
}

export interface IExtensionContributes {
	languages?: IExtensionLanguage[];
	grammars?: IExtensionGrammar[];
}

export interface IExtensionLanguage {
	id:string;
	configuration:string;
	firstLine?: string;
}

export interface IExtensionGrammar {
	scopeName: string;
	path?: string;
	language?: string;
	injectTo?: Array<string>;
	embeddedLanguages?: { [scopeName: string]: string };
	tokenTypes?: ITokenTypeMap;
	balancedBracketSelectors?: string[];
	unbalancedBracketSelectors?: string[];
}

const Encoding = 'utf8';








/** Open ended enum at runtime */
export const enum LanguageId { Null = 0, PlainText = 1 }
export const NULL_LANGUAGE_ID = 'vs.editor.nullLanguage';
export const PLAINTEXT_LANGUAGE_ID = 'plaintext';



export class IdCodec<T> {
	private NextId: int = 0;
	public readonly IdMap = new Map<T, int>();
	public readonly IdSearch = new Array<T>();

	protected get PeekId() { return this.NextId; }

	public Encode(key : T) : int | undefined { return this.IdMap.get(key); }
	public Decode(id : int) : NonNullable<T> | undefined { return this.IdSearch[id] ?? undefined; }
	public Register(key : T): bool {
		if (this.IdMap.has(key)) return false;
		this.IdSearch[this.NextId] = key;
		this.IdMap.set(key, this.NextId++);
		return true;
	}

	public Clear(): void {
		this.IdMap.clear();
		this.IdSearch.length = 0;
		this.NextId = 0;
	}
}

//This is just a wrapper to make dealing with languages easier.
export class LanguageIdCodec extends IdCodec<string> {
	public constructor() { super(); this.Clear();}
	public Encode(key: string) { return super.Encode(key) || LanguageId.Null; }
	public Decode(id: LanguageId) { return super.Decode(id) || NULL_LANGUAGE_ID; }
	public Clear(): void {
		super.Clear();
		this.Register(NULL_LANGUAGE_ID);
		this.Register(PLAINTEXT_LANGUAGE_ID)
	}
}






/* 
This class is used to load every language and all of the information needed for them.
It will store the information until Load Languages is called again, this allows for
fast lookup of information, but takes some time to build at the begining.
*/
export class LanguageLoader {
	public static readonly scopeNameToPath = new Map<string, string>();
	public static readonly scopeNameToInjections = new Map<string, Array<string>>();
	
	public static readonly languageIdToConfigPath = new Map<string, string>();
	public static readonly languageIdToEmbedded = new Map<string, Array<string>>();
	
	public static readonly languageIdToLanguage = new Map<string, IExtensionLanguage>();
	
	public static readonly languageIdToScopeNames = new Map<string, string[]>();
	public static readonly scopeNameToLanguageId = new Map<string, string>();

	public static readonly scopeNameToGrammar = new Map<string, IExtensionGrammar>();

	public static readonly languageCodec = new LanguageIdCodec();
	// public static readonly ConfigPaths = new Array<>

	public static async LoadLanguages() {
		// Console.LogTime("EvenBetterComments: Language Definitions Update Started!");

		//? Grammars are scopeName based while Languages are id based.
		LanguageLoader.scopeNameToPath.clear();
		LanguageLoader.scopeNameToInjections.clear();
		LanguageLoader.scopeNameToGrammar.clear();

		LanguageLoader.scopeNameToLanguageId.clear();
		LanguageLoader.languageIdToScopeNames.clear();

		LanguageLoader.languageIdToConfigPath.clear();
		LanguageLoader.languageIdToEmbedded.clear();
		LanguageLoader.languageIdToLanguage.clear();


		LanguageLoader.languageCodec.Clear();
		

		//ISSUE: Vscode extensions can override how the default languages are defined, so we should prioritise the extensions which define a grammar for the language.
		for (const extension of vscode.extensions.all) {
			const contributes = (extension.packageJSON as IExtensionPackage).contributes;
			const extensionPath = extension.extensionPath;

			let definedLanguages = new Set<string>();
			if (contributes?.grammars) {
				for (const grammar of contributes.grammars) {
					
					//Handles grammar.
					LanguageLoader.scopeNameToGrammar.set(grammar.scopeName, grammar);
					if (grammar.path) LanguageLoader.scopeNameToPath.set(grammar.scopeName, path.join(extensionPath, grammar.path));
					if (grammar.injectTo) LanguageLoader.scopeNameToInjections.set(grammar.scopeName, grammar.injectTo);
					
					
					if (!grammar.language) continue; //Skip grammars which do not define a language;
					else definedLanguages.add(grammar.language);

					//Used for scopename to id mapping
					LanguageLoader.scopeNameToLanguageId.set(grammar.scopeName, grammar.language);
					if (LanguageLoader.languageIdToScopeNames.has(grammar.language)) LanguageLoader.languageIdToScopeNames.get(grammar.language)!.push(grammar.scopeName);
					else LanguageLoader.languageIdToScopeNames.set(grammar.language, [grammar.scopeName]);
				}
			}
			

			if (contributes?.languages) {
				for (const language of contributes.languages) {
					if (!definedLanguages.has(language.id)) continue; //Skip languages which the extension does not provide grammars for.

					LanguageLoader.languageIdToLanguage.set(language.id, language)
					if (language.configuration) {
						LanguageLoader.languageIdToConfigPath.set(language.id, path.join(extensionPath, language.configuration));
						LanguageLoader.languageCodec.Register(language.id);
						if (contributes.grammars) {
							for (const grammar of contributes.grammars) {
								if (grammar.language === language.id && grammar.embeddedLanguages) {
									LanguageLoader.languageIdToEmbedded.set(language.id, Object.values(grammar.embeddedLanguages));
								}
							}
						}
					}// else console.warn("Language is missing configuration: " + language.id + "\t\textention: " + extension.id);
				}
			}
		}
		Console.Log("EvenBetterComments: Language Definitions Updated!");
	}

	public static HasLanguage(languageCode: string) : boolean { return LanguageLoader.languageIdToConfigPath.has(languageCode)}

	public static ReadLanguageFileSync(languageCode: string) { return LanguageLoader.SafeReadFileSync(LanguageLoader.languageIdToConfigPath.get(languageCode)); }
	public static async ReadLanguageFileAsync(languageCode: string) { return LanguageLoader.SafeReadFileAsync(LanguageLoader.languageIdToConfigPath.get(languageCode)); }

	public static ReadGrammarFileSync(scopeName: string) { return LanguageLoader.SafeReadFileSync(LanguageLoader.scopeNameToPath.get(scopeName)); }
	public static async ReadGrammarFileAsync(scopeName: string) { return LanguageLoader.SafeReadFileAsync(LanguageLoader.scopeNameToPath.get(scopeName)); }





	public static ReadFileSync(path : string) { return fs.readFileSync(path, Encoding) }
	public static async ReadFileAsync(path : string) { return new Promise<string>((resolve, reject) => fs.readFile(path, Encoding, (error, data) => (!error)? resolve(data) : reject(error))) }

	public static SafeReadFileSync(path: string|nulldefined) { return (path)? LanguageLoader.ReadFileSync(path) : undefined }
	public static async SafeReadFileAsync(path: string|nulldefined) { return (path)? LanguageLoader.ReadFileAsync(path) : Promise.resolve(undefined) }



	public static get AllLanguageDefinitions() { return LanguageLoader.languageIdToLanguage.values(); }
	public static get AllGrammarDefinitions() { return LanguageLoader.scopeNameToGrammar.values(); }


	public static GetLanguageScopeName(languageID : string) {
		try { return LanguageLoader.languageIdToScopeNames.get(languageID)?.reduce((Prev,Cur) => (Prev.length>Cur.length) ? Cur : Prev); } 
		catch (error) { console.log("HyperScopes: Unable to get language scope name", error); }
		return undefined;
	}
}



















