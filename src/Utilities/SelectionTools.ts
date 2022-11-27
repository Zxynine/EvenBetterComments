
import * as vscode from 'vscode';













/**
 * Returns the Position of the cursor in the editor. Supports multicursor
 * @export
 * @param {TextEditor} editor The editor to get the cursor position from
 * @return {*}  {Position[]}
 */
 export function getCursorPosition(editor: vscode.TextEditor): vscode.Position[] {
    return editor.selections.map(Selection => Selection.active);
}

/**
 * Returns the Position of the cursor in the editor. Supports multicursor
 * @export
 * @param {TextEditor} editor The editor to get the cursor position from
 * @return {*}  {Position[]}
 */
 export function getCursorLine(editor: vscode.TextEditor): int[] {
    return editor.selections.map(Selection => Selection.active.line);
}


export function getSelectionString (editor : vscode.TextEditor) {
	return editor.document.getText(editor.selection);
}




export function setSelectionString (editor : vscode.TextEditor, theString: string) {
	editor.edit(editBuilder => editBuilder.replace(editor.selection, theString));
}


export function selectWordAtCursorPosition(editor: vscode.TextEditor): boolean {
    if (!editor.selection.isEmpty) return true;    

    const cursorWordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
    if (!cursorWordRange) {
        return false;
    } else {
		editor.selection = new vscode.Selection(cursorWordRange.start, cursorWordRange.end);
		return true;            
	}
}



export function selectLines(editor: vscode.TextEditor, lines: number[]): readonly vscode.Selection[] {
    return editor.selections = lines.map(line => new vscode.Selection(line, 0, line, editor.document.lineAt(line).text.length));
}




export function move(editor: vscode.TextEditor, toLine: number) {
    let currentCharacter = editor.selection.anchor.character;
    let newPosition = editor.selection.active.with(toLine, currentCharacter);

    editor.selection = new vscode.Selection(newPosition, newPosition);
    editor.revealRange(new vscode.Range(newPosition, newPosition));
  }






export const sortSelections = function(selections: readonly vscode.Selection[]) {
	return [...selections].sort((a, b) => a.start.compareTo(b.start));
};

export const makeIndexOfSortedSelections = function(selections: readonly vscode.Selection[]) {
	const indices = Array.from({ length: selections.length }, (k,v) => v);
	return indices.sort((a, b) => selections[a].start.compareTo(selections[b].start));
};

export const isEqualSelections = function(selections1: readonly vscode.Selection[], selections2: readonly vscode.Selection[]) {
	return (selections1.length === selections2.length &&
		selections1.every(
			(sel1, i) => (
				sel1.anchor.isEqual(selections2[i].anchor) &&
				sel1.active.isEqual(selections2[i].active)
			)
		)
	);
};




export function equalPositions(positions1: vscode.Position[], positions2: vscode.Position[]): boolean {
	if (positions1.length !== positions2.length) return false;
	return positions1.every((p1, i) => p1.isEqual(positions2[i]!));
}




// https://github.com/tshino/vscode-kb-macro/blob/main/src/util.js
// const makeSelectionsAfterTyping = function(sortedChanges) {
// 	let lineOffset = 0, lastLine = 0, characterOffset = 0;
// 	const newSelections = sortedChanges.map(({ range, text }) => {
// 		const numLF = Array.from(text).filter(ch => ch === '\n').length;
// 		if (lastLine !== range.start.line) {
// 			characterOffset = 0;
// 		}
// 		lineOffset += numLF;
// 		if (numLF === 0) {
// 			characterOffset += text.length;
// 		} else {
// 			const lenLastLine = text.length - (text.lastIndexOf('\n') + 1);
// 			characterOffset = lenLastLine - range.start.character;
// 		}
// 		const newPos = new vscode.Position(
// 			range.start.line + lineOffset,
// 			range.start.character + characterOffset
// 		);
// 		lineOffset -= range.end.line - range.start.line;
// 		lastLine = range.end.line;
// 		characterOffset -= range.end.character - range.start.character;
// 		return new vscode.Selection(newPos, newPos);
// 	});
// 	return newSelections;
// };


