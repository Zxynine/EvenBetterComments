
import * as vscode from 'vscode';




export const Whitespace = /[ \t]*/;







export const enum RegexFlags {
	G = 'g',
	I = 'i',
	M = 'm',
	S = 's',
	U = 'u',
	Y = 'y'
}

export function buildRegexFlags(...Flags : RegexFlags[]) {
	return [...new Set(Flags)].join();
  }
  


/**
 * Replace linebreaks with the one whitespace symbol.
 */
 export function replaceLinebreaks(str: string, replaceSymbol: string): string {
	return str.replace(/[\n\r\t]+/g, replaceSymbol);
}

/**
 * Escapes regular expression characters in a given string
 */
 export function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&');
}
// /** //https://github.com/microsoft/vscode/blob/main/src/vs/base/common/strings.ts
//  * Escapes regular expression characters in a given string
//  */
//  export function escapeRegExpCharacters(value: string): string {
// 	return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
// }


// https://stackoverflow.com/a/6969486/2544290
export function escapeRegex(string : string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


export function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
}

export function stripWildcards(pattern: string): string {
	return pattern.replace(/\*/g, '');
}



export const validRegexFlags = ['i','m','s','u'];

/**
 * @typedef SearchResult
 * @property {import('vscode').Selection} cursorSelection
 * @property {import('vscode').Range} matchRange
 */



/**
 * @param {string} searchInput
 * @returns {RegExp}
 */
 export function createPlainSeachRegex(searchInput:string, flags:string) {
	return new RegExp(escapeRegex(searchInput), flags);
  }
/**
 * @param {string} searchInput
 * @param {string} flags
 * @returns {{errMsg: string, regex: RegExp}}
 */
 export function createRegexSearchRegex(searchInput:string, flags:string) {
	try {
	  return {regex: new RegExp(searchInput, flags)};
	}
	catch(err : any) {
	  return {errMsg: `Invalid regex input.\n${err.message}`};
	}
  }








  
/**
 * Parses numeric ranges from a string.
 *
 * @param text the text to parse from.
 */
 export function parseRanges(text: string): [number, number][] {
	return text.split(",").map((str) => {
	  const match = str.match(/(\d+)-(\d+)/);
	  return (match)? [parseInt(match[1]), parseInt(match[2])] : [-1,-1];
	});
  }




  
  export function countWordInstances(text: string, word: string): number {
	return text.split(word).length - 1;
  }









  
export function stringifyRegex() {
    let options = { prompt: 'Enter a valid regular expression.', placeHolder: '(.*)' };
    vscode.window.showInputBox(options).then(input => {
        if (input) {
            // Strip forward slashes if regex string is enclosed in them
            input = (input.startsWith('/') && input.endsWith('/')) ? input.slice(1, -1) : input;
            try {
                const jString = JSON.stringify(new RegExp(input).toString().slice(1, -1));
                vscode.window.showInformationMessage('JSON-escaped RegEx: ' + jString, 'Copy to clipboard').then(choice => {
                    if (choice && choice === 'Copy to clipboard') vscode.env.clipboard.writeText(jString);
                });
            } catch (err: any) { vscode.window.showErrorMessage(err.message); }
        }
    });
}








export const toRegexGlobal = (expr: any) => {
    if (expr instanceof RegExp) {
        let flags = expr.flags;
        if (!flags.contains("g")) flags += "g";
        return new RegExp(expr, flags);
    } else if (typeof expr === "string" || String instanceof expr) {
        return new RegExp(expr, "g");
    } else throw new Error(expr.toString() + " isn't a regex or string!");
};

export const findAll = (text: string, expr: RegExp | string) => {
    return Array.from(text.matchAll(toRegexGlobal(expr)));
};









export class RegexType {
	private steps: RegExp[] = [];

	constructor(...steps: string[]) {
		for(let str of steps) {
			this.steps.push(this.createRegExp(str));
		}
	}

	getSteps(): RegExp[] {
		return this.steps;
	}

	private createRegExp(str: string): RegExp {
		return new RegExp(str, 'g'); // with global flag
	}
}










