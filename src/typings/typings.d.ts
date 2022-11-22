

interface CommentTag {
	tag: string;
	escapedTag: string;
	lowerTag: string;
	decoration: import('vscode').TextEditorDecorationType;
	ranges: Array<import('vscode').Range>;
}


interface Contributions {
	monolineComments: boolean;
	multilineComments: boolean;
	useJSDocStyle: boolean;
	highlightPlainText: boolean;
	allowNestedHighlighting: boolean;
	tags: Array<TagDefinition>;
}


interface TagDefinition {
	tag: string;
	aliases: Array<string>;
	color: string;
	overline: boolean;
	strikethrough: boolean;
	underline: boolean;
	bold: boolean;
	italic: boolean;
	backgroundColor: string;
}










type Configuration = {
	paths?: string[],
	rules?: Rule[],
};

type Rule = {
	patterns?: string[];
	color?: string|import('vscode').ThemeColor;
	matchCase?: boolean;
	matchWholeWord?: boolean;

	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikeThrough?: boolean;
};






































interface IHash<T> { [details: string]: T; }


/** A union of given const enum values. **/
type Flags<T extends number> = number;
/** A union of given const enum values. **/
type OrMask<T extends number> = number;



// Syntax sugar
type Func<TArgs extends any[], TResult> = (...args: TArgs) => TResult; 
type Action<TArgs extends any[]> = Func<TArgs, undefined>; 
type Callback = () => void;
type Callable<T> = () => T;


type nulldefined = null|undefined;

type Nullable<T> = T | null;



// (/\*\*)\n.+\*(.*)\n.*( \*/)
// $1$2$3




type bool = boolean;
type int = number;
type float = number;
type char = string;





type Bit = 0|1;



// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
	[Property in keyof Type]-?: Type[Property];
};

// Removes 'readonly' attributes from a type's properties
type Mutable<Type> = {
	-readonly [Property in keyof Type]: Type[Property];
};