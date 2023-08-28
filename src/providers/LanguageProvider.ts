import * as path from "path";
import * as vscode from "vscode";
import * as fs from 'fs';
import { Console } from "../Utilities/Debug";


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

export interface IExtensionLanguage {
	id:string;
	configuration:string;
	firstLine?: string;
}

export interface IExtensionPackage {
	contributes?: IExtensionContributes
}

export interface IExtensionContributes {
	languages?: IExtensionLanguage[];
	grammars?: IExtensionGrammar[];
}



const Encoding = 'utf8';








/**
 * Open ended enum at runtime
 */
export const enum LanguageId {
	Null = 0,
	PlainText = 1
}
export const NULL_LANGUAGE_ID = 'vs.editor.nullLanguage';
export const PLAINTEXT_LANGUAGE_ID = 'plaintext';

export interface ILanguageIdCodec {
	encodeLanguageId(languageId: string): LanguageId;
	decodeLanguageId(languageId: LanguageId): string;
}




export class LanguageIdCodec implements ILanguageIdCodec {
	private nextLanguageId: number;
	private readonly _languageIdToLanguage: string[] = [];
	private readonly _languageToLanguageId = new Map<string, number>();

	constructor() {
		this.InternalRegister(NULL_LANGUAGE_ID, LanguageId.Null);
		this.InternalRegister(PLAINTEXT_LANGUAGE_ID, LanguageId.PlainText);
		this.nextLanguageId = 2;
	}

	private InternalRegister(language: string, languageId: LanguageId): void {
		this._languageIdToLanguage[languageId] = language;
		this._languageToLanguageId.set(language, languageId);
	}

	public Register(language:string): void {
		if (this._languageToLanguageId.has(language)) return;
		const languageId = this.nextLanguageId++;
		this.InternalRegister(language,languageId);
	}

	public encodeLanguageId(languageId: string): LanguageId {
		return this._languageToLanguageId.get(languageId) || LanguageId.Null;
	}

	public decodeLanguageId(languageId: LanguageId): string {
		return this._languageIdToLanguage[languageId] || NULL_LANGUAGE_ID;
	}

	public Clear(): void {
		this._languageIdToLanguage.length = 0;
		this._languageToLanguageId.clear();

		this.InternalRegister(NULL_LANGUAGE_ID, LanguageId.Null);
		this.InternalRegister(PLAINTEXT_LANGUAGE_ID, LanguageId.PlainText);
		this.nextLanguageId = 2;
	}
}






/* 
This class is used to load every language and all of the information needed for them.
It will store the information until Load Languages is called again, this allows for
fast lookup of information, but takes some time to build at the begining.
*/
export class LanguageLoader {
	public static readonly scopeNameToPath = new Map<string, string>();
	public static readonly scopeNameToLanguage = new Map<string, string>();
	public static readonly scopeNameToInjections = new Map<string, Array<string>>();
	public static readonly languageToScopeName = new Map<string, string>();
	public static readonly languageToConfigPath = new Map<string, string>();
	public static readonly languageToEmbedded = new Map<string, Array<string>>();

	public static readonly languageToDefinition = new Map<string, IExtensionLanguage>();
	public static readonly scopeNameToDefinition = new Map<string, IExtensionGrammar>();

	public static readonly languageCodec = new LanguageIdCodec();

	public static async LoadLanguages() {
		// Console.LogTime("EvenBetterComments: Language Definitions Update Started!");
		LanguageLoader.scopeNameToPath.clear();
		LanguageLoader.scopeNameToLanguage.clear();
		LanguageLoader.scopeNameToInjections.clear();
		LanguageLoader.languageToScopeName.clear();
		LanguageLoader.languageToConfigPath.clear();
		LanguageLoader.languageToEmbedded.clear();

		LanguageLoader.languageToDefinition.clear();
		LanguageLoader.scopeNameToDefinition.clear();

		LanguageLoader.languageCodec.Clear();

		for (const extension of vscode.extensions.all) {
			const contributes = (extension.packageJSON as IExtensionPackage).contributes;
			if (contributes?.languages) {
				const extensionPath = extension.extensionPath;

				for (const language of contributes.languages) {
					LanguageLoader.languageToDefinition.set(language.id, language)
					if (language.configuration) {
						LanguageLoader.languageToConfigPath.set(language.id, path.join(extensionPath, language.configuration));
						LanguageLoader.languageCodec.Register(language.id);
						if (contributes.grammars) {
							for (const grammar of contributes.grammars) {
								if (grammar.language === language.id && grammar.embeddedLanguages) {
									LanguageLoader.languageToEmbedded.set(language.id, Object.values(grammar.embeddedLanguages));
								}
							}
						}
					}
				}

				if (contributes.grammars) {
					for (const grammar of contributes.grammars) {
						LanguageLoader.scopeNameToDefinition.set(grammar.scopeName, grammar);

						if (grammar.language && grammar.path) {
							LanguageLoader.scopeNameToPath.set(grammar.scopeName, path.join(extensionPath, grammar.path));
							LanguageLoader.scopeNameToLanguage.set(grammar.scopeName, grammar.language);
							LanguageLoader.languageToScopeName.set(grammar.language, grammar.scopeName);
						}
						if (grammar.injectTo) {
							LanguageLoader.scopeNameToInjections.set(grammar.scopeName, grammar.injectTo);
						}
					}
				}

			}
		}
		Console.LogTime("EvenBetterComments: Language Definitions Updated!");
	}

	public static HasLanguage(languageCode: string) : boolean { return LanguageLoader.languageToConfigPath.has(languageCode)}

	public static ReadLanguageFileSync(languageCode: string) { return LanguageLoader.SafeReadFileSync(LanguageLoader.languageToConfigPath.get(languageCode)); }
	public static async ReadLanguageFileAsync(languageCode: string) { return LanguageLoader.SafeReadFileAsync(LanguageLoader.languageToConfigPath.get(languageCode)); }

	public static ReadGrammarFileSync(scopeName: string) { return LanguageLoader.SafeReadFileSync(LanguageLoader.scopeNameToPath.get(scopeName)); }
	public static async ReadGrammarFileAsync(scopeName: string) { return LanguageLoader.SafeReadFileAsync(LanguageLoader.scopeNameToPath.get(scopeName)); }





	public static ReadFileSync(path : string) { return fs.readFileSync(path, Encoding) }
	public static async ReadFileAsync(path : string) { return new Promise<string>((resolve, reject) => fs.readFile(path, Encoding, (error, data) => (!error)? resolve(data) : reject(error))) }

	public static SafeReadFileSync(path: string|nulldefined) { return (path)? LanguageLoader.ReadFileSync(path) : undefined }
	public static async SafeReadFileAsync(path: string|nulldefined) { return (path)? LanguageLoader.ReadFileAsync(path) : Promise.resolve(undefined) }



	public static get AllLanguageDefinitions() { return LanguageLoader.languageToDefinition.values(); }
	public static get AllGrammarDefinitions() { return LanguageLoader.scopeNameToDefinition.values(); }


	public static GetLanguageScopeName(languageID : string) {
		try { return LanguageLoader.languageToScopeName.get(languageID); } 
		catch (error) { console.log("HyperScopes: Unable to get language scope name", error); }
		return undefined;
	}
}

