export function escapeRegExpGroups(s:string) {
    // Lookbehind assertions ("(?<!abc) & (?<=abc)") supported from ECMAScript 2018 and onwards. Native in node.js 9 and up.
    if (parseFloat(process.version.replace('v', '')) > 9.0) {
        // Make group non-capturing
        return s.replace(/(?<!\\)(\()([^?]\w*(?:\\+\w)*)(\))?/g, '$1?:$2$3');
    } else return escapeRegExpGroupsLegacy(s);
}

export function escapeRegExpGroupsLegacy(s:string) {
    return s.replace(/\(\?<[=|!][^)]*\)/g, '') // Remove any unsupported lookbehinds
        .replace(/((?:[^\\]{1}|^)(?:(?:[\\]{2})+)?)(\((?!\?[:|=|!]))([^)]*)(\))/g, '$1$2?:$3$4'); // Make all groups non-capturing
}





















// /**
//  * Are there capture groups, like `$1` in this conditional replacement text?
//  * 
//  * @param {string} replacement 
//  * @param {Array} groups 
//  * @returns {string} - resolve the capture group
//  */
// export function _checkForCaptureGroupsInConditionalReplacement(replacement:string, groups:Array<string>) {

// 	const re = /(?<ticks>`\$(\d+)`)/g;
// 	const capGroups = [...replacement.matchAll(re)];
// 	for (let i = 0; i < capGroups.length; i++) {
// 	  if (capGroups[i].groups?.ticks) {
// 		replacement = replacement.replace(capGroups[i][0], groups[capGroups[i][2]] ?? "");
// 	  }
// 	}
// 	return replacement;
//   }


/**
 * 
 * @param {string} findValue 
 * @returns {Promise<string>}
 */
export async function replaceFindCaptureGroups(findValue:string) {
  
	const selections = vscode.window.activeTextEditor!.selections;
	const document = vscode.window.activeTextEditor!.document;
	
	// TODO should be replaceAll
	findValue = findValue.replace(/(\\[UuLl])?\\\$(\d+)/g, (match, p1, p2) => {
	  
	  // if no selection[n] in document, but in findValue
	  if (p2 > selections.length) return "";
	  
	  // if selection.isEmpty get wordRangeAtCursor
	  else if (selections[p2 - 1].isEmpty) {
		const pos = selections[p2 - 1].active;
		const range = document.getWordRangeAtPosition(pos);
		return _modifyCaseOfFindCaptureGroup(p1, document.getText(range));
	  }
	  // escape regex characters above and below
	  else return _modifyCaseOfFindCaptureGroup(p1, document.getText(selections[p2 - 1]));
	});
	
	return findValue;
  }
  


/**
 * Apply case modifier, like '\\U' to capture groups $1, etc..
 * @param {Object} namedGroups
 * @param {Object} groups
 * @param {string} resolvedPathVariable
 * @returns {string} - case-modified text
 */
export function _applyCaseModifier(namedGroups: any, groups: any, resolvedPathVariable:string): string {

	let resolved = resolvedPathVariable;
	
	if (namedGroups?.path && namedGroups?.path.search(/\$\{\s*(line|match)(Index|Number)\s*\}/) !== -1) {
	  return resolvedPathVariable;
	}
	
	if (namedGroups?.caseModifier) {
	  if (namedGroups?.capGroup) {
		const thisCapGroup = namedGroups.capGroup.replace(/[${}]/g, "");
		if (groups[thisCapGroup]) resolved = groups[thisCapGroup];
	  }
	  else if (namedGroups?.caseTransform || namedGroups.conditional) { } // do nothing, resolved already = resolvedPathVariable
	  else return "";
	}
	else if (namedGroups?.pathCaseModifier) {
	  resolved = resolvedPathVariable;
	}
	
	switch (namedGroups?.caseModifier || namedGroups?.pathCaseModifier) {
	
	  case "\\U":
		resolved = resolved.toLocaleUpperCase();
		break;
  
	  case "\\u":
		resolved = resolved[0].toLocaleUpperCase() + resolved.substring(1);
		break;
  
	  case "\\L":
		resolved = resolved.toLocaleLowerCase();
		break;
  
	  case "\\l":
		resolved = resolved[0].toLocaleLowerCase() + resolved.substring(1);
		break;
  
	  default:
		break;
	}
	return resolved;
  }





