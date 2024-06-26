



export type DeconstructedType<T> = { new(...params: any[]): T };

export const CheckType = <T extends Object>(item : any, type:DeconstructedType<T>): item is T => (typeof(item) === nameof(type).toLowerCase());



function cleanseAssertionOperators(parsedName: string): string {
	return parsedName.replace(/[?!]/g, "");
}
// /**
//  * Converts a lambda function to a string in order to parse the dot-accessed property on the parameter type.
//  * @param selector Lambda function representing selection of a property on the parameter type, ex. x => x.prop
//  */
//  export declare function nameof<T extends Object>(selector: (obj: T) => any, options?: NameofOptions): string;

//  /**
//   * Converts a class into a function string in order to parse the class's name.
//   * @param classType The class whose name to get.
//   */
//  export declare function nameof<T extends Object>(classType: { new (...params: any[]): T; }): string;

/**
 * Converts a class into a function string in order to parse the class's name.
 * @param classType The class whose name to get.
 */
export function nameof<T extends Object>(nameFunction: DeconstructedType<T>, takeLast?:bool): string {
	const fnStr = nameFunction.toString();

	// ES6 class name:
	// "class ClassName { ..." , or , theoretically could, for some ill-advised reason, be "class => class.prop".
	if (fnStr.startsWith("class ") && !fnStr.startsWith("class =>")) return cleanseAssertionOperators(
		fnStr.substring("class ".length, fnStr.indexOf(" {"))
	);

	// ES6 prop selector:
	// "x => x.prop"
	if (fnStr.includes("=>")) return cleanseAssertionOperators(
		fnStr.substring(fnStr.indexOf(".") + 1)
	);

	// ES5 prop selector:
	// "function (x) { return x.prop; }"
	// webpack production build excludes the spaces and optional trailing semicolon:
	//   "function(x){return x.prop}"
	// FYI - during local dev testing i observed carriage returns after the curly brackets as well
	// Note by maintainer: See https://github.com/IRCraziestTaxi/ts-simple-nameof/pull/13#issuecomment-567171802 for explanation of this regex.
	const es5Match = fnStr.match(/function\s*\(\w+\)\s*\{[\r\n\s]*return\s+\w+\.((\w+\.)*(\w+))/i);

	if (es5Match) return (takeLast)? es5Match[3] : es5Match[1];
	// ES5 class name: "function ClassName() { ..."
	else if (fnStr.startsWith("function ")) return cleanseAssertionOperators(fnStr.substring("function ".length, fnStr.indexOf("(")));
	// Invalid function.
	else throw new Error("ts-simple-nameof: Invalid function.");
}


