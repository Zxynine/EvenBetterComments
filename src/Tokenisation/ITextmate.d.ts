
// //https://github.com/microsoft/vscode/blob/aea213b7fcc7de5c24ad797ac1af209b159d451f/src/vs/workbench/services/textMate/common/TMGrammars.ts#L19


// export interface IExtensionPackage {
// 	contributes?: IExtensionContributes
// }

// export interface IExtensionContributes {
// 	languages?: Array<IExtensionLanguage>;
// 	grammars?: Array<IExtensionGrammar>;
// }

// export interface IExtensionLanguage {
// 	id:string;
// 	configuration:string;
// 	firstLine?: string;
// }


// export interface IEmbeddedLanguagesMap { [scopeName: string]: string; }
// export interface ITokenTypesContribution { [scopeName: string]: string; }

// export interface IExtensionGrammar {
// 	language?: string;	// undefined if the grammar is only included by other grammars
// 	scopeName: string;
// 	path?: string;
// 	embeddedLanguages?: IEmbeddedLanguagesMap;
// 	tokenTypes?: ITokenTypesContribution;
// 	injectTo?: Array<string>;
// 	balancedBracketScopes: string[];
// 	unbalancedBracketScopes: string[];
// }



declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3,
	// Indicates that no token type is set.
	NotSet = 8
}


// Must have the same values as `StandardTokenType`!
declare const enum OptionalStandardTokenType {
	Other = 0,
	Comment = 1,
	String = 2,
	RegEx = 3,
	// Indicates that no token type is set.
	NotSet = 8
}











/** Identifiers with a binary dot operator. <br/> Examples: `baz` or `foo.bar` */
type ScopeName = string;
/** An expression language of ScopePathStr with a binary comma (to indicate alternatives) operator. <br/> Examples: `foo.bar boo.baz,quick quack`*/
type ScopePattern = string;

/** A TextMate theme. */
interface IRawTheme {
	readonly name?: string;
	readonly settings: IRawThemeSetting[];
}

/** A single theme setting. */
interface IRawThemeSetting {
	readonly name?: string;
	readonly scope?: ScopePattern | ScopePattern[];
	readonly settings: {
		readonly fontStyle?: string;
		readonly foreground?: string;
		readonly background?: string;
	};
}

interface ILocation {
	readonly filename: string;
	readonly line: number;
	readonly char: number;
}
interface ILocatable {readonly $vscodeTextmateLocation?: ILocation;}




interface IGrammar {
	readonly language: string;

	/** Tokenize `lineText` using previous line state `prevState` **/
	tokenizeLine(lineText: string, prevState?: IStackElement): ITokenizeLineResult;
	/**
	 * Tokenize `lineText` using previous line state `prevState`.
	 * The result contains the tokens in binary format, resolved with the following information:
	 *  - language
	 *  - token type (regex, string, comment, other)
	 *  - font style
	 *  - foreground color
	 *  - background color
	 * e.g. for getting the languageId: `(metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET`
	 */
	tokenizeLine2(lineText: string, prevState?: IStackElement): ITokenizeLineResult2;
}





// declare const ruleIdSymbol = Symbol('RuleId');
// type RuleId = { __brand: typeof ruleIdSymbol };

// interface Injection {
// 	readonly debugSelector: string;
// 	readonly matcher: Matcher<string[]>;
// 	readonly priority: -1 | 0 | 1; // 0 is the default. -1 for 'L' and 1 for 'R'
// 	readonly ruleId: RuleId;
// 	readonly grammar: IRawGrammar;
// }


interface IRawGrammar extends ILocatable {
	repository: IRawRepository;
	readonly scopeName: string;
	readonly patterns: IRawRule[];
	readonly injections?: {[expression: string]: IRawRule;};
	readonly injectionSelector?: string;
	readonly fileTypes?: string[];
	readonly name?: string;
	readonly firstLineMatch?: string;
}
interface IGrammarConfiguration {
	embeddedLanguages?: IEmbeddedLanguagesMap;
	tokenTypes?: ITokenTypeMap;
	balancedBracketSelectors?: string[];
	unbalancedBracketSelectors?: string[];
}
interface IGrammarRepository {
	lookup(scopeName: ScopeName): IRawGrammar | undefined;
	injections(scopeName: ScopeName): ScopeName[];
}