/**
 * 
 * @param {string} caseModifier - e.g., \\U, \\u, etc.
 * @param {string} resolvedCaptureGroup
 * @returns {string}
 */
 export function _modifyCaseOfFindCaptureGroup (caseModifier:string, resolvedCaptureGroup:string) {

	if (!caseModifier) return resolvedCaptureGroup;
  
	switch (caseModifier) {
	  
	  case "\\U":
		resolvedCaptureGroup = resolvedCaptureGroup.toLocaleUpperCase();
		break;
  
	  case "\\u":
		resolvedCaptureGroup = resolvedCaptureGroup[0].toLocaleUpperCase() + resolvedCaptureGroup.substring(1);
		break;
  
	  case "\\L":
		resolvedCaptureGroup = resolvedCaptureGroup.toLocaleLowerCase();
		break;
  
	  case "\\l":
		resolvedCaptureGroup = resolvedCaptureGroup[0].toLocaleLowerCase() + resolvedCaptureGroup.substring(1);
		break;
  
	  default:
		break;
	}
  
	return resolvedCaptureGroup;
  }







  
// /**
//  * Build the replaceString by updating the setting 'replaceValue' to
//  * account for case modifiers, capture groups and conditionals
//  *
//  * @param {string} replaceValue
//  * @param {Object} args - keybinding/setting args
//  * @param {string} caller - find/replace/cursorMoveSelect
//  * 
//  * @returns {Promise<string>} - the resolved string
//  */
//  exports.resolveExtensionDefinedVariables = async function (replaceValue, args, caller) {

// 	if (replaceValue === "") return replaceValue;
  
// 	let vars;
// 	let re;
// 	let resolved;
  
// 	if (replaceValue !== null) {
  
// 	  vars = variables.getExtensionDefinedVariables().join("|").replaceAll(/([\$][\{])([^\}]+)(})/g, "\\$1\\s*$2\\s*$3");
// 	  re = new RegExp(`(?<pathCaseModifier>\\\\[UuLl])?(?<extensionVars>${ vars })`, 'g');
	
// 	  resolved = replaceValue.replaceAll(re, function (match, p1, p2, offset, string, namedGroups) {
		
// 		const variableToResolve =  _resolveExtensionDefinedVariables(match, args, caller);
// 		return _applyCaseModifier(namedGroups, undefined, variableToResolve);
// 	  });
// 	};
// 	return resolved;
//   }
  
//   /**
//    * Build the replaceString by updating the setting 'replaceValue' to
//    * account for case modifiers, capture groups and conditionals
//    *
//    * @param {string} replaceValue
//    * @param {Object} args - keybinding/setting args
//    * @param {string} caller - find/replace/cursorMoveSelect
//    * @param {import("vscode").Selection} selection - the current selection
//    * 
//    * @returns {Promise<string>} - the resolved string
//    */
//   exports.resolveSearchPathVariables = async function (replaceValue, args, caller, selection) {
  
// 	if (replaceValue === "") return replaceValue;
  
// 	let identifiers;
// 	let re;
  
// 	if (replaceValue !== null) {
  
// 	  let vars = variables.getPathVariables().join("|").replaceAll(/([\$][\{])([^\}]+)(})/g, "\\$1\\s*$2\\s*$3");
// 	  vars = `(?<pathCaseModifier>\\\\[UuLl])?(?<path>${ vars })`;
  
// 	  re = new RegExp(`${ vars }`, "g");
// 	  identifiers = [...replaceValue.matchAll(re)];
// 	}
  
// 	if (!identifiers.length) return replaceValue;
  
// 	for (const identifier of identifiers) {
  
// 	  let resolved = "";
  
// 	  if (identifier.groups.path) {
// 		resolved = _resolvePathVariables(identifier.groups.path, args, caller, selection, null, null, null);
// 		if (identifier.groups.pathCaseModifier)
// 		  resolved = _applyCaseModifier(identifier.groups, identifiers, resolved);
// 	  }
  
// 	  replaceValue = replaceValue.replace(identifier[0], resolved);
// 	}  // end of identifiers loop
	
// 	return replaceValue;
//   }











