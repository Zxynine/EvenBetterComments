
//https://github.com/unional/type-plus/tree/6f8f80bc9de75d7dc8954427e6ea971b8230aa8c/packages/type-plus/src
//https://github.com/unional/type-plus/blob/6f8f80bc9de75d7dc8954427e6ea971b8230aa8c/packages/type-plus/src/equal/equal.ts#L33

/** Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive). */
type Primitive = (|null|undefined|string|number|boolean|symbol|bigint);
/** Matches any primitive, `Date`, or `RegExp` value. */
type BuiltIn = Primitive | Date | RegExp;
/** Types that can contain custom properties. */
type ComposableTypes = object | Function




/** @desc Type representing falsy values in TypeScript: `false | "" | 0 | null | undefined` */
type Falsy = false | '' | 0 | null | undefined;
type Printable = (|string|number|bigint|boolean|null|undefined);



type CharEmpty = '';




type TypeRemove<T, R, Default = never> = T extends R ? Default : T;
type TypeIs<A,B> = [A] extends [B] ? true : false;
type TypeIf<Condition extends boolean, T=true,F=false> = [Condition] extends [true] ? T : [Condition] extends [false] ? F : never;










/** Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). */
export type Constructor<T, Arguments extends unknown[] = any[]> = new(...arguments_: Arguments) => T;
/** Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). */
export type Class<T, Arguments extends unknown[] = any[]> = Constructor<T, Arguments> & {prototype: T};

/** A function that returns true or false based on input arguments */
export type Predicate<T = unknown> = (value: T, ...extraArgs: any[]) => boolean;

/** A function that returns true or false based on input arguments but additionally is a TypeGuard for Typescript compiler */
export type TypeGuardPredicate<T = any> = (value: any, ...extraArgs: any[]) => value is T;





export const isUndefined = <T>(term: T | undefined): term is undefined => typeof term === 'undefined';
export const isBoolean = <U>(term: boolean | U): term is boolean => typeof term === 'boolean';
export const isNumber = <U>(term: number | U): term is number => typeof term === 'number' && !Number.isNaN(term);
export const isString = <U>(term: string | U): term is string => typeof term === 'string';
export const isBigInt = <U>(term: bigint | U): term is bigint => typeof term === 'bigint';
export const isSymbol = <U>(term: symbol | U): term is symbol => typeof term === 'symbol';
export const isNull = <T>(term: T | null): term is null => term === null;

export const isFunction = <T extends Function, U>(term: T | U): term is T => typeof term === 'function';
export const isObject = <T extends object, U>(term: T | U): term is NonNullable<T> => !isNull(term) && typeof term === 'object';
export const isArray = <T, U>(term: Array<T> | U): term is Array<T> => Array.isArray(term);
export const isMap = <K, V, U>(term: Map<K, V> | U): term is Map<K, V> => term instanceof Map;
export const isSet = <T, U>(term: Set<T> | U): term is Set<T> => term instanceof Set;

export const isNonEmptyArray = <T, U>(term: Array<T> | U): term is Array<T> => isArray(term) && term.length > 0;
export const isNonEmptyString = <U>(term: string | U): term is string => isString(term) && term.length > 0;
export const isNumberOrNaN = <U>(term: number | U): term is number => typeof term === 'number';
export const isInteger = <U>(term: number | U): term is number => isNumber(term) && Number.isInteger(term);
export const isPositiveInteger = <U>(term: number | U): term is number => isInteger(term) && term > 0;
export const isNonNegativeInteger = <U>(term: number | U): term is number => isInteger(term) && term >= 0;
export const isNegativeInteger = <U>(term: number | U): term is number => isInteger(term) && term < 0;



type Indexed<K = string, V = unknown> = (
	K extends object ? {[_ in keyof K]:V} :
	K extends PropertyKey ? {[_ in K]:V} :
	{[_:string]:V}
);


function TypeGuard<X extends Indexed<string>,Y>(args: X, guard: TypeGuardPredicate<Y>): Indexed<X, Y> | null {
	return Object.values(args).every(guard) ? args as any : null;
}


function ConditionalTypeGuard<X extends Indexed<string>, Y>(args: X, guard: TypeGuardPredicate<Y>, Resolved: (Obj: Indexed<X,Y>) => void, Rejected: (Obj: X) => void = (_)=>{}): void {
	return Object.values(args).every(guard) ? args as any : null;
}



// let Tonjio1 : Indexed;
// let Tonjio2 : Indexed<null>;
// let Tonjio3 : Indexed<number>;
// let Tonjio4 : Indexed<{[_ : symbol]: any}>;



// let Tonjio1 : Indexed;
// let Tonjio2 : Indexed<null,bool>;
// let Tonjio3 : Indexed<number,bool>;
// let Tonjio4 : Indexed<{[_ : symbol]: any}, bool>;


export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type GuardFor<T> = T extends Guard<infer R> ? R : never
export type Guard<T> = ((x: unknown) => x is T) & {
	__isOptional?: boolean
	__isCircularRef?: boolean
  }
  





