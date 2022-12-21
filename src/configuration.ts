import * as vscode from 'vscode';
import * as json5 from 'json5';
import { LanguageLoader } from './providers/LanguageProvider';
import { TextDecoder } from 'util';


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
		} catch { return undefined; }
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







}