// /**
//  * If the "filesToInclude/find/replace" entry uses a path variable(s) return the resolved value  
//  * 
//  * @param {string} variableToResolve - the "filesToInclude/find/replace" value 
//  * @param {Object} args -  keybinding/settings args
//  * @param {string} caller - if called from a find.parseVariables() or replace or filesToInclude 
//  * @param {import("vscode").Selection} selection - current selection
//  * @param {Object} match - the current match
//  * @param {number} selectionStartIndex - in the start index of this selection
//  * @param {number} matchIndex - which match is it
//  * 
//  * @returns {string} - the resolved path variable
//  */
//  function _resolvePathVariables (variableToResolve, args, caller, selection, match, selectionStartIndex, matchIndex) {

// 	const document = window.activeTextEditor.document;
	
// 	if (typeof variableToResolve !== 'string') return variableToResolve;
  
// 	selectionStartIndex = selectionStartIndex ?? 0;
// 	  const filePath = document.uri.path;
  
// 	  let relativePath;
// 	  if ((caller === "filesToInclude" || caller === "filesToExclude") && workspace.workspaceFolders.length > 1) {
// 		  relativePath = workspace.asRelativePath(document.uri, true);
// 		  relativePath = `./${ relativePath }`;
// 	  }
// 	  else relativePath = workspace.asRelativePath(document.uri, false);
  
// 	let resolved = variableToResolve;
// 	const namedGroups = resolved.match(/(?<pathCaseModifier>\\[UuLl])?(?<path>\$\{\s*.*?\s*\})/).groups;
  
// 	switch (namedGroups.path) {
  
// 	  case "${file}":  case "${ file }":
// 		if (os.type() === "Windows_NT") resolved = filePath.substring(4);
// 		else resolved = filePath;
// 		break;
  
// 	  case "${relativeFile}":	 case "${ relativeFile }":
// 		resolved = workspace.asRelativePath(document.uri, false);
// 		break;
  
// 	  case "${fileBasename}": case "${ fileBasename }":
// 		resolved = path.basename(relativePath);
// 		break;
	  
// 	  case "${fileBasenameNoExtension}": case "${ fileBasenameNoExtension }":
// 		resolved = path.basename(relativePath, path.extname(relativePath))
// 		break;
		
// 	  case "${fileExtname}": case "${ fileExtname }":   // includes the `.` unfortunately
// 		resolved = path.extname(relativePath);
// 		break;
		
// 	  case "${fileDirname}": case "${ fileDirname }":
// 		resolved = path.dirname(filePath);
// 		break;
  
// 	  case "${fileWorkspaceFolder}": case "${ fileWorkspaceFolder }":
// 		resolved = workspace.getWorkspaceFolder(document.uri).uri.path;
// 		break;
	   
// 	  case "${workspaceFolder}": case "${ workspaceFolder }":
// 		resolved = workspace.getWorkspaceFolder(document.uri).uri.path;
// 		break;
  
// 	  case "${relativeFileDirname}": case "${ relativeFileDirname }":
// 		resolved = path.dirname(workspace.asRelativePath(document.uri, false));
// 		// https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options :  
// 		// '.' or './' does nothing in the "files to exclude" input for some reason
// 		if (caller === "filesToExclude" && resolved === ".")
// 		  resolved = "**";
// 		break;
  
// 	  case "${workspaceFolderBasename}":  case "${ workspaceFolderBasename }":
// 		resolved = path.basename(workspace.getWorkspaceFolder(document.uri).uri.path);
// 		 break;
	   
// 	  case "${selectedText}":  case "${ selectedText }":
// 		if (selection.isEmpty) {
// 		  const wordRange = document.getWordRangeAtPosition(selection.start);
// 		  if (wordRange) resolved = document.getText(wordRange);
// 		  else resolved = '';
// 		  // resolved = document.getText(wordRange);
// 		}
// 		else resolved = document.getText(selection);
// 		break;
	   
// 	  case "${pathSeparator}": case "${ pathSeparator }":
// 		resolved = path.sep;
// 		break;
	   
// 	  case "${matchIndex}": case "${ matchIndex }":
// 		resolved = String(matchIndex);
// 		break;
	   
// 	  case "${matchNumber}": case "${ matchNumber }":
// 		resolved = String(matchIndex + 1);
// 		break;
		 