export const makeCommandSpec = function(args: any) {
	if (!args || !args.command || typeof(args.command) !== 'string') {
		return null;
	}
	const spec : any = {
		command: args.command
	};
	if ('args' in args) {
		spec.args = args.args;
	}
	if ('await' in args) {
		if (typeof(args['await']) !== 'string') {
			return null;
		}
		spec['await'] = args['await'];
	}
	if ('record' in args) {
		if (typeof(args.record) !== 'string') {
			return null;
		}
		spec.record = args.record;
	}
	return spec;
};













export class MarkRing {
	private maxNum = 16;
	private ring: Array<readonly vscode.Position[]>;
	private pointer: number | null;
  
	constructor(maxNum?: number) {
	  if (maxNum) {
		this.maxNum = maxNum;
	  }
  
	  this.pointer = null;
	  this.ring = [];
	}
  
	public push(marks: readonly vscode.Position[], replace = false): void {
	  if (replace) {
		this.ring[0] = marks;
	  } else {
		this.ring = [marks].concat(this.ring);
		if (this.ring.length > this.maxNum) {
		  this.ring = this.ring.slice(0, this.maxNum);
		}
	  }
	  this.pointer = 0;
	}
  
	public getTop(): readonly vscode.Position[] | undefined {
	  if (this.pointer == null || this.ring.length === 0) {
		return undefined;
	  }
  
	  return this.ring[this.pointer];
	}
  
	public pop(): readonly vscode.Position[] | undefined {
	  if (this.pointer == null || this.ring.length === 0) {
		return undefined;
	  }
  
	  const ret = this.ring[this.pointer];
  
	  this.pointer = (this.pointer + 1) % this.ring.length;
  
	  return ret;
	}
  }








  
export function revealPrimaryActive(textEditor: vscode.TextEditor): void {
	return textEditor.revealRange(new vscode.Range(textEditor.selection.active, textEditor.selection.active));
  }


  
export function getNonEmptySelections(textEditor: vscode.TextEditor): vscode.Selection[] {
	return textEditor.selections.filter((selection) => !selection.isEmpty);
  }
  
  export function makeSelectionsEmpty(textEditor: vscode.TextEditor): void {
	textEditor.selections = textEditor.selections.map((selection) => new vscode.Selection(selection.active, selection.active));
  }

  
enum RecenterPosition {
	Middle,
	Top,
	Bottom,
  }
  
  export class RecenterTopBottom {
	public readonly id = "recenterTopBottom";
  
	private recenterPosition: RecenterPosition = RecenterPosition.Middle;
  
	public execute(textEditor: vscode.TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): void {
	  const activeRange = new vscode.Range(textEditor.selection.active, textEditor.selection.active);
  
	  switch (this.recenterPosition) {
		case RecenterPosition.Middle: {
		  textEditor.revealRange(activeRange, vscode.TextEditorRevealType.InCenter);
		  this.recenterPosition = RecenterPosition.Top;
		  break;
		}
		case RecenterPosition.Top: {
		  textEditor.revealRange(activeRange, vscode.TextEditorRevealType.AtTop);
		  this.recenterPosition = RecenterPosition.Bottom;
		  break;
		}
		case RecenterPosition.Bottom: {
		  // TextEditor.revealRange does not support to set the cursor at the bottom of window.
		  // Therefore, the number of lines to scroll is calculated here.
		  const visibleRange = textEditor.visibleRanges[0];
		  if (visibleRange == null) {
			return;
		  }
		  const visibleTop = visibleRange.start.line;
		  const visibleBottom = visibleRange.end.line;
		  const visibleHeight = visibleBottom - visibleTop;
  
		  const current = textEditor.selection.active.line;
  
		  const nextVisibleTop = Math.max(current - visibleHeight, 1);
  
		  // Scroll so that `nextVisibleTop` is the top of window
		  const p = new vscode.Position(nextVisibleTop, 0);
		  const r = new vscode.Range(p, p);
		  textEditor.revealRange(r);
  
		  this.recenterPosition = RecenterPosition.Middle;
		  break;
		}
	  }
	}
  
	public onDidInterruptTextEditor(): void {
	  this.recenterPosition = RecenterPosition.Middle;
	}
  }


  