interface IRawRule extends ILocatable {
	id?: number;
	readonly include?: string;
	readonly name?: string;
	readonly contentName?: string;
	readonly match?: string;
	readonly captures?: IRawCaptures;
	readonly begin?: string;
	readonly beginCaptures?: IRawCaptures;
	readonly end?: string;
	readonly endCaptures?: IRawCaptures;
	readonly while?: string;
	readonly whileCaptures?: IRawCaptures;
	readonly patterns?: IRawRule[];
	readonly repository?: IRawRepository;
	readonly applyEndPatternLast?: boolean;
}
declare type IRawCaptures = IRawCapturesMap & ILocatable;
declare type IRawRepository = IRawRepositoryMap & ILocatable;
interface IRawCapturesMap {[captureId: string]: IRawRule;}
interface ITokenTypeMap {[selector: string]: StandardTokenType;} /**A map from selectors to token types.**/
interface IEmbeddedLanguagesMap {[scopeName: string]: number;} /** A map from scope name to a language id. Please do not use language id 0. **/
interface IRawRepositoryMap {
	[name: string]: IRawRule;
	$self: IRawRule;
	$base: IRawRule;
}

















/** A registry helper that can locate grammar file paths given scope names. **/
interface RegistryOptions {
	onigLib: Promise<IOnigLib>;
	getInjections(scopeName: string): string[] | undefined;
	loadGrammar(scopeName: string): Promise<IRawGrammar | nulldefined>;
}


/** The registry that will hold all grammars. **/
interface IRegistry {
	/** Load the grammar for `scopeName` and all referenced included grammars asynchronously. Please do not use language id 0. **/
	loadGrammarWithEmbeddedLanguages(initialScopeName: string, initialLanguage: number, embeddedLanguages: IEmbeddedLanguagesMap): Promise<IGrammar | null>;
	/** Load the grammar for `scopeName` and all referenced included grammars asynchronously. Please do not use language id 0. **/
	loadGrammarWithConfiguration(initialScopeName: string, initialLanguage: number, configuration: IGrammarConfiguration): Promise<IGrammar | null>;
	/** Load the grammar for `scopeName` and all referenced included grammars asynchronously. **/
	loadGrammar(initialScopeName: string): Promise<IGrammar | null>;
	/** Adds a rawGrammar. **/
	addGrammar(rawGrammar: IRawGrammar, injections?: string[], initialLanguage?: number, embeddedLanguages?: IEmbeddedLanguagesMap | null): Promise<IGrammar>;

	dispose(): void;
}



interface IToken {
	readonly startIndex: number;
	readonly endIndex: number;
	readonly scopes: string[];
}

interface IToken2 {
	readonly startOffset:number;
	readonly endOffset:number;
	readonly metaData:number;
}


interface ITokenizeStringResult {
	/** The `prevState` to be passed on to the next line tokenization. **/
	readonly stack: IStackElement,
	/** Did tokenization stop early due to reaching the time limit. */
	readonly stoppedEarly: boolean
}




interface ITokenizeLineResult {
	readonly tokens: IToken[];
	/** The `prevState` to be passed on to the next line tokenization. **/
	readonly ruleStack: IStackElement;
	/** Did tokenization stop early due to reaching the time limit. */
	readonly stoppedEarly: boolean;
}

interface ITokenizeLineResult2 {
	/** The tokens in binary format. Each token occupies two array indices. For token i:
	 *  - at offset 2*i + 0 => startIndex
	 *  - at offset 2*i + 1 => metadata
	**/
	readonly tokens: IToken2Array;
	/** The `prevState` to be passed on to the next line tokenization. **/
	readonly ruleStack: IStackElement;
	/** Did tokenization stop early due to reaching the time limit. */
	readonly stoppedEarly: boolean;
}

type IToken1Array = Array<IToken>;
type IToken2Array = Uint32Array;
type ITokenArrayRange = Uint32Array | ArrayBuffer | null;


interface IStackElement {
	_stackElementBrand: void;
	readonly depth: number;
	clone(): IStackElement;
	equals(other: IStackElement): boolean;
}
