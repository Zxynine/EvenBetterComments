import * as vscode from 'vscode';
import * as path from 'path';

import * as fs from 'fs';
import * as json5 from 'json5';
import { ExtentionProvider } from './providers/ExtentionProvider';
// import "./extensions/ArrayExtensions";

// type 

export class Configuration {
	private readonly commentConfig = new Map<string, vscode.CommentRule | undefined>();
	private readonly languageConfigFiles = new Map<string, string>();
	private readonly languageHasShebang = new Map<string, boolean>();

	private ReadLanguageFile(languageCode: string) : string|undefined {
		// Get the filepath from the map
		const filePath = this.languageConfigFiles.get(languageCode);
		return (filePath)? fs.readFileSync(filePath, { encoding: 'utf8' }) : undefined;
	}




	/**  Creates a new instance of the Parser class */
	public constructor() { this.UpdateLanguagesDefinitions(); }

	/**
	 * Generate a map of configuration files by language as defined by extensions
	 * External extensions can override default configurations of VSCode
	 */
	public UpdateLanguagesDefinitions() {
		console.log("EvenBetterComments: Language Definitions Updated!");
		this.commentConfig.clear();
		for (let language of ExtentionProvider.AllExtentionPathLanguagesFlat) {
			this.languageHasShebang.set(language.id, Boolean(language.firstLine));
			if (language.configuration) this.languageConfigFiles.set(language.id, path.join(language.extensionPath, language.configuration));
		}
	}

	public GetLanguageConfiguration(languageCode:string) {
		// * if no config exists for this language, back out and leave the language unsupported
		if (!this.languageConfigFiles.has(languageCode)) return undefined;
		try {
			const content = this.ReadLanguageFile(languageCode);
			// use json5, because the config can contain comments
			return (content)? json5.parse(content) : undefined;
		} catch (error) { return undefined; }
	}








	public GetHasShebang(languageCode: string): boolean {
		return (this.languageHasShebang.get(languageCode)??false)
	}



	/** Gets the configuration information for the specified language */
	public GetCommentConfiguration(languageCode: string): vscode.CommentRule | undefined {
		// * if the language config has already been loaded return the loaded value
		if (this.commentConfig.has(languageCode)) return this.commentConfig.get(languageCode);
		
		// * even if language does not have a config, we set the comment config to make future calls return above.
		const LanguageConfig = this.GetLanguageConfiguration(languageCode);
		const comments = LanguageConfig?.comments;
		this.commentConfig.set(languageCode, comments);
		return comments;
	}


	

	
	private readonly languagePairs = new Map<string, EnclosingPair[]>();
	private readonly languageBracketPairs = new Map<string, EnclosingPair[]>();
	private readonly languageSpecialPairs = new Map<string, EnclosingPair[]>();


	/** Gets the configuration information for the specified language */
	public GetEnclosingPairs(languageCode: string): Array<EnclosingPair> | undefined {
		if (this.languagePairs.has(languageCode)) return this.languagePairs.get(languageCode);

		const LanguageConfig = this.GetLanguageConfiguration(languageCode);


		const BracketPairs : Array<PairDef>|undefined = LanguageConfig.brackets;
		const SurroundingPairs : Array<PairDef>|undefined = LanguageConfig.surroundingPairs;

		const SpecialPairs: Array<PairDef>|undefined = ()
		
		let enclosing : Array<EnclosingPair> | undefined = undefined;

		if (pairs.length > 0) {
			enclosing = [];
			for (let ePair of pairs) {
				enclosing.push({
					leftTag: ePair[0],
					rightTag: ePair[1]
				});
			}
		}
			
		this.enclosingPairs.set(languageCode, enclosing);
		return enclosing;
	}

}

type EnclosingPair = {open:string, close:string};
type PairDef = [string, string];




		// for (let extension of GetAllLanguageExtensions()) {
		// 	for (let language of extension.packageJSON.contributes.languages) {
		// 		this.languageHasShebang.set(language.id, (language.firstLine)? true : false);
		// 		if (language.configuration) this.languageConfigFiles.set(language.id, path.join(extension.extensionPath, language.configuration));
		// 	}
		// }