export class DeleteBlankLines {
	public readonly id = "deleteBlankLines";
  
	public async execute(
	  textEditor: vscode.TextEditor,
	  isInMarkMode: boolean,
	  prefixArgument: number | undefined
	): Promise<void> {
	  const document = textEditor.document;
  
	  for (let iSel = 0; iSel < textEditor.selections.length; ++iSel) {
		// `selection[iSel]` is mutated during the loop,
		// therefore, each selection must be obtained
		// by indexing on each iteration.
		// That's why for-of loop is not appropriate here.
		const selection = textEditor.selections[iSel]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  
		const curLineNum = selection.active.line;
		const curLine = document.lineAt(curLineNum);
		const subsequentText = curLine.text.substr(selection.active.character);
  
		const cursorIsAtTheEndOfLine = subsequentText.search(/\S/) === -1;
		if (!cursorIsAtTheEndOfLine) {
		  break;
		}
  
		// Search for the following empty lines and get the final line number
		let followingLineOffset = 0;
		while (
		  curLineNum + followingLineOffset + 1 < document.lineCount &&
		  document.lineAt(curLineNum + followingLineOffset + 1).isEmptyOrWhitespace
		) {
		  followingLineOffset++;
		}
  
		// Search for the previous empty lines and get the first line number
		let previousLineOffset = 0;
		while (
		  curLineNum - previousLineOffset - 1 >= 0 &&
		  document.lineAt(curLineNum - previousLineOffset - 1).isEmptyOrWhitespace
		) {
		  previousLineOffset++;
		}
  
		await textEditor.edit((editBuilder) => {
		  if (followingLineOffset > 0) {
			// Following empty lines exist
			const finalFollowingEmptyLineNum = curLineNum + followingLineOffset;
  
			editBuilder.delete(
			  new vscode.Range(
				new vscode.Position(curLineNum + 1, 0),
				document.lineAt(finalFollowingEmptyLineNum).rangeIncludingLineBreak.end
			  )
			);
		  }
  
		  if (previousLineOffset > 0) {
			// Previous empty lines exist
			const firstPreviousEmptyLineNum = curLineNum - previousLineOffset;
  
			editBuilder.delete(
			  new vscode.Range(
				new vscode.Position(firstPreviousEmptyLineNum, 0),
				document.lineAt(curLineNum - 1).rangeIncludingLineBreak.end
			  )
			);
		  }
		});
	  }
	}
  }

























  export interface IKillRingEntity {
	type: string;
	isSameClipboardText(clipboardText: string): boolean;
	isEmpty(): boolean;
	asString(): string;
  }

  export enum AppendDirection {
	Forward,
	Backward,
  }
  
  interface IRegionText {
	text: string;
	range: vscode.Range;
  }
  
  class AppendedRegionTexts {
	/**
	 * This class represents a sequence of IRegionTexts appended by kill command.
	 * Each element come from one cursor (selection) at single kill.
	 */
	private regionTexts: IRegionText[];
  
	constructor(regionText: IRegionText) {
	  this.regionTexts = [regionText];
	}
  
	public append(another: AppendedRegionTexts, appendDirection: AppendDirection = AppendDirection.Forward) {
	  if (appendDirection === AppendDirection.Forward) {
		this.regionTexts = this.regionTexts.concat(another.regionTexts);
	  } else {
		this.regionTexts = another.regionTexts.concat(this.regionTexts);
	  }
	}
  
	public isEmpty() {
	  return this.regionTexts.every((regionText) => regionText.text === "");
	}
  
	public getAppendedText(): string {
	  return this.regionTexts.map((regionText) => regionText.text).join("");
	}
  
	public getLastRange(): vscode.Range {
	  return this.regionTexts[this.regionTexts.length - 1]!.range; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
  }
  
  export class EditorTextKillRingEntity implements IKillRingEntity {
	public readonly type = "editor";
	private regionTextsList: AppendedRegionTexts[];
  
	constructor(regionTexts: IRegionText[]) {
	  this.regionTextsList = regionTexts.map((regionText) => new AppendedRegionTexts(regionText));
	}
  
	public isSameClipboardText(clipboardText: string): boolean {
	  return this.asString() === clipboardText;
	}
  
	public isEmpty(): boolean {
	  return this.regionTextsList.every((regionTexts) => regionTexts.isEmpty());
	}
  
	// TODO: Cache the result of this method because it is called repeatedly
	public asString(): string {
	  const appendedTexts = this.regionTextsList.map((appendedRegionTexts) => ({
		range: appendedRegionTexts.getLastRange(),
		text: appendedRegionTexts.getAppendedText(),
	  }));
  
	  const sortedAppendedTexts = appendedTexts.sort((a, b) => {
		if (a.range.start.line === b.range.start.line) {
		  return a.range.start.character - b.range.start.character;
		} else {
		  return a.range.start.line - b.range.start.line;
		}
	  });
  
	  let allText = "";
	  sortedAppendedTexts.forEach((item, i) => {
		const prevItem = sortedAppendedTexts[i - 1];
		if (prevItem && prevItem.range.start.line !== item.range.start.line) {
		  allText += "\n" + item.text;
		} else {
		  allText += item.text;
		}
	  });
  
	  return allText;
	}
  
	public getRegionTextsList(): AppendedRegionTexts[] {
	  return this.regionTextsList;
	}
  
	public append(entity: EditorTextKillRingEntity, appendDirection: AppendDirection = AppendDirection.Forward): void {
	  const additional = entity.getRegionTextsList();
	  if (additional.length !== this.regionTextsList.length) {
		throw Error("Not appendable");
	  }
  
	  this.regionTextsList.map(
		// `additional.length === this.regionTextsList.length` has already been checked,
		// so noUncheckedIndexedAccess rule can be skipped here.
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		(appendedRegionTexts, i) => appendedRegionTexts.append(additional[i]!, appendDirection)
	  );
	}
  }

  export class ClipboardTextKillRingEntity implements IKillRingEntity {
	public readonly type = "clipboard";
	private text: string;
  
	constructor(clipboardText: string) {
	  this.text = clipboardText;
	}
  
	public isSameClipboardText(clipboardText: string): boolean {
	  return clipboardText === this.text;
	}
  
	public isEmpty(): boolean {
	  return this.text === "";
	}
  
	public asString(): string {
	return this.text;
	}
}

export type KillRingEntity = ClipboardTextKillRingEntity | EditorTextKillRingEntity;




export class KillRing {
	private killRing: Array<KillRingEntity>;
	private pointer: number | null;

	constructor(private maxNum = 60) {
		this.pointer = null;
		this.killRing = [];
	}

	public push(entity: KillRingEntity): void {
		this.killRing = [entity].concat(this.killRing);
		if (this.killRing.length > this.maxNum) {
			this.killRing = this.killRing.slice(0, this.maxNum);
		}
		this.pointer = 0;
	}

	public getTop(): KillRingEntity | undefined {
		if (this.pointer === null || this.killRing.length === 0) return undefined;

		return this.killRing[this.pointer];
	}

	public popNext(): KillRingEntity | undefined {
		if (this.pointer === null || this.killRing.length === 0) return undefined;

		this.pointer = (this.pointer + 1) % this.killRing.length;
		return this.killRing[this.pointer];
	}
}






//   export class AddSelectionToNextFindMatch extends EmacsCommand {
// 	public readonly id = "addSelectionToNextFindMatch";
  
// 	public execute(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
// 	  this.emacsController.enterMarkMode(false);
// 	  return vscode.commands.executeCommand<void>("editor.action.addSelectionToNextFindMatch");
// 	}
//   }
  
//   export class AddSelectionToPreviousFindMatch extends EmacsCommand {
// 	public readonly id = "addSelectionToPreviousFindMatch";
  
// 	public execute(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
// 	  this.emacsController.enterMarkMode(false);
// 	  return vscode.commands.executeCommand<void>("editor.action.addSelectionToPreviousFindMatch");
// 	}
//   }








//   export abstract class KillYankCommand extends EmacsCommand {
// 	protected killYanker: KillYanker;
  
// 	public constructor(emacsController: IEmacsController, killYanker: KillYanker) {
// 	  super(emacsController);
  
// 	  this.killYanker = killYanker;
// 	}
//   }


// https://www.emacswiki.org/emacs/KillingAndYanking#:~:text=The%20command%20for%20saving%20(copying,%27%20(%20%27M-k%27%20).


// export class CutLine extends KillYankCommand {
// 	public readonly id = "killLine";

// 	public execute(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
// 	const killWholeLine = Configuration.instance.killWholeLine;

// 	const ranges = textEditor.selections.map((selection) => {
// 		const cursor = selection.active;
// 		const lineAtCursor = textEditor.document.lineAt(cursor.line);

// 		if (prefixArgument !== undefined) {
// 		return new Range(cursor, new Position(cursor.line + prefixArgument, 0));
// 		}

// 		if (killWholeLine && cursor.character === 0) {
// 		return new Range(cursor, new Position(cursor.line + 1, 0));
// 		}

// 		const lineEnd = lineAtCursor.range.end;

// 		if (cursor.isEqual(lineEnd)) {
// 		// From the end of the line to the beginning of the next line
// 		return new Range(cursor, new Position(cursor.line + 1, 0));
// 		} else {
// 		// From the current cursor to the end of line
// 		return new Range(cursor, lineEnd);
// 		}
// 	});
// 	this.emacsController.exitMarkMode();
// 	return this.killYanker.kill(ranges).then(() => revealPrimaryActive(textEditor));
// 	}
// }

// export class CutWholeLine extends KillYankCommand {
// 	public readonly id = "killWholeLine";

// 	public execute(textEditor: TextEditor, isInMarkMode: boolean, prefixArgument: number | undefined): Thenable<void> {
// 	const ranges = textEditor.selections.map(
// 		(selection) =>
// 		// From the beginning of the line to the beginning of the next line
// 		new Range(new Position(selection.active.line, 0), new Position(selection.active.line + 1, 0))
// 	);
// 	this.emacsController.exitMarkMode();
// 	return this.killYanker.kill(ranges).then(() => revealPrimaryActive(textEditor));
// 	}
// }

// //Cutting
// export class CutRegion extends KillYankCommand {
// 	public readonly id = "killRegion";

// 	public async execute(
// 	textEditor: TextEditor,
// 	isInMarkMode: boolean,
// 	prefixArgument: number | undefined
// 	): Promise<void> {
// 	const selectionsAfterRectDisabled =
// 		this.emacsController.inRectMarkMode &&
// 		this.emacsController.nativeSelections.map((selection) => {
// 		const newLine = selection.active.line;
// 		const newChar = Math.min(selection.active.character, selection.anchor.character);
// 		return new vscode.Selection(newLine, newChar, newLine, newChar);
// 		});

// 	const ranges = getNonEmptySelections(textEditor);
// 	await this.killYanker.kill(ranges);
// 	if (selectionsAfterRectDisabled) {
// 		textEditor.selections = selectionsAfterRectDisabled;
// 	}
// 	revealPrimaryActive(textEditor);

// 	this.emacsController.exitMarkMode();
// 	this.killYanker.cancelKillAppend();
// 	}
// }

// // TODO: Rename to kill-ring-save (original emacs command name)
// export class CopyRegion extends KillYankCommand {
// 	public readonly id = "copyRegion";

// 	public async execute(
// 	textEditor: TextEditor,
// 	isInMarkMode: boolean,
// 	prefixArgument: number | undefined
// 	): Promise<void> {
// 	const ranges = getNonEmptySelections(textEditor);
// 	await this.killYanker.copy(ranges);
// 	this.emacsController.exitMarkMode();
// 	this.killYanker.cancelKillAppend();
// 	makeSelectionsEmpty(textEditor);
// 	revealPrimaryActive(textEditor);
// 	}
// }

// export class Paste extends KillYankCommand {
// 	public readonly id = "yank";

// 	public async execute(
// 	textEditor: TextEditor,
// 	isInMarkMode: boolean,
// 	prefixArgument: number | undefined
// 	): Promise<void> {
// 	this.emacsController.pushMark(textEditor.selections.map((selection) => selection.active));
// 	await this.killYanker.yank();
// 	this.emacsController.exitMarkMode();
// 	revealPrimaryActive(textEditor);
// 	}
// }

// export class PastePop extends KillYankCommand {
// 	public readonly id = "yankPop";

// 	public async execute(
// 	textEditor: TextEditor,
// 	isInMarkMode: boolean,
// 	prefixArgument: number | undefined
// 	): Promise<void> {
// 	await this.killYanker.yankPop();
// 	this.emacsController.exitMarkMode();
// 	revealPrimaryActive(textEditor);
// 	}
// }



export function insertSnippet(text: string) {
	return vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(text));
  }
  
