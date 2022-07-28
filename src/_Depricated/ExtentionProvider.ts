
// import "../extensions/ArrayExtensions";
// import * as vscode from 'vscode';




// export const ExtentionProvider = {
// 	get All() { return vscode.extensions.all; },
// 	get AllPackageJSON() { return vscode.extensions.all.map((e) => e.packageJSON); },
// 	get AllExtentionContributes() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes); },

// 	get AllExtentionGrammarsJagged() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes?.grammars as Array<ExtensionGrammar>);  },
// 	get AllExtentionGrammarsFlat() { return vscode.extensions.all.condensedFlatMap((ext)=> ext.packageJSON?.contributes?.grammars as Array<ExtensionGrammar>);  },
// 	get AllExtentionGrammarsReduced() { return this.AllExtentionGrammarsJagged.reduce((a: ExtensionGrammar[], b: ExtensionGrammar[]) => [...a, ...b], []); },


// 	get AllExtentionPathGrammarsJagged() : ExtentionPathGrammar[][] {
// 		return vscode.extensions.all
// 			.filter((x) => x.packageJSON?.contributes?.grammars)
// 			.map((e) => e.packageJSON.contributes.grammars.map((g:ExtensionGrammar) => <ExtentionPathGrammar>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathGrammarsFlat() : ExtentionPathGrammar[] {
// 		return vscode.extensions.all
// 			.filter((x) => x.packageJSON?.contributes?.grammars)
// 			.flatMap((e) => e.packageJSON.contributes.grammars.map((g:ExtensionGrammar) => <ExtentionPathGrammar>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathGrammarsReduced() { return this.AllExtentionPathGrammarsJagged.reduce((a: ExtentionPathGrammar[], b: ExtentionPathGrammar[]) => [...a, ...b], []); },
	

// 	get AllExtentionLanguagesJagged() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes?.languages as Array<ExtensionLanguage>);  },
// 	get AllExtentionLanguagesFlat() { return vscode.extensions.all.condensedFlatMap((ext)=> ext.packageJSON?.contributes?.languages as Array<ExtensionLanguage>);  },
// 	get AllExtentionLanguagesReduced() { return this.AllExtentionLanguagesJagged.reduce((a : ExtensionLanguage[], b : ExtensionLanguage[]) => [...a, ...b], []); },


// 	get AllExtentionPathLanguagesJagged() : ExtensionPathLanguage[][] {
// 		return vscode.extensions.all
// 			.filter((x) => x.packageJSON?.contributes?.languages)
// 			.map((e) => e.packageJSON.contributes.languages.map((g:ExtensionLanguage) => <ExtensionPathLanguage>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathLanguagesFlat() : ExtensionPathLanguage[] {
// 		return vscode.extensions.all
// 			.filter((x) => x.packageJSON?.contributes?.languages)
// 			.flatMap((e) => e.packageJSON.contributes.languages.map((g:ExtensionLanguage) => <ExtensionPathLanguage>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathLanguagesReduced() { return this.AllExtentionPathLanguagesJagged.reduce((a: ExtensionPathLanguage[], b: ExtensionPathLanguage[]) => [...a, ...b], []); },
	
// }


// export interface ExtensionLanguage {
// 	id: string;
// 	extensions: Array<string>;
// 	aliases: Array<string>;
// 	filenames?: Array<string>;
// 	firstLine?: string;
// 	configuration: string;
// 	icon?: {light:string, dark:string};
// }

// export interface ExtensionPathLanguage extends ExtensionLanguage {
// 	readonly extensionPath : string;
// }


// export interface ExtensionGrammar {
// 	language?: string;
// 	path?: string;
// 	scopeName?: string;
// 	embeddedLanguages?: { [scopeName: string]: string };
// 	injectTo?: string[];
// }

// export interface ExtentionPathGrammar extends ExtensionGrammar {
// 	readonly extensionPath : string;
// }




// export function GetAllLanguageExtensions() {
// 	return vscode.extensions.all.filter((x) => x.packageJSON?.contributes?.languages);
// }

// export function GetAllExtensionLanguages() {
// 	return vscode.extensions.all.filter((x) => x.packageJSON?.contributes?.languages).flatMap((x) => x.packageJSON.contributes.languages);
// }


// export function GetAllGrammarExtensions() {
// 	return vscode.extensions.all.filter((x) => x.packageJSON?.contributes?.grammars);
// }

