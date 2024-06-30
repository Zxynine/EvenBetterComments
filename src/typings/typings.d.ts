type VSCodeDecorationType = import('vscode').TextEditorDecorationType; 
type VSCodeDecorationRender = import('vscode').DecorationRenderOptions; 
type VSCodeCharacterPair = import('vscode').CharacterPair;

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
	useJSDocStyle: boolean; //TODO: Alter how this is applied.
	highlightLinks: boolean;
	highlightPlainText: boolean;
	highlightTagOnly: boolean;
	allowFullBlockHighlights: boolean;
	tags: Array<TagDefinition>;
}


interface TagDefinition {
	tag: string;
	aliases: Array<string>;
	prefix: boolean;
	color: string;
	backgroundColor: string;
	overline: boolean;
	strikethrough: boolean;
	underline: boolean;
	bold: boolean;
	italic: boolean;
	// isRegex: boolean;
	CustomDecoration?: VSCodeDecorationRender;
}





// interface CommentConfiguration {
// 	/** The line comment token, like `// this is a comment` */
// 	lineComment?: string;

// 	/** The block comment character pair, like `/ * block comment * /` */
// 	blockComment?: VSCodeCharacterPair;

// 	/* this is used to prevent the first line of the file (specifically python) from coloring like other comments */
// 	ignoreFirstLine: bool;
// }


//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~




interface IRange {        
	/** The start position. It is before or equal to {@link IRange.end end}. */
	readonly start: IPosition;

	/** The end position. It is after or equal to {@link IRange.start start}. */
	readonly end:IPosition;
}

interface IPosition {
	/** The zero-based line value. */
	readonly line: int;

	/** The zero-based character value. */
	readonly character: int;
}


interface LineRange {
	/** The zero-based line value. */
	readonly line: int;
	/** The zero-based start character value. */
	readonly startCharacter: int;
	/** The zero-based end character value. */
	readonly endCharacter: int;
}

//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


/** A union of given const enum values. **/
type Flags<T extends number> = number;
/** A union of given const enum values. **/
type OrMask<T extends number> = number;


type Method<Args, Return> = (
	[Args] extends [void] ? () => Return :
	[Args] extends [unknown[]] ? (...args : Args) => Return :
	(arg : Args) => Return
)

// Syntax sugar

type Action<T = void> = Method<T, void>;
type Func<TX, XT> = Method<TX, XT>
// type Func<TX, XT = void> = ([XT] extends [void] ? Method<XT, TX> : Method<TX, XT>);



// type Func<TArgs = [], TResult = void> = ([TArgs] extends [any[]] 
// 	? (...args:TArgs) => TResult 
// 	: ([TResult] extends [void] 
// 		? () => TArgs 
// 		: (arg: TArgs) => TResult
// 	)
// );


// type Action<TArgs = []> = [TArgs] extends [any[]] ? Func<TArgs, void> :  Func<[TArgs], void>; 




// type TestFunc1 = Func<[number, bool], int>;
// type TestFunc2 = Func<number, int>;
// type TestFunc3 = Func<number>;

// type TestAction1 = Action<[number, bool]>;
// type TestAction2 = Action<[number]>;
// type TestAction3 = Action<number>;




type IDisposable = {
	dispose: () => void;
}



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
 * Widen scalar types from literals to their parent types.
 * Borrow from `typical`
 */
type Widen<T> = (
	T extends boolean ? boolean :
	T extends number ? number :
	T extends string ? string :
 	T
 );








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












//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~













type Recursive<T> = Array<Recursive<T>>;



/** Matches any unknown record. */
type UnknownRecord = Record<PropertyKey, unknown>;
type LooseRecord<T> = Record<keyof any, T>;
type ArrayOrTuple<T = any> = readonly [...T[]]



