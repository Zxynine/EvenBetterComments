import * as path from "path";
import * as vscode from "vscode";
import * as fs from 'fs';



export interface IExtensionGrammar {
	scopeName: string;
	path?: string;
	language?: string;
	injectTo?: Array<string>;
	embeddedLanguages?: { [scopeName: string]: string };
}

export interface IExtensionLanguage {
	id:string;
	configuration:string;
	firstLine?: string;
}

export interface IExtensionPackage {
	contributes?: {
		languages?: IExtensionLanguage[];
		grammars?: IExtensionGrammar[];
	};
}


// /**
//  * Utility to read a file as a promise
//  */
// export function readFile(path:string) {
//     return new Promise((resolve, reject) => fs.readFile(path, (error, data) => error ? reject(error) : resolve(data)))
// }



export class LanguageLoader {
	public static readonly scopeNameToPath = new Map<string, string>();
	public static readonly scopeNameToLanguage = new Map<string, string>();
	public static readonly scopeNameToInjections = new Map<string, Array<string>>();
	public static readonly languageToScopeName = new Map<string, string>();
	public static readonly languageToConfigPath = new Map<string, string>();

	public static readonly languageToDefinition = new Map<string, IExtensionLanguage>();
	public static readonly scopeNameToDefinition = new Map<string, IExtensionGrammar>();

	public static LoadLanguages() {
		console.log("EvenBetterComments: Language Definitions Updated!");
		LanguageLoader.scopeNameToPath.clear();
		LanguageLoader.scopeNameToLanguage.clear();
		LanguageLoader.scopeNameToInjections.clear();
		LanguageLoader.languageToScopeName.clear();
		LanguageLoader.languageToConfigPath.clear();

		LanguageLoader.languageToDefinition.clear();
		LanguageLoader.scopeNameToDefinition.clear();

		for (const extension of vscode.extensions.all) {
			const contributes = (extension.packageJSON as IExtensionPackage).contributes;
			if (contributes?.languages) {
				const extensionPath = extension.extensionPath;

				for (const language of contributes.languages) {
					LanguageLoader.languageToDefinition.set(language.id, language)
					if (language.configuration) LanguageLoader.languageToConfigPath.set(language.id, path.join(extensionPath, language.configuration));
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
	}

	public static HasLanguage(languageCode: string) : boolean { return LanguageLoader.languageToConfigPath.has(languageCode)}

	// Get the filepath from the map
	public static ReadLanguageFileSync(languageCode: string) : string|undefined {
		const filePath = LanguageLoader.languageToConfigPath.get(languageCode);
		return (filePath)? fs.readFileSync(filePath, { encoding: 'utf8' }) : undefined;
	}
	// Get the filepath from the map
	public static async ReadLanguageFileAsync(languageCode: string) : Promise<string|undefined> {
		const filePath = LanguageLoader.languageToConfigPath.get(languageCode);
		return new Promise<string|undefined>((resolve, reject) => {
			if (!filePath) resolve(undefined);
			else fs.readFile(filePath, 'utf-8', (error, content) => (error)? resolve(content) : reject(error));
		});
	}

	public static ReadGrammarFileSync(scopeName: string) : string|undefined {
		const grammarPath = LanguageLoader.scopeNameToPath.get(scopeName);
		return (grammarPath)? fs.readFileSync(grammarPath, { encoding: 'utf8' }) : undefined;
	}

	public static async ReadGrammarFileAsync(scopeName: string) : Promise<string|undefined> {
		const grammarPath = LanguageLoader.scopeNameToPath.get(scopeName);
		return new Promise<string|undefined>((resolve, reject) => {
			if (!grammarPath) resolve(undefined);
			else fs.readFile(grammarPath, 'utf-8', (error, content) => (error)? resolve(content) : reject(error));
		});
	}


	public static async ReadFileAsync(path : string) {
		return new Promise<string>((resolve, reject) => fs.readFile(path, 'utf-8', (error, data) => error ? reject(error) : resolve(data)))
	}


	public static get AllLanguageDefinitions() { return LanguageLoader.languageToDefinition.values(); }
	public static get AllGrammarDefinitions() { return LanguageLoader.scopeNameToDefinition.values(); }
}