// 	   case "${lineIndex}": case "${ lineIndex }":    // 0-based
// 		 if (caller === "cursorMoveSelect" && args.restrict !== "document") resolved = String(match);
// 		 else if (caller === "cursorMoveSelect" && args.restrict === "document") resolved = resolved;
  
// 		 else if (caller !== "ignoreLineNumbers") {
// 		//  else if (caller !== "ignoreLineadasdbers") {
// 		   if (args.restrict === "selections") {
// 			 const line = document.positionAt(match.index + selectionStartIndex).line;
// 			 resolved = String(line);
// 		   }
// 		   else if (args.restrict === "next") {
// 			 resolved = String(document.positionAt(selectionStartIndex).line); //  works for wholeDocument
// 		   }
// 		   else if (args.restrict === "document") resolved = String(document.positionAt(match.index).line);
// 		   else resolved = String(selection.active.line); // line/once find/replace
// 		 }
// 		 // "ignoreLineNumbers" will pass through unresolved
// 		break;
  
// 	  case "${lineNumber}":  case "${ lineNumber }":   // 1-based
// 		if (caller === "cursorMoveSelect" && args.restrict !== "document") resolved = String(match + 1);
// 		else if (caller === "cursorMoveSelect" && args.restrict === "document") resolved = resolved;
  
// 		else if (caller !== "ignoreLineNumbers") {
// 		  if (args.restrict === "selections") {
// 			const line = document.positionAt(match.index + selectionStartIndex).line;
// 			resolved = String(line + 1);
// 		  }
// 		  else if (args.restrict === "next") {
// 			resolved = String(document.positionAt(selectionStartIndex).line + 1); //  works for wholeDocument
// 		  }
// 		  else if (args.restrict === "document") resolved = String(document.positionAt(match.index).line + 1); //  works for wholeDocument
// 		  else resolved = String(selection.active.line + 1); // line/once find/replace
// 		}
// 		// "ignoreLineNumbers" will pass through unresolved
// 		break;
  
// 	  case "${CLIPBOARD}": case "${ CLIPBOARD }":
// 		resolved = args.clipText;
// 		break;
  
// 	  default:
// 		break;
// 	 }
  
// 	  // escape .*{}[]?^$+|/ if using in a find
// 	if (!args.isRegex && caller === "find") return resolved.replaceAll(/([\.\*\?\{\}\[\]\^\$\+\|])/g, "\\$1");
// 	else if (!args.isRegex && caller === "findSearch") return resolved.replaceAll(/([\.\*\?\{\}\[\]\^\$\+\|])/g, "\\$1");
// 	// in case use " let re = /${selectedText}/" and selectedText, etc. has a / in it, then 
// 	else if (caller === "replace") return resolved.replaceAll(/([\\/])/g, "\\$1");
// 	else if (caller === "filesToInclude" && resolved === ".") return  "./";
	
// 	else return resolved;
//   };
  



/**
 * Resolve the matchIndex/Number variable.
 * 
 * @param {string} variableToResolve 
 * @param {number} replaceIndex  - for a find/replace/filesToInclude value?
 * @returns {string} - resolvedVariable with matchIndex/Number replaced
 */
 export function resolveMatchVariable(variableToResolve:string, replaceIndex:int) {
  
	if (typeof variableToResolve !== 'string') return variableToResolve;
  
	variableToResolve = variableToResolve.replaceAll(/\$\{\s*matchIndex\s*\}/g, String(replaceIndex));
	variableToResolve = variableToResolve.replaceAll(/\$\{\s*matchNumber\s*\}/g, String(replaceIndex + 1));
  
	return variableToResolve;
  }
  
  
  /**
   * Resolve thelineIndex/Number variable.
   * 
   * @param {string} variableToResolve 
   * @param {number} index  - match.index
   * @returns {string} - resolvedVariable with matchIndex/Number replaced
   */
  export function resolveLineVariable(variableToResolve:string, index:int) {
  
	const document = vscode.window.activeTextEditor!.document;
	
	if (typeof variableToResolve !== 'string') return variableToResolve;
  
	const line = document.positionAt(index).line;
  
	variableToResolve = variableToResolve.replaceAll(/\$\{\s*lineIndex\s*\}/g, String(line));
	variableToResolve = variableToResolve.replaceAll(/\$\{\s*lineNumber\s*\}/g, String(line + 1));
	return variableToResolve;
  }
  





  