//https://github.com/gitkraken/vscode-gitlens/blob/main/src/%40types/global.d.ts
// Removes 'optional' attributes from a type's properties
type Concrete<Type> = { [Property in keyof Type]-?: Type[Property]; };
// Removes 'readonly' attributes from a type's properties
type Mutable<Type> = { -readonly [Property in keyof Type]: Type[Property]; };
// Adds 'optional' attributes to a type's properties
type Optional<Type> = { [Property in keyof Type]+?: Type[Property]; };

type PickMutable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };


//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//Operation types
type Measured<Unit> = {readonly length: Unit};

//Dont use elsewhere.
type Extends<T> = <U>() => U extends T? true : false;

/**
Returns a boolean for whether the two given types extends the base type.
*/
type IsBothExtends<Base, FirstType, SecondType> = (
	FirstType extends Base?SecondType extends Base ? true: false:false
);



/**
Returns a boolean for whether the two given types are equal.
@link https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
@link https://stackoverflow.com/questions/68961864/how-does-the-equals-work-in-typescript/68963796#68963796
*/
type IsEqual<T, U, True=true, False=false> = (Extends<T> extends Extends<U>	? True:False);
type IsNotEqual<T, U, True=true, False=false> = (Extends<T> extends Extends<U>	? False:True);


// type testeq = IsEqual<string, char>


/**
Infer the length of the given array `<T>`.
@link https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
*/
type TupleLength<T extends readonly unknown[]> = T extends Measured<infer L> ? L : never;

/**
Create a tuple type of the given length `<L>`.
@link https://itnext.io/implementing-arithmetic-within-typescripts-type-system-a1ef140a6f6f
*/
type BuildTuple<L extends number, T extends ReadonlyArray<unknown>|ArrayOrTuple<unknown> = []> = T extends Measured<L>|ArrayLike<unknown> ? T : BuildTuple<L, [...T, unknown]>;


/**
Gets keys from a type. Similar to `keyof` but this one also works for union types.
The reason a simple `keyof Union` does not work is because `keyof` always returns the accessible keys of a type. In the case of a union, that will only be the common keys.
@link https://stackoverflow.com/a/49402091
*/
type KeysOfUnion<T> = T extends T ? keyof T : never;






/**
	Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
	Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.
	This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.
	@example
	```
		// Before
		type Pet1 = 'dog' | 'cat' | string;
		const pet1: Pet1 = ''; // You **will not** get auto-completion for `dog` and `cat` literals.
		// After
		type Pet2 = LiteralUnion<'dog' | 'cat', string>;
		const pet2: Pet2 = ''; // You **will** get auto-completion for `dog` and `cat` literals.
	```
	@category Type
*/
type LiteralUnion<LUnion, PUnion = never> = (LUnion | (PUnion & Record<never, never>));








// type If<Condition extends bool, Then = true, Else = false> = Condition extends true ? Then : Else
// type Eq<A extends bool, B extends bool> = [A] extends [B] ? true : false
// type Neq<A extends bool, B extends bool> = [A] extends [B] ? false : true

// type Not<X extends bool> = If<X,false,true>
// type And<A extends bool, B extends bool> = If<A, If<B>, false>
// type Or<A extends bool, B extends bool> = If<A, true, If<B>>
// type Nand<A extends bool, B extends bool> = Not<And<A,B>>
// type Nor<A extends bool, B extends bool> = Not<Or<A,B>>

// type Xor<A extends bool, B extends bool> = If<A,Not<B>, B>
// type Xnor<A extends bool, B extends bool> = Not<Xor<A,B>>











type Digit = Indices<10>;
type Indices<L extends number, T extends number[] = []> = T['length'] extends L ? T[number] : Indices<L, [T['length'], ...T]>;
type StringDigit = `${Digit}`


type IsNegative<T extends number> = `${T}` extends `-${string}` ? true : false;
type IsPositive<T extends number> = `${T}` extends `-${string}` ? false : true;
type IsZero<T extends number> = `${T}` extends `${0}` ? true : false;















//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~















declare namespace StringConditions {
	type Printable = (string|number|bigint|boolean|null|undefined);
	type ToStringLiteral<T extends Printable> = `${T}`;




