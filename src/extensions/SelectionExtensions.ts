import { Selection, Range } from "vscode";
// import * as vscode from 'vscode';


export { };






declare module 'vscode' {
    interface Selection {
		/** Returns the number of lines spanned by the range. (end.line - start.line)*/
		readonly lineCount : number;

		ToRange(this:Selection): Range;
		
    }


	namespace Selection {
		function SortByPosition(selections: Selection[]): Selection[];
		function FromRanges(ranges: Range[]): Selection[];
	}
}



// Range.prototype.lineCount = function (this : Range) {return (this.end.line - this.start.line);};


Object.defineProperty(Selection.prototype, "lineCount", {
    get (this: Selection) {return (this.end.line - this.start.line);},
    enumerable: false,
    configurable: true
}); 


Selection.prototype.ToRange = function (this:Selection) {
	return new Range(this.start, this.end);
}






//Range extentions#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Selection.SortByPosition = function (selections: Selection[]): Selection[] {
	selections.sort((a, b) => {
		if (a.start.line < b.start.line) {
			return -1;
		} else if (b.start.line < a.start.line) {
			return 1;
		} else if (a.start.character < b.start.character) {
			return -1;
		} else if (b.start.character < a.start.character) {
			return 1;
		} else {
			return 0;
		}
	});
	return selections;
}



Selection.FromRanges = function (ranges: Range[]) {
	return ranges.map(range=> new Selection(range.start, range.end))
}


// https://github.com/d-akara/vscode-extension-common/blob/master/src/EditorFunctions.ts