export function insertBind(configChar: string) {
	// if(!config().disableRebindForEdit && config().rebind[configChar]) {
	//   insertSnippet(config().rebind[configChar]);
	// } else {
	insertSnippet(configChar);
	// }
}





export function getLines(selection: vscode.Selection): Array<vscode.TextLine> {
	const lines: Array<vscode.TextLine> = [];
	for (var i = selection.start.line; i < selection.end.line + 1; i++) {
	  lines.push(vscode.window.activeTextEditor!.document.lineAt(i));
	}
	return lines;
  }
  






export function sortAllSelections(selections: Array<vscode.Selection>) {
	return selections.sort((previous: vscode.Selection, next: vscode.Selection) : number => {
	const lineIsSmaller = previous.start.line < next.start.line;
	const lineIsEqual = previous.start.line === next.start.line;
	const characterIsSmaller = previous.start.character < next.start.character;
	const characterIsEqual = previous.start.character === next.start.character;
	if(lineIsEqual) {
		if(characterIsEqual) {
		return 0;
		} else if (characterIsSmaller) {
		return -1;
		} else {
		return 1;
		}
	} else if ( lineIsSmaller ) {
		return -1;
	} else {
		return 1;
	}
	});
}


export function nextToken(c: string|number) : string|number {
	if(typeof c === 'string') {
	  if( c === 'Z') {
		return 'A';
	  } else if (c === 'z') {
		return 'a';
	  } else {
		return String.fromCharCode(c.charCodeAt(0) + 1);
	  }
	} else {
	  return ++c;
	}
  }