	type CharEmpty = '';



	type StringUnion<L extends ArrayOrTuple<Printable>> = (
		L extends [infer T extends Printable, ...infer Rest extends ArrayOrTuple<Printable>] ? ToStringLiteral<T> | StringUnion<Rest> : 
		never
	);
	


	// type TestChar = CharArray<"\nheena">
	// type TestChar2 = CharArray<"f">
	// type TestChar22 = CharArray<"f ">
	// type TestChar3 = CharArray<"">


	// type TestUn = CharUnion<"\nhena">
	// type TestUn2 = CharUnion<"f">
	// type TestUn22 = CharUnion<"f ">
	// type TestUn3 = CharUnion<"">



	type CharArray<S extends string> = (S extends `${infer C}${infer Rest extends string}` ? (Rest extends CharEmpty? [C] : [C, ...CharArray<Rest>]) : [CharEmpty]);
	type CharUnion<S extends string> = (S extends `${infer C}${infer Rest extends string}` ? (Rest extends CharEmpty? (C) : (C | CharUnion<Rest>)) : (CharEmpty));
	





	type Split<S extends string, Delimiter extends string> = (
		S extends `${infer Chunk}${Delimiter}${infer Rest}` ? [Chunk, ...Split<Rest, Delimiter>] 
		: [S]);
	type SplitUnion<S extends string, Delimiter extends string> = (
		S extends CharEmpty ? never : 
		S extends `${infer Chunk}${Delimiter}${infer Rest}` ? (Chunk | SplitUnion<Rest, Delimiter>) 
		: S);
	type Trim<S extends string, Char extends string = ' '> = (
		S extends `${Char}${infer T}`|`${Char}${infer T}${Char}`|`${infer T}${Char}` 
		? Trim<T, Char> 
		: S
	);
	
	
	// // Infer never when source isn't a literal type that matches the pattern
	// type Foo<T> = T extends `*${infer S}*` ? S : never;
	
	
	
	// type T40 = Split<'foo', '.'>;  // ['foo']
	// type T41 = Split<'foo.bar.baz', '.'>;  // ['foo', 'bar', 'baz']
	// type T42 = Split<'foo.bar', ''>;  // ['f', 'o', 'o', '.', 'b', 'a', 'r']
	// type T43 = Split<any, '.'>;  // string[]
	
	
	
	
	// type T401 = SplitUnion<'foo', '.'>;  // ['foo']
	// type T411 = SplitUnion<'foo.bar.baz', '.'>;  // ['foo', 'bar', 'baz']
	// type T421 = SplitUnion<'foo.bar', ''>;  // ['f', 'o', 'o', '.', 'b', 'a', 'r']
	// type T431 = SplitUnion<any, '.'>;  // string[]
	
	




	/**
		Join an array of strings and/or numbers using the given string as a delimiter.
		Use-case: Defining key paths in a nested object. For example, for dot-notation fields in MongoDB queries.
		@example
		```
			import type {Join} from 'type-fest';
			// Mixed (strings & numbers) items; result is: 'foo.0.baz'
			const path: Join<['foo', 0, 'baz'], '.'> = ['foo', 0, 'baz'].join('.');
			// Only string items; result is: 'foo.bar.baz'
			const path: Join<['foo', 'bar', 'baz'], '.'> = ['foo', 'bar', 'baz'].join('.');
			// Only number items; result is: '1.2.3'
			const path: Join<[1, 2, 3], '.'> = [1, 2, 3].join('.');
			// Omiting delimiter; result is: '1.2.3'
			const path: Join<[1, 2, 3]> = [1, 2, 3].join('.');
		```
		@category Template literal
	*/
	type Join<ToJoin extends Array<Printable>, Delimiter extends string = '.'> = (
		ToJoin extends [] ? CharEmpty :
		ToJoin extends [Printable] ? `${ToJoin[0]}` :
		ToJoin extends [Printable, ...infer Rest extends Array<Printable>] ? `${ToJoin[0]}${Delimiter}${Join<Rest, Delimiter>}` :
		string
	);

	

}



















