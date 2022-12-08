

interface CommentTag {
	tag: string;
	escapedTag: string; //Used to search for matches.
	lowerTag: string; //Used as a key for dict lookup
	decoration: import('vscode').TextEditorDecorationType;
	ranges: Array<import('vscode').Range>;
}

interface RegexCommentTag {
	tag: string;
	regex: RegExp; //Used to test for the comment.
	decoration: import('vscode').TextEditorDecorationType;
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
	CustomDecoration?: import('vscode').DecorationRenderOptions;
}

//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~




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
type Func<TArgs extends any[] = [], TResult = void> = (...args: TArgs) => TResult; 
type Action<TArgs extends any[] = []> = Func<TArgs>; 

type Event = Func<[], void>;


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









// /**
//  * Swaps the elements at the specified positions in the specified array.
//  * @param {Array} array The array in which to swap elements.
//  * @param {number} i the index of one element to be swapped.
//  * @param {number} j the index of the other element to be swapped.
//  * @return {boolean} true if the array is defined and the indexes are valid.
//  */
//  export function swap<T>(array: T[], i: number, j: number): boolean {
//     if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
//         return false;
//     }
//     const temp = array[i];
//     array[i] = array[j];
//     array[j] = temp;
//     return true;
// }









type Integer = number & { __type: "Integer" };
type Character = string & { __type: "Character" };


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











type Recursive<T> = Array<Recursive<T>>;






type Digit = Indices<10>;
type StringDigit = StringLiteral<Digit>




/** Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
@category Class */
type Class<T, Arguments extends unknown[] = any[]> = Constructor<T, Arguments> & {prototype: T};

/** Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
@category Class */
type Constructor<T, Arguments extends unknown[] = any[]> = new(...arguments: Arguments) => T;



/**
Matches any unknown record.
*/
type UnknownRecord = Record<PropertyKey, unknown>;
type LooseRecord<T> = Record<keyof any, T>;
/**
Matches any unknown array or tuple.
*/
type UnknownArrayOrTuple = readonly [...unknown[]];


type ArrayOrTuple<T = any> = readonly [...T[]]





// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
	[Property in keyof Type]-?: Type[Property];
};

// Removes 'readonly' attributes from a type's properties
type Mutable<Type> = {
	-readonly [Property in keyof Type]: Type[Property];
};

// Adds 'optional' attributes to a type's properties
type Optional<Type> = {
	[Property in keyof Type]+?: Type[Property];
};




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
	@category Array
	@category Template literal
*/
type Join<ToJoin extends Array<Printable>, Delimiter extends string = '.'> = (
	ToJoin extends [] ? '' :
	ToJoin extends [Printable] ? `${ToJoin[0]}` :
	ToJoin extends [Printable, ...infer Rest extends Array<Printable>] ? `${ToJoin[0]}${Delimiter}${Join<Rest, Delimiter>}` :
	string
);


/**
	Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
	Currently, when a union type of a primitive type is combined with literal types, TypeScript loses all information about the combined literals. Thus, when such type is used in an IDE with autocompletion, no suggestions are made for the declared literals.
	This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed as soon as it's not needed anymore.
	@example
	```
		import type {LiteralUnion} from 'type-fest';
		// Before
		type Pet = 'dog' | 'cat' | string;
		const pet: Pet = '';
		// Start typing in your TypeScript-enabled IDE.
		// You **will not** get auto-completion for `dog` and `cat` literals.
		// After
		type Pet2 = LiteralUnion<'dog' | 'cat', string>;
		const pet: Pet2 = '';
		// You **will** get auto-completion for `dog` and `cat` literals.
	```
	@category Type
*/
type LiteralUnion<LiteralType, BaseType extends Primitive> = LiteralType | (BaseType & Record<never, never>);












type IsNegative<T extends number> = `${T}` extends `-${string}` ? true : false;
type IsPositive<T extends number> = `${T}` extends `-${string}` ? false : true;
type IsZero<T extends number> = `${T}` extends `${0}` ? true : false;








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



// type IsEmptyObject<T> = T extends {} ? {} extends T ? true : false : false



type Indices<L extends number, T extends number[] = []> = T['length'] extends L ? T[number] : Indices<L, [T['length'], ...T]>;
type CharArray<S extends string> = (S extends `${infer C}${infer Rest extends string}` ? (Rest extends CharEmpty? [C] : [C, ...CharArray<Rest>]) : [CharEmpty]);
type CharUnion<S extends string> = (S extends `${infer C}${infer Rest extends string}` ? (Rest extends CharEmpty? (C) : (C | CharUnion<Rest>)) : (CharEmpty));

type StringLiteral<T extends Printable> = `${T}`;
type StringUnion<L extends ArrayOrTuple<Printable>> = (
	L extends [infer T extends Printable, ...infer Rest extends ArrayOrTuple<Printable>] ? StringLiteral<T> | StringUnion<Rest> : 
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




// type AnyOf<T extends any[], L extends T[]> = T['length'] extends L ? T : AnyOf<T, [T['length'], ...T]>








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


// type Join<ToJoin extends Array<string|num>, Delimiter extends string = '.'> = (
// 	ToJoin extends [] ? '' :
// 	ToJoin extends [string|num] ? `${ToJoin[0]}` :
// 	ToJoin extends [string|num, ...infer Rest extends Array<string|num>] ? `${ToJoin[0]}${Delimiter}${Join<Rest, Delimiter>}` :
// 	string
// );






// type And<A extends bool, B extends bool> = A extends true ? B extends true ? true : false :false
// type Or<A extends bool, B extends bool> = A extends true ? true : B extends true ? true :false
// type Xor<A extends bool, B extends bool> = A extends true ? Not<B> : B extends true ? true :false
// type Not<X extends bool> = X extends true ? false : true



// type If<Condition extends boolean, Then = true, Else = false> = Condition extends true ? Then : Else




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




































declare namespace ArrayConditions {
	type ArrayToUnion<T extends ArrayOrTuple> = (T extends [infer Head, ...infer Rest extends ArrayOrTuple] ? (Head | ArrayToUnion<Rest>) : never);



	/** Extracts the type of the first element. */
	type ArrayHead<T extends UnknownArrayOrTuple> = (T extends readonly [infer THead, ...unknown[]] ? THead : never);
	/** Extracts the type of the last element. */
	type ArrayTail<T extends UnknownArrayOrTuple> = (T extends readonly [...unknown[], infer TTail] ? TTail : never);

	/** Extracts the type of an array or tuple minus the first element. */
	type ArraySkipHead<TArray extends UnknownArrayOrTuple> = TArray extends readonly [unknown, ...infer Rest] ? Rest : [];
	/** Extracts the type of an array or tuple minus the last element. */
	type ArraySkipTail<TArray extends UnknownArrayOrTuple> = TArray extends readonly [...infer Rest, unknown] ? Rest : [];


	
}