// /**
//  * If the "filesToInclude/find/replace" entry uses a path variable(s) return the resolved value  
//  * 
//  * @param {string} variableToResolve - the "filesToInclude/find/replace" value 
//  * @param {Object} args -  keybinding/settings args
//  * @param {string} caller - if called from a find.parseVariables() or replace or filesToInclude 
//  * @returns {string} - the resolved path variable
//  */
// function _resolveExtensionDefinedVariables (variableToResolve, args, caller) {
  
// 	const document = window.activeTextEditor.document;
	
// 	if (typeof variableToResolve !== 'string') return variableToResolve;
	
// 	let resolved = variableToResolve;
	
// 	let testLineRE = /\$\{getTextLines:\(\s*(?<lineNumberOP>\d+(\s*[-+%*\/]?\s*\d+)?\s*)\)\}|\$\{getTextLines:\s*(?<lineNumberOnly>[-+]?\d+)\s*\}/;
// 	let lineTextMatch = variableToResolve.match(testLineRE);
	 
// 	if (lineTextMatch?.groups?.lineNumberOP) {      // '(23-1)'
// 	  // if eval is a negative number => wrap
// 	  const lineNumber = eval(lineTextMatch?.groups?.lineNumberOP);
// 	  if (lineNumber >= 0) resolved = document.lineAt(lineNumber).text;
// 	  else resolved = document.lineAt(document.lineCount + lineNumber).text;
// 	}
// 	else if (lineTextMatch?.groups?.lineNumberOnly) {      // '22'
// 	  if (Number(lineTextMatch?.groups?.lineNumberOnly) >= 0)
// 		resolved = document.lineAt(Number(lineTextMatch?.groups?.lineNumberOnly)).text;
// 	  else 
// 		resolved = document.lineAt(document.lineCount + Number(lineTextMatch?.groups?.lineNumberOnly)).text;
// 	}
	  
// 	else {
// 	  testLineRE = /\$\{getTextLines:(?<From>\d+)-(?<To>\d+)\}/;
// 	  lineTextMatch = variableToResolve.match(testLineRE);
// 	  if (lineTextMatch?.groups) {
// 		const lastChar = document.lineAt(Number(lineTextMatch.groups.To)).range.end.character;
// 		resolved = document.getText(new Range(Number(lineTextMatch.groups.From), 0, Number(lineTextMatch.groups.To), lastChar));
// 	  }
// 	  else {
// 		testLineRE = /\$\{getTextLines:(?<startL>\d+),(?<startCh>\d+),(?<endL>\d+),(?<endCh>\d+)\}/;
// 		lineTextMatch = variableToResolve.match(testLineRE);
// 		if (lineTextMatch?.groups)
// 		  resolved = document.getText(new Range(Number(lineTextMatch.groups.startL), Number(lineTextMatch.groups.startCh),
// 			Number(lineTextMatch.groups.endL), Number(lineTextMatch.groups.endCh)));
// 	  }
// 	}
  
// 	if (!lineTextMatch?.groups) {
  
// 	  const namedGroups = resolved.match(/(?<varCaseModifier>\\[UuLl])?(?<definedVars>\$\{\s*.*?\s*\})/).groups;
  
// 	  switch (namedGroups.definedVars) {
	  
// 		case "${getDocumentText}": case "${ getDocumentText }":
// 		  resolved = document.getText();
// 		  break;
	
// 		case "${resultsFiles}": case "${ resultsFiles }":
// 		  resolved = args.resultsFiles;
// 		  break;
	
// 		default:
// 		  break;
// 	  }
// 	}
  
// 	  // escape .*{}[]?^$ if using in a find or findSearch
// 	if (!args.isRegex && caller === "find") return resolved.replaceAll(/([\.\*\?\{\}\[\]\^\$\+\|])/g, "\\$1");
// 	else if (!args.isRegex && caller === "findSearch") return resolved.replaceAll(/([\.\*\?\{\}\[\]\^\$\+\|])/g, "\\$1");
  
// 	else if (caller === "filesToInclude" && resolved === ".") return  "./";
	
// 	else return resolved;
//   };