// export function GetAllExtensionGrammars() {
// 	return vscode.extensions.all.filter((x) => x.packageJSON?.contributes?.grammars).flatMap((x) => x.packageJSON.contributes.grammars);
// }










// /*


// import * as vscode from 'vscode';
// // import "./extensions/ArrayExtensions.ts";
// import '../extensions/ArrayExtensions';




// export const ExtentionProvider = {
// 	get All() { return vscode.extensions.all; },
// 	get AllPackageJSON() { return vscode.extensions.all.map((e) => e.packageJSON); },
// 	get AllExtentionContributes() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes); },



// 	get AllExtentionGrammarsJagged() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes?.grammars as Array<ExtensionGrammar>);  },
// 	get AllExtentionGrammarsFlat() { return vscode.extensions.all.condensedFlatMap((ext)=> ext.packageJSON?.contributes?.grammars as Array<ExtensionGrammar>);  },
// 	get AllExtentionGrammarsReduced() { return this.AllExtentionGrammarsJagged.reduce((a: ExtensionGrammar[], b: ExtensionGrammar[]) => [...a, ...b], []); },

// 	get AllExtentionPathGrammarsJagged() {
// 		return vscode.extensions.all.mappedFilter<Array<ExtensionPathGrammar>>(
// 			(x) => x.packageJSON?.contributes?.grammars, 
// 			(e) => e.packageJSON.contributes.grammars.map((g:ExtensionGrammar) => <ExtensionPathGrammar>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathGrammarsFlat() {
// 		return vscode.extensions.all.flatMappedFilter<ExtensionPathGrammar>(
// 			(x) => x.packageJSON?.contributes?.grammars,
// 			(e) => e.packageJSON.contributes.grammars.map((g:ExtensionGrammar) => <ExtensionPathGrammar>{ extensionPath: e.extensionPath, ...g }
// 		));
// 	},
// 	get AllExtentionPathGrammarsReduced() { return this.AllExtentionPathGrammarsJagged.reduce((a: ExtensionPathGrammar[], b: ExtensionPathGrammar[]) => [...a, ...b], []); },
	



// 	get AllExtentionLanguagesJagged() { return vscode.extensions.all.condensedMap((ext)=> ext.packageJSON?.contributes?.languages as Array<ExtensionLanguage>);  },
// 	get AllExtentionLanguagesFlat() { return vscode.extensions.all.condensedFlatMap((ext)=> ext.packageJSON?.contributes?.languages as Array<ExtensionLanguage>);  },
// 	get AllExtentionLanguagesReduced() { return this.AllExtentionLanguagesJagged.reduce((a: ExtensionLanguage[], b: ExtensionLanguage[]) => [...a, ...b], []); },

// 	get AllExtentionPathLanguagesJagged() {
// 		return vscode.extensions.all.mappedFilter<Array<ExtensionPathLanguage>>(
// 			(x) => x.packageJSON?.contributes?.languages, 
// 			(e) => e.packageJSON.contributes.languages.map((g:ExtensionLanguage) => <ExtensionPathLanguage>{ extensionPath: e.extensionPath, ...g })
// 		);
// 	},
// 	get AllExtentionPathLanguagesFlat() {
// 		return vscode.extensions.all.flatMappedFilter<ExtensionPathLanguage>(
// 			(x) => x.packageJSON?.contributes?.languages,
// 			(e) => e.packageJSON.contributes.languages.map((g:ExtensionLanguage) => <ExtensionPathLanguage>{ extensionPath: e.extensionPath, ...g }
// 		));
// 	},
// 	get AllExtentionPathLanguagesReduced() { return this.AllExtentionPathLanguagesJagged.reduce((a: ExtensionPathLanguage[], b: ExtensionPathLanguage[]) => [...a, ...b], []); },
	
// }

// export interface ExtensionLanguage {
//         id: string;
//         extensions: Array<string>;
//         aliases: Array<string>;
//         filenames?: Array<string>;
//         firstLine?: string;
//         configuration: string;
//         icon?: {light:string, dark:string};
// }

// export interface ExtensionPathLanguage extends ExtensionLanguage {
// 	readonly extensionPath : string;
// }

// export interface ExtensionGrammar {
// 	language?: string;
// 	path?: string;
// 	scopeName?: string;
// 	embeddedLanguages?: { [scopeName: string]: string };
// 	injectTo?: string[];
// }

// export interface ExtensionPathGrammar extends ExtensionGrammar {
// 	readonly extensionPath : string;
// }

// */