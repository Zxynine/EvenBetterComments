import { TextEditor } from "vscode";
import * as vscode from 'vscode';


export { };






declare module 'vscode' {
	class TextEditor implements vscode.TextEditor {}
    interface TextEditor {
		GetFullRange(): vscode.Range;

    }


	
}





//Instance Extentions#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
vscode.TextEditor.prototype.GetFullRange = function (this:TextEditor): vscode.Range {
	if (this.document.lineCount > 0) {
		const lineCount = this.document.lineCount - 1;
		return new vscode.Selection(0, 0, lineCount, this.document.lineAt(lineCount).text.length);
	} else return new vscode.Selection(0, 0, 0, 0);
}



//Static Extentions#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//https://github.com/qcz/vscode-text-power-tools/blob/master/src/helpers/vsCodeHelpers.ts#L13