// https://github.com/dbankier/vscode-quick-select/blob/master/src/extension.ts
//https://github.com/DavidBabel/clever-vscode/blob/master/src/services/selector.ts



function findOccurances(doc: vscode.TextDocument, line: number, char: string): Array<number> {
	var matches = (doc.lineAt(line).text + "hack").split(char).reduce((acc, p) => {
		var len = p.length + 1;
		if (acc.length > 0) len += acc[acc.length - 1];
		acc.push(len);
		return acc;
	}, new Array<number>());
	matches.pop();
	return matches;
}

  function findNext(doc: vscode.TextDocument, line: number, char: string, start_index: number = 0, nest_char: string|undefined = undefined, nested: number = 0): vscode.Position|undefined {
	if (line === doc.lineCount) { return undefined };
	var occurances = findOccurances(doc, line, char).filter(n => n >= start_index);
	var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n >= start_index) : [];
	var occurance_index = 0;
	var nests_index = 0;
	while ((occurance_index < occurances.length || nests_index < nests.length) && nested >= 0) {
	  if (occurances[occurance_index] < nests[nests_index] || !nests[nests_index]) {
		if (nested === 0) return new vscode.Position(line, occurances[occurance_index]);
		nested--
		occurance_index++;
	  } else if (nests[nests_index] < occurances[occurance_index] || !occurances[occurance_index]) {
		nested++;
		nests_index++;
	  }
	}
	return findNext(doc, ++line, char, 0, nest_char, nested);
  }
  
  function findPrevious(doc: vscode.TextDocument, line: number, char: string, start_index?: number, nest_char: string|undefined = undefined, nested: number = 0): vscode.Position|undefined {
	if (line === -1) return undefined
	if (start_index === undefined) { start_index = doc.lineAt(line).text.length; }
	var occurances = findOccurances(doc, line, char).filter(n => n <= start_index!);
	var nests = nest_char ? findOccurances(doc, line, nest_char).filter(n => n <= start_index!) : [];
	var occurance_index = occurances.length - 1;
	var nests_index = nests.length - 1;
	while ((occurance_index > -1 || nests_index > -1) && nested >= 0) {
	  if (occurances[occurance_index] > nests[nests_index] || !nests[nests_index]) {
		if (nested === 0) return new vscode.Position(line, occurances[occurance_index]);
		nested--
		occurance_index--;
	  } else if (nests[nests_index] > occurances[occurance_index] || !occurances[occurance_index]) {
		nested++;
		nests_index--;
	  }
	}
	return findPrevious(doc, --line, char, undefined, nest_char, nested);
  }
  
  function findSingleSelect(s: vscode.Selection, doc: vscode.TextDocument, char: string, outer?: boolean, multiline?: boolean) {
	let { line, character } = s.active;
	let matches = findOccurances(doc, line, char);
	let next = matches.find(a => a > character);
	let next_index = matches.indexOf(next!);
	let offset = outer ? char.length : 0;
	if (matches.length > 1 && matches.length % 2 === 0) {
	  // Jump inside the next matching pair
	  if (next === -1) { return s }
	  if (next_index % 2 !== 0) {
		next_index--;
	  }
	  //Automatically grow to outer selection
	  if (!outer &&
		new vscode.Position(line, matches[next_index]).isEqual(s.anchor) &&
		new vscode.Position(line, matches[next_index + 1] - 1).isEqual(s.end)) {
		offset = char.length
	  }
	  return new vscode.Selection(
		new vscode.Position(line, matches[next_index] - offset),
		new vscode.Position(line, matches[next_index + 1] - 1 + offset)
	  );
	} else if (multiline) {
	  let start_pos = findPrevious(doc, line, char, character) || new vscode.Position(line, matches[next_index])
	  if (!start_pos) { return s };
	  let end_pos: vscode.Position = findNext(doc, start_pos.line, char, start_pos.character + 1)!;
	  //Automatically grow to outer selection
	  if (!outer &&
		start_pos.isEqual(s.anchor) &&
		new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)) {
		offset = char.length
	  }
	  if (start_pos && end_pos) {
		start_pos = new vscode.Position(start_pos.line, start_pos.character - offset);
		end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + offset);
		return new vscode.Selection(start_pos, end_pos)
	  }
	}
	return s;
  
  }
  
  export function selectEitherQuote(updateSelect: boolean = true) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) { return; };
	let doc = editor.document
	let sel = editor.selections
	const selectionsResult = sel.map((s: vscode.Selection) => {
	  let selections = ['"', "'", "`"].map(char => findSingleSelect(s, doc, char, false, char === '`'))
		.filter(sel => sel !== s)
		.filter(sel => sel.start.isBeforeOrEqual(s.start) && sel.end.isAfterOrEqual(s.end))
		.sort((a, b) => a.start.isBefore(b.start) ? 1 : -1)
	  if (selections.length > 0) {
		return selections[0]
	  }
	  return s;
	})
  
	if (updateSelect) {
	  editor.selections = selectionsResult
	}
  
	return selectionsResult
  }
  
  interface MatchingSelectOptions { start_char: string, end_char: string, outer?: boolean }
  export function matchingSelect(
	{ start_char, end_char, outer = false }: MatchingSelectOptions,
	updateSelect: boolean = true
  ) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) { return; };
	let doc = editor.document
	let sel = editor.selections
	let success = false;
	let start_offset = outer ? start_char.length : 0;
	let end_offset = outer ? end_char.length : 0;
	const selections = sel.map(s => {
	  let { line, character } = s.active;
	  let starts = findOccurances(doc, line, start_char);
	  // let ends = findOccurances(doc, line, end_char);
	  let start = starts.find(a => a > character);
	  // let end = ends.find(a => a > character);
	  let start_index = starts.indexOf(start!);
	  // let end_index = ends.indexOf(end);
	  let start_pos: vscode.Position = findPrevious(doc, line, start_char, character, end_char) || new vscode.Position(line, starts[start_index]);
	  if (!start_pos) { return s };
	  let end_pos: vscode.Position = findNext(doc, start_pos.line, end_char, start_pos.character + 1, start_char)!;
	  if (start_pos && end_pos) {
		success = true;
		//Automatically grow to outer selection
		if (!outer &&
		  start_pos.isEqual(s.anchor) &&
		  new vscode.Position(end_pos.line, end_pos.character - 1).isEqual(s.end)) {
		  start_offset = start_char.length;
		  end_offset = end_char.length;
		}
		start_pos = new vscode.Position(start_pos.line, start_pos.character - start_offset);
		end_pos = new vscode.Position(end_pos.line, end_pos.character - 1 + end_offset);
  
		return new vscode.Selection(start_pos, end_pos)
	  }
	  return s;
	})
	if (updateSelect) {
	  editor.selections = selections
	  if (success && start_char === "<") {
		vscode.commands.executeCommand("editor.action.addSelectionToNextFindMatch")
	  }
	}
	return selections
  }

















