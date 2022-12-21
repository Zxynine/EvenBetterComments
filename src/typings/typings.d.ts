type VSCodeDecorationType = import('vscode').TextEditorDecorationType; 
type VSCodeDecorationRender = import('vscode').DecorationRenderOptions; 

interface CommentTag {
	tag: string;
	escapedTag: string; //Used to search for matches.
	lowerTag: string; //Used as a key for dict lookup
	decoration: VSCodeDecorationType;
	ranges: Array<import('vscode').Range>;
}

interface RegexCommentTag {
	tag: string;
	regex: RegExp; //Used to test for the comment.
	decoration: VSCodeDecorationType;
	ranges: Array<import('vscode').Range>;
}


interface Contributions {
	enabled: boolean;
	monolineComments: boolean;
	multilineComments: boolean;
	useJSDocStyle: boolean;
	highlightPlainText: boolean;
	highlightTagOnly: boolean;
	allowFullBlockHighlights: boolean;
	tags: Array<TagDefinition>;
}


interface TagDefinition {
	tag: string;
	aliases: Array<string>;
	color: string;
	backgroundColor: string;
	overline: boolean;
	strikethrough: boolean;
	underline: boolean;
	bold: boolean;
	italic: boolean;
	isRegex: boolean;
	CustomDecoration?: VSCodeDecorationRender;
}

//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

type IDisposable = {
	dispose: () => void;
}


/**
Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
@category Type
*/
type Primitive = (
	| null
	| undefined
	| string
	| number
	| boolean
	| symbol
	| bigint
);

type Printable = (
	| string 
	| number 
	| bigint 
	| boolean 
	| null 
	| undefined
);

/**
 * Falsy
 * @desc Type representing falsy values in TypeScript: `false | "" | 0 | null | undefined`
 * @example
 *   type Various = 'a' | 'b' | undefined | false;
 *
 *   // Expect: "a" | "b"
 *   Exclude<Various, Falsy>;
 */
type Falsy = false | '' | 0 | null | undefined;

















type CharEmpty = '';
type IsEmptyChar<T> = T extends CharEmpty ? true : false;

// type ClassEmpty = { [Key in any] : never }

// type IsEmptyObject<T> = T extends EmptyObject ? true : false;

type IsNever<T, True=true, False=false> = [T] extends [never] ? True : False;



/**
 * mixed
 * @desc An arbitrary type that could be anything
 * @example
 *
 * stringify = (value: mixed) => ...;
 *
 *   stringify("foo");
 *   stringify(3.14);
 *   stringify(null);
 *   stringify({});
 */ 
type mixed = unknown;






interface IHash<T> { [details: string]: T; }


/** A union of given const enum values. **/
type Flags<T extends number> = number;
/** A union of given const enum values. **/
type OrMask<T extends number> = number;



// Syntax sugar
type Func<TArgs = [], TResult = void> = ([TArgs] extends [any[]] 
	? (...args:TArgs) => TResult 
	: ([TResult] extends [void] 
		? () => TArgs 
		: (arg: TArgs) => TResult
	)
);


type Action<TArgs = []> = [TArgs] extends [any[]] ? Func<TArgs, void> :  Func<[TArgs], void>; 


type Event<T = []> = Func<T, void>;
/** A function used to subscribe to an EventEmitter. */
type EventSubscribe<T> = Func<[listener: EventListener<T>], IDisposable>;
/** A function used by a subscriber to process an event emitted from an EventEmitter. */
type EventListener<T> = (event: T) => void;


type nulldefined = null|undefined;

type Nullable<T> = T|null;
type Undefinable<T> = T|undefined;
type NonNull<T> = Remove<T, null>
type NonUndefined<T> = Remove<T, null>

type Remove<T, R, Default = never> = T extends R ? Default : T;



// (/\*\*)\n.+\*(.*)\n.*( \*/)
// $1$2$3

type bool = boolean;
type int = number;
type float = number;
type num = number;
type char = string;

type Exception = Error;

type Integer = number & { readonly __type__: "Integer" };
type Float = number & { readonly __type__: "Float" };
type Character = string & { readonly __type__: "Character" };


type Bit = 0|1;


/**
 * Types that can contain custom properties.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type ComposableTypes = object | Function

/**
Matches any primitive, `Date`, or `RegExp` value.
*/
type BuiltIn = Primitive | Date | RegExp;



type IList<T=any> = ArrayLike<T>;




type IComparer<T> = (LHS:T, RHS:T) => CompareResult;
type IEqualityComparer<T> = (LHS:T, RHS:T) => bool;
type ISimilarityComparer<T> = (LHS:T, RHS:T) => int;
type IDifferenceComparer<T> = (LHS:T, RHS:T) => int;
type ISearcher<T> = (value:T) => bool;
type ISorter<T> = (LHS:T, RHS:T) => CompareResult;

declare const enum CompareResult {
	Greater = 1,
	EqualTo = 0,
	Lesser = -1,
}




type IconPath = (
	| string
	| import("vscode").Uri
	| import("vscode").ThemeIcon
	| {
		light: string | import("vscode").Uri;
		dark: string | import("vscode").Uri;
	}
);


type OrUndefined<T> = { [P in keyof T]: T[P] | undefined };





//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~





