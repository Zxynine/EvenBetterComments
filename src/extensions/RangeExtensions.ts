import { Range } from "vscode";
export { };









declare module 'vscode' {
    interface Range {
		/** Returns the number of lines spanned by the range. (end.line - start.line)*/
		readonly lineCount : number;
    }
}



// Range.prototype.lineCount = function (this : Range) {return (this.end.line - this.start.line);};


Object.defineProperty(Range.prototype, "lineCount", {
    get (this: Range) {return (this.end.line - this.start.line);},
    enumerable: false,
    configurable: true
}); 