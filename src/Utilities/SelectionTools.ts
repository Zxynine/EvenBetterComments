
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
    const selections = new Array<vscode.Selection>();
    lines.forEach(line => {
        selections.push(new vscode.Selection(line, 0, line, editor.document.lineAt(line).text.length)); 
    });
    editor.selections = selections;
    return editor.selections;
}




export function move(editor: vscode.TextEditor, toLine: number) {
    let currentCharacter = editor.selection.anchor.character;
    let newPosition = editor.selection.active.with(toLine, currentCharacter);

    editor.selection = new vscode.Selection(newPosition, newPosition);
    editor.revealRange(new vscode.Range(newPosition, newPosition));
  }