declare namespace ArrayConditions {
	//Core
	/** Matches any unknown array or tuple. */
	type UnknownArrayOrTuple = readonly [...unknown[]];
	type AsArray<T> = T extends UnknownArrayOrTuple ? T : [T];

	type SplitHead<H,T extends any[]> = readonly [H, ...T];
	type SplitTail<H extends any[],T> = readonly [...H, T];

	//Functions
	type ArrayUnion<L extends UnknownArrayOrTuple, R extends UnknownArrayOrTuple> = [...L, ...R];
	/** Extracts the type of the first element. */
	type ArrayHead<T extends UnknownArrayOrTuple> = (T extends SplitHead<infer THead, unknown[]> ? THead : never);
	/** Extracts the type of the last element. */
	type ArrayTail<T extends UnknownArrayOrTuple> = (T extends SplitTail<unknown[], infer TTail> ? TTail : never);

	/** Extracts the type of an array or tuple minus the first element. */
	type ArraySkipHead<TArray extends UnknownArrayOrTuple> = TArray extends SplitHead<unknown, infer Rest> ? Rest : [];
	/** Extracts the type of an array or tuple minus the last element. */
	type ArraySkipTail<TArray extends UnknownArrayOrTuple> = TArray extends SplitTail<infer Rest, unknown> ? Rest : [];



	//Tools
	type ArrayToUnion<T extends UnknownArrayOrTuple> = (T extends SplitHead<infer Head, infer Rest> ? (Head | ArrayToUnion<Rest>) : never);


	/** If type has nested arrays, the first level will be spread. */
	type ArrayFlatten<T extends UnknownArrayOrTuple> = (
		T extends SplitHead<infer Next, infer Rest>
			? ArrayUnion<AsArray<Next>, ArrayFlatten<Rest>>
		: []
	);

	/** Turns an array containing nested arrays into a flat array of types.  */
	type ArrayFlattened<T> = (
		T extends SplitHead<infer Next, infer Rest>
			? ArrayUnion<ArrayFlattened<Next>, ArrayFlattened<Rest>> 
		: AsArray<T>
	);



// type AnyOf<T extends any[], L extends T[]> = T['length'] extends L ? T : AnyOf<T, [T['length'], ...T]>



	// type TestFlatten = [1,2,[3,4,5,"G",[{},[]]],6,7]
	// type ResFull = ArrayFlattened<TestFlatten>
	// type ResOnce = ArrayFlatten<TestFlatten>

	
	// type Testing = ArrayToUnion<["A","B",1,2,3]>


	// type A1 = ArrayTail<[string, number, number]>;
	// type B1 = ArrayTail<["hello", number, number]>;
	// type C1 = ArrayTail<["hello" | "world", boolean]>;
	// type D1 = ArrayTail<[boolean, number, string]>;
	// type E1 = ArrayTail<[boolean]>;
	// type F1 = ArrayTail<[]>;

	// type A2 = ArrayHead<[string, number, number]>;
	// type B2 = ArrayHead<["hello", number, number]>;
	// type C2 = ArrayHead<["hello" | "world", boolean]>;
	// type D2 = ArrayHead<[boolean, number, string]>;
	// type E2 = ArrayHead<[boolean]>;
	// type F2 = ArrayHead<[]>;


}

// type Switch<T, Cases extends Array<[any, any]>, Default = never> = (
// 	Cases extends [] ? Default :
// 	Cases extends [[infer Key, infer Val], ...infer Rest extends Array<[any, any]>] ? (
// 		IsEqual<T, Key> extends true ? Val : Switch<T, Rest, Default>
// 	) : Default
// );




// type TestSwitch = Switch<"any", [
// 	[string, 0],
// 	[true, bool],
// 	[num, 8],
// 	["", 8],
// 	[boolean, "Worked!"]
// ], false>