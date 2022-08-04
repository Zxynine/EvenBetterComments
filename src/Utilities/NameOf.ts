



export type DeconstructedType<T> = { new(...params: any[]): T };





function cleanseAssertionOperators(parsedName: string): string {
	return parsedName.replace(/[?!]/g, "");
}


/**
 * Converts a class into a function string in order to parse the class's name.
 * @param classType The class whose name to get.
 */
export function nameof<T extends Object>(nameFunction: DeconstructedType<T>): string {
	const fnStr = nameFunction.toString();

	// ES6 class name:
	// "class ClassName { ..."
	if (
		fnStr.startsWith("class ")
		// Theoretically could, for some ill-advised reason, be "class => class.prop".
		&& !fnStr.startsWith("class =>")
	) {
		return cleanseAssertionOperators(
			fnStr.substring(
				"class ".length,
				fnStr.indexOf(" {")
			)
		);
	}

	// ES6 prop selector:
	// "x => x.prop"
	if (fnStr.includes("=>")) {
		return cleanseAssertionOperators(
			fnStr.substring(
				fnStr.indexOf(".") + 1
			)
		);
	}

	// ES5 prop selector:
	// "function (x) { return x.prop; }"
	// webpack production build excludes the spaces and optional trailing semicolon:
	//   "function(x){return x.prop}"
	// FYI - during local dev testing i observed carriage returns after the curly brackets as well
	// Note by maintainer: See https://github.com/IRCraziestTaxi/ts-simple-nameof/pull/13#issuecomment-567171802 for explanation of this regex.
	const matchRegex = /function\s*\(\w+\)\s*\{[\r\n\s]*return\s+\w+\.((\w+\.)*(\w+))/i;

	const es5Match = fnStr.match(matchRegex);

	if (es5Match) {
		return es5Match[1];
	}

	// ES5 class name:
	// "function ClassName() { ..."
	if (fnStr.startsWith("function ")) {
		return cleanseAssertionOperators(
			fnStr.substring(
				"function ".length,
				fnStr.indexOf("(")
			)
		);
	}

	// Invalid function.
	throw new Error("ts-simple-nameof: Invalid function.");
}




export function CheckType<T extends Object>(item : any, type:DeconstructedType<T>): item is T {return (typeof(item) === nameof(type).toLowerCase());}