interface IndexRange {
	start: number;
	end: number;
}

export class RangeBuilder {
	private indexRanges: IndexRange[];

	constructor(source: string) {
		let regex = /(.*)(\r?\n|$)/g;

		let indexRanges: IndexRange[] = [];

		while (true) {
			let groups = regex.exec(source);
			if (!groups) break;
			let lineText = groups[1];
			let lineEnding = groups[2];

			let lastIndex = regex.lastIndex - lineEnding.length;

			indexRanges.push({
				start: lastIndex - lineText.length,
				end: lastIndex
			});

			if (!lineEnding.length) {
				break;
			}
		}

		this.indexRanges = indexRanges;
	}

	getPosition(index: number): vscode.Position|undefined {
		let indexRanges = this.indexRanges;

		for (let i = 0; i < indexRanges.length; i++) {
			let indexRange = indexRanges[i];
			if (indexRange.end >= index) {
				if (indexRange.start <= index) {
					// Within range.
					return new vscode.Position(i, index - indexRange.start);
				} else {
					// End of line?
					let previousIndexRange = indexRanges[i - 1];
					return new vscode.Position(i, previousIndexRange.end - previousIndexRange.start + 1);
				}
			}
		}
		return undefined;
	}

	getRange(startIndex: number, endIndex: number): vscode.Range {
		let start = this.getPosition(startIndex)!;
		let end = this.getPosition(endIndex)!;
		return new vscode.Range(start, end);
	}
}

