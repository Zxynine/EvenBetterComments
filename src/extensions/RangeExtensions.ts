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



















// 'sticky' flag is not yet supported :(
	const lineEndingRE = /([^\r\n]*)(\r\n|\r|\n)?/;
 

	export interface RangeDelta {
	  start: vscode.Position;
	  end: vscode.Position;
	  linesDelta: number;
	  endCharactersDelta: number; // delta for positions on the same line as the end position
	}
	
	/**
	 * @returns the Position (line, column) for the location (character position)
	 */
	function positionAt(text: string, offset: number) : vscode.Position {
	  if(offset > text.length) offset = text.length;
	  let line = 0;
	  let lastIndex = 0;
	  while(true) {
		const match = lineEndingRE.exec(text.substring(lastIndex));
		if (match) {
			if(lastIndex + match[1].length >= offset)
			return new vscode.Position(line, offset - lastIndex)
			lastIndex+= match[0].length;
		}
		++line;
	  }
	}
	
	/**
	 * @returns the lines and characters represented by the text
	 */
	export function toRangeDelta(oldRange:vscode.Range, text: string) : RangeDelta {
	  const newEnd = positionAt(text,text.length);
	  let charsDelta;
	  if(oldRange.start.line == oldRange.end.line)
		charsDelta = newEnd.character - (oldRange.end.character-oldRange.start.character);
	  else
		charsDelta = newEnd.character - oldRange.end.character;
	  
	  return {
		start: oldRange.start,
		end: oldRange.end,
		linesDelta: newEnd.line-(oldRange.end.line-oldRange.start.line),
		endCharactersDelta: charsDelta
	  };
	}
	
	export function rangeDeltaNewRange(delta: RangeDelta) : vscode.Range {
	  let x : number;
	  if (delta.linesDelta > 0) 
		x = delta.endCharactersDelta;
	  else if (delta.linesDelta < 0 && delta.start.line == delta.end.line + delta.linesDelta) 
		x = delta.end.character + delta.endCharactersDelta + delta.start.character;
	  else
		x = delta.end.character + delta.endCharactersDelta;
	  return new vscode.Range(delta.start, new vscode.Position(delta.end.line + delta.linesDelta, x));
	}
	
	function positionRangeDeltaTranslate(pos: vscode.Position, delta: RangeDelta) : vscode.Position {
	  if(pos.isBefore(delta.end))
		return pos;
	  else if (delta.end.line == pos.line) {
		let x = pos.character + delta.endCharactersDelta;
		if (delta.linesDelta > 0) 
		  x = x - delta.end.character;
		else if (delta.start.line == delta.end.line + delta.linesDelta && delta.linesDelta < 0) 
		  x = x + delta.start.character;
		return new vscode.Position(pos.line + delta.linesDelta, x);
	  }
	  else // if(pos.line > delta.end.line)
		return new vscode.Position(pos.line + delta.linesDelta, pos.character);
	}
	
	function positionRangeDeltaTranslateEnd(pos: vscode.Position, delta: RangeDelta) : vscode.Position {
	  if(pos.isBeforeOrEqual(delta.end))
		return pos;
	  else if (delta.end.line == pos.line) {
		let x = pos.character + delta.endCharactersDelta;
		if (delta.linesDelta > 0) 
		  x = x - delta.end.character;
		else if (delta.start.line == delta.end.line + delta.linesDelta && delta.linesDelta < 0) 
		  x = x + delta.start.character;
		return new vscode.Position(pos.line + delta.linesDelta, x);
	  }
	  else // if(pos.line > delta.end.line)
		return new vscode.Position(pos.line + delta.linesDelta, pos.character);
	}
	
	export function rangeTranslate(range: vscode.Range, delta: RangeDelta) {
	  return new vscode.Range(
		positionRangeDeltaTranslate(range.start, delta),
		positionRangeDeltaTranslateEnd(range.end, delta)
	  )
	}
	
	export function rangeContains(range: vscode.Range, pos: vscode.Position, exclStart=false, inclEnd=false) {
	  return range.start.isBeforeOrEqual(pos)
		&& (!exclStart || !range.start.isEqual(pos))
		&& ((inclEnd &&  range.end.isEqual(pos)) || range.end.isAfter(pos));
	}
	
	export function maxPosition(x: vscode.Position, y: vscode.Position) {
	  if(x.line < y.line)
		return x;
	  if(x.line < x.line)
		return y;
	  if(x.character < y.character)
		return x;
	  else
		return y;
	}







	
export const rangeUpdate = (e: vscode.TextEditor, d: vscode.TextDocument, index: number) => {
    if (index === -1) {
        return new Range(d.positionAt(0), d.lineAt(d.lineCount - 1).range.end)
    } else {
        let sel = e.selections[index];
        return new Range(sel.start, sel.end);
    }
}




export const normalizeRanges = (selections: vscode.Range[]) => normalizeRangesGeneric(selections, vscode.Range);
export const normalizeSelections = (selections: vscode.Selection[]) => normalizeRangesGeneric(selections, vscode.Selection);

export function normalizeRangesGeneric<T extends vscode.Range>(selections: T[], TT: { new(anchor: vscode.Position, active: vscode.Position) : T}) : T[] {
	const sorted = selections
		  .slice(0,selections.length)
		.sort((x,y) => x.start.isBefore(y.start) ? -1 : x.start.isAfter(y.start) ? 1 : x.end.isBefore(y.start) ? -1 : x.end.isAfter(y.end) ? 1 : 0);
		const Shifted = sorted.shift();

	  const results = (Shifted)? [Shifted] : [];
	  let currentIdx = 0;
	  for(let idx = 0; idx < sorted.length; ++idx) {
		  if(sorted[idx].start.isBeforeOrEqual(results[currentIdx].end))
			  results[currentIdx] = new TT(results[currentIdx].start,sorted[idx].end)
		  else {
			  results.push(sorted[idx]);
			  ++currentIdx;
		  }
	  }
	  return results;
  }



	/**
 * A selection can be in any order in the document.
 * In some cases, we need our ranges ordered by how the order they appear in the document and not the order they were selected.
 * @param ranges 
 */
	export function makeOrderedRangesByStartPosition(ranges: vscode.Range[]) {
	const orderedRanges = [...ranges]
	orderedRanges.sort((a,b) => {
		if (a.start.isBefore(b.start)) 
			return -1
		if (a.start.isEqual(b.start))
			return 0
		else return 1
	})
	return orderedRanges;
}