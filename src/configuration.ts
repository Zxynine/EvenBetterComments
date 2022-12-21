import * as vscode from 'vscode';

import * as json5 from 'json5';
import { LanguageLoader } from './providers/LanguageProvider';
import { TextDecoder } from 'util';


// export type Target = 'global' | 'workspace';

// /**
//  * Type for {@link CommandId.ToggleSetting} command.
//  */
//  export interface ToggleSettingType {
// 	setting: string;
// 	value?: unknown[] | string;
// 	target?: Target;
// }


// The configuration necessary to find supported languages on startup
export class Configuration {
	private static readonly commentConfig = new Map<string, vscode.CommentRule | undefined>();
	private static readonly languageHasShebang = new Map<string, boolean>();





	/**
	 * Generate a map of configuration files by language as defined by extensions
	 * External extensions can override default configurations of VSCode
	 */
	public static async UpdateLanguagesDefinitions() {
		Configuration.commentConfig.clear();
		Configuration.languageHasShebang.clear();
		await LanguageLoader.LoadLanguages();
		for (const language of LanguageLoader.AllLanguageDefinitions) {
			Configuration.languageHasShebang.set(language.id, Boolean(language.firstLine));
		}
	}


	public static async GetLanguageConfiguration(languageCode:string) {
		// * if no config exists for this language, back out and leave the language unsupported
		if (!LanguageLoader.HasLanguage(languageCode)) return undefined;
		try {
			const filePath = LanguageLoader.languageToConfigPath.get(languageCode);
			if (filePath === undefined) return undefined;
            const rawContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
			// use json5, because the config can contain comments
			return json5.parse(new TextDecoder().decode(rawContent));

			// return LanguageLoader.ReadLanguageFileAsync(languageCode).then(content => (content !== undefined)? json5.parse(content) : undefined);

			// const content = LanguageLoader.ReadLanguageFileSync(languageCode);
			// return (content)? json5.parse(content) : undefined;
		} catch (error) { return undefined; }
	}








	public static GetHasShebang(languageCode: string): boolean {
		return (Configuration.languageHasShebang.get(languageCode) ?? false)
	}



	/** Gets the configuration information for the specified language */
	public static async GetCommentConfiguration(languageCode: string): Promise<vscode.CommentRule | undefined> {
		// * if the language config has already been loaded return the loaded value
		if (Configuration.commentConfig.has(languageCode)) return Configuration.commentConfig.get(languageCode);
		
		// * even if language does not have a config, we set the comment config to make future calls return undefined.
		const LanguageConfig = await Configuration.GetLanguageConfiguration(languageCode);
		const comments = LanguageConfig?.comments;
		Configuration.commentConfig.set(languageCode, comments);
		return comments;
	}




































	
	// /** Gets the configuration information for the specified language */
	// public GetEnclosingPairs(languageCode: string): Array<EnclosingPair> | undefined {
	// 	// * if no config exists for this language, back out and leave the language unsupported
	// 	if (!this.languageConfigFiles.has(languageCode)) return undefined;

	// 	// * check if the language config has already been loaded
	// 	if (this.enclosingPairs.has(languageCode)) {
	// 		return this.enclosingPairs.get(languageCode);
	// 	}

	// 	// * if the language config has already been loaded return the loaded value
	// 	if (this.commentConfig.has(languageCode)) return this.commentConfig.get(languageCode);
		
	// 	// * even if language does not have a config, we set the comment config to make future calls return above.
	// 	const LanguageConfig = this.GetLanguageConfiguration(languageCode);




	// 	try {
	// 		// Get the filepath from the map
	// 		let filePath = this.languageConfigFiles.get(languageCode) as string;
	// 		let content = fs.readFileSync(filePath, { encoding: 'utf8' });
	// 		// use json5, because the config can contain comments
	// 		let config = json5.parse(content);

	// 		let pairs : Array<[string,string]> = [];
	// 		if (config.brackets) pairs.concat(config.brackets);
	// 		if (config.surroundingPairs) pairs.concat(config.surroundingPairs);
	// 		if (config.autoClosingPairs) {
	// 			for (let closingPair of config.autoClosingPairs) {
	// 				pairs.push([closingPair.open, closingPair.close]);
	// 			}
	// 		}
			
	// 		let enclosing : Array<EnclosingPair> | undefined = undefined;

	// 		if (pairs.length > 0) {
	// 			enclosing = [];
	// 			for (let ePair of pairs) {
	// 				enclosing.push({
	// 					leftTag: ePair[0],
	// 					rightTag: ePair[1]
	// 				});
	// 			}
	// 		}
				
	// 		this.enclosingPairs.set(languageCode, enclosing);
	// 		return enclosing;
	// 	} catch (error) {
	// 		this.enclosingPairs.set(languageCode, undefined);
	// 		return undefined;
	// 	}
	// }

}







		// for (let extension of GetAllLanguageExtensions()) {
		// 	for (let language of extension.packageJSON.contributes.languages) {
		// 		this.languageHasShebang.set(language.id, (language.firstLine)? true : false);
		// 		if (language.configuration) this.languageConfigFiles.set(language.id, path.join(extension.extensionPath, language.configuration));
		// 	}
		// }