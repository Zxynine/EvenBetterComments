


declare const enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 3,
	// Indicates that no token type is set.
	NotSet = 8
}


/**
 * Identifiers with a binary dot operator.
 * Examples: `baz` or `foo.bar`
*/
type ScopeName = string;

/**
 * An expression language of ScopeNames with a binary space (to indicate nesting) operator.
 * Examples: `foo.bar boo.baz`
*/
type ScopePath = string;

/**
 * An expression language of ScopePathStr with a binary comma (to indicate alternatives) operator.
 * Examples: `foo.bar boo.baz,quick quack`
*/
type ScopePattern = string;
/**
 * A TextMate theme.
 */
interface IRawTheme {
	readonly name?: string;
	readonly settings: IRawThemeSetting[];
}

/**
 * A single theme setting.
 */
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

/** A registry helper that can locate grammar file paths given scope names. */
interface RegistryOptions {
	onigLib: Promise<IOnigLib>;
	theme?: IRawTheme;
	colorMap?: string[];
	loadGrammar(scopeName: ScopeName): Promise<IRawGrammar | undefined | null>;
	getInjections?(scopeName: ScopeName): ScopeName[] | undefined;
}


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
	loadGrammar(scopeName: string): Promise<IRawGrammar | undefined | null>;
	getInjections?(scopeName: string): string[] | undefined;
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
	startIndex: number;
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
	 *  - at offset 2*i => startIndex
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


interface IStackElement {
	_stackElementBrand: void;
	readonly depth: number;
	clone(): IStackElement;
	equals(other: IStackElement): boolean;
}


interface IWhileCheckResult {
	readonly stack: IStackElement;
	readonly linePos: number;
	readonly anchorPosition: number;
	readonly isFirstLine: boolean;
}


interface IDecodedMetadata {
	languageId: string | undefined;
	tokenType: StandardTokenType;
	bold: boolean | undefined;
	italic: boolean | undefined;
	underline: boolean | undefined;
	strikethrough: boolean | undefined;
	foreground: string | undefined;
	background: string | undefined;
}