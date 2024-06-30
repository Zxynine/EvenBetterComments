import * as vscode from "vscode";
import("../extensions/ObjectExtentions");


//extensions are processed in alphabetical order. If extension B comes after extension A alphabetically, then extension B has a chance to override certain contributions done by extension A.
//this needs to be kept in mind. Honestly the only thing that can really be done is to throw a warning if an override of non mergable properties is spotted.



export interface ILanguageExtensionPoint {
	id: string;
	firstLine?: string;
	configuration?: vscode.Uri;

	extensions?: string[];
	filenames?: string[];
	filenamePatterns?: string[];
	aliases?: string[];
	mimetypes?: string[];
}

export interface IGrammarExtensionPoint {
	scopeName: string;
	language?: string;
	path?: string;

	injectTo?: string[];
	balancedBracketSelectors?: string[];
	unbalancedBracketSelectors?: string[];
	embeddedLanguages?: { [scopeName: string]: string };
	tokenTypes?: { [scopeName: string]: string };
}


export class MergedLanguageExtensionPoint {
	public readonly ID : string;
	public constructor(
		public readonly DATA : ILanguageExtensionPoint
	) { this.ID = this.DATA.id; }

	public Merge(NewData : ILanguageExtensionPoint) {
		if (NewData.id != this.ID) return;

		this.DATA.firstLine ??= NewData.firstLine;
		this.DATA.configuration ??= NewData.configuration;

		if (NewData.extensions) this.DATA.extensions = [...this.DATA.extensions ?? [], ...NewData.extensions];
		if (NewData.filenames) this.DATA.filenames = [...this.DATA.filenames ?? [], ...NewData.filenames];
		if (NewData.filenamePatterns) this.DATA.filenamePatterns = [...this.DATA.filenamePatterns ?? [], ...NewData.filenamePatterns];
		if (NewData.aliases) this.DATA.aliases = [...this.DATA.aliases ?? [], ...NewData.aliases];
		if (NewData.mimetypes) this.DATA.mimetypes = [...this.DATA.mimetypes ?? [], ...NewData.mimetypes];
	}
}


export class MergedGrammarExtensionPoint {
	public readonly SCOPE : string;
	public constructor(
		public readonly DATA : IGrammarExtensionPoint
	) { this.SCOPE = this.DATA.scopeName; }

	public Merge(NewData : IGrammarExtensionPoint) {
		if (NewData.scopeName != this.SCOPE) return;

		this.DATA.language ??= NewData.language;
		this.DATA.path ??= NewData.path;

		if (NewData.injectTo) this.DATA.injectTo = [...this.DATA.injectTo ?? [], ...NewData.injectTo];
		if (NewData.balancedBracketSelectors) this.DATA.balancedBracketSelectors = [...this.DATA.balancedBracketSelectors ?? [], ...NewData.balancedBracketSelectors];
		if (NewData.unbalancedBracketSelectors) this.DATA.unbalancedBracketSelectors = [...this.DATA.unbalancedBracketSelectors ?? [], ...NewData.unbalancedBracketSelectors];
		if (NewData.embeddedLanguages) this.DATA.embeddedLanguages = {...this.DATA.embeddedLanguages ?? {}, ...NewData.embeddedLanguages};
		if (NewData.tokenTypes) this.DATA.tokenTypes = {...this.DATA.tokenTypes ?? {}, ...NewData.tokenTypes};
	}
}






// export class MergableData<TData extends {}> {
// 	public static readonly KeyExtractor = new Proxy({}, { get : (_,K) => K });
// 	private static PropertyMerger<T>(LHS:T,RHS:T) : T { return (
// 		(LHS==null || RHS==null) ? (LHS??RHS) :									//If either is not given just return the other.
// 		(Array.isArray(LHS) && Array.isArray(RHS)) ? ([...LHS,...RHS] as T) :	//If its an array, combine into a single array.
// 		((typeof LHS && typeof RHS) === 'object') ? ({...LHS,...RHS} as T) :	//If its an object, combine into a single object.
// 		(LHS || RHS)															//If all else fails, return the more truthy option.
// 	)}

	
// 	private readonly Blacklist? : Set<string>;
// 	private readonly WhiteList? : Set<string>;

// 	public constructor(
// 		public readonly Data : TData,
// 		BlacklistGenerator : ((Proxy : TData) => Array<string>) | undefined = undefined,
// 		WhitelistGenerator : ((Proxy : TData) => Array<string>) | undefined = undefined,
// 		// public readonly Key : TKey
// 	) {
// 		Set.prototype.
// 		this.Blacklist = BlacklistGenerator?.(MergableData.KeyExtractor as TData);
// 		this.WhiteList = WhitelistGenerator?.(MergableData.KeyExtractor as TData);
// 	}


// 	public Merge(NewData : TData) : void {
// 		var Keys = Object.keys(NewData);
// 		Keys = this.WhiteList ? Keys.filter()

// 	}
// }
