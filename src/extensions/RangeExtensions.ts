import { Range } from "vscode";
import * as vscode from 'vscode';


export { };






declare module 'vscode' {
    interface Range {
		/** Returns the number of lines spanned by the range. (end.line - start.line)*/
		readonly lineCount : number;

		ToSelection(this:Range): vscode.Selection;
    }

	namespace Range {
		function GetRangeInArray(ranges: Range[], position: vscode.Position): Range|undefined;
	}
}



// Range.prototype.lineCount = function (this : Range) {return (this.end.line - this.start.line);};


Object.defineProperty(Range.prototype, "lineCount", {
    get (this: Range) {return (this.end.line - this.start.line);},
    enumerable: false,
    configurable: true
}); 








export const EMPTY_RANGE = new vscode.Range(new vscode.Position(0,0), new vscode.Position(0,1));


//Range extentions#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Range.prototype.ToSelection = function(this:Range): vscode.Selection {
	return new vscode.Selection(this.start, this.end);
}






//https://github.com/d-akara/vscode-extension-common/blob/master/src/EditorFunctions.ts





//Static extentions#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Range.GetRangeInArray = function(ranges: Range[], position:vscode.Position): Range|undefined {
	for (let i=0; i<ranges.length; ++i) {
		if (ranges[i].contains(position)) return ranges[i];
	}
	return undefined;
}

