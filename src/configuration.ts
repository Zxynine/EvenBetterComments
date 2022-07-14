import * as path from 'path';
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as json5 from 'json5';

export class Configuration {
	private readonly commentConfig = new Map<string, CommentConfig | undefined>();
	// private readonly enclosingPairs = new Map<string, Array<EnclosingPair> | undefined>();
	private readonly languageConfigFiles = new Map<string, string>();
	private readonly languageHasShebang = new Map<string, boolean>();

	/**  Creates a new instance of the Parser class */
	public constructor() {
		this.UpdateLanguagesDefinitions();
	}

	/**
	 * Generate a map of configuration files by language as defined by extensions
	 * External extensions can override default configurations of VSCode
	 */
	public UpdateLanguagesDefinitions() {
		this.commentConfig.clear();

		for (let extension of vscode.extensions.all) {
			let packageJSON = extension.packageJSON;
			if (packageJSON.contributes && packageJSON.contributes.languages) {
				for (let language of packageJSON.contributes.languages) {
					this.languageHasShebang.set(language.id, (language.firstLine)? true : false);
					if (language.configuration) this.languageConfigFiles.set(language.id, path.join(extension.extensionPath, language.configuration));
				}
			}
		}
	}

	public GetHasShebang(languageCode: string): boolean {
		if (this.languageHasShebang.has(languageCode)) {
			return (this.languageHasShebang.get(languageCode))? true : false;
		} else return false;
	}

	/** Gets the configuration information for the specified language */
	public GetCommentConfiguration(languageCode: string): CommentConfig | undefined {
		// * if no config exists for this language, back out and leave the language unsupported
		if (!this.languageConfigFiles.has(languageCode)) return undefined;

		// * check if the language config has already been loaded
		if (this.commentConfig.has(languageCode)) {
			return this.commentConfig.get(languageCode);
		}


		try {
			// Get the filepath from the map
			let filePath = this.languageConfigFiles.get(languageCode) as string;
			let content = fs.readFileSync(filePath, { encoding: 'utf8' });
			// use json5, because the config can contain comments
			let config = json5.parse(content);
			
			this.commentConfig.set(languageCode, config.comments);
			return config.comments;
		} catch (error) {
			this.commentConfig.set(languageCode, undefined);
			return undefined;
		}
	}


	// /** Gets the configuration information for the specified language */
	// public GetEnclosingPairs(languageCode: string): Array<EnclosingPair> | undefined {
	// 	// * if no config exists for this language, back out and leave the language unsupported
	// 	if (!this.languageConfigFiles.has(languageCode)) return undefined;

	// 	// * check if the language config has already been loaded
	// 	if (this.enclosingPairs.has(languageCode)) {
	// 		return this.enclosingPairs.get(languageCode);
	// 	}


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
	// 			//TODO filter values out. Possibly use map for start and end chars.
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