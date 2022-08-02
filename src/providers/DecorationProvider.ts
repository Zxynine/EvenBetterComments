
import * as vscode from 'vscode';






export const hiddenCommentDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{ 
	color: "transparent", backgroundColor: "transparent", opacity: "0.0"
});


export const linkedCommentDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{ 
	color: "#FF3399FF", backgroundColor: "transparent", 
	textDecoration : "underline"
});



export const highlighterDecoratiuon = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
	borderWidth: '4px', borderRadius: '4px',
	// this color will be used in light color themes
	light: { backgroundColor: 'yellow', color: 'black' },
	// this color will be used in dark color themes
	dark: { backgroundColor: 'yellow', color: 'black' }
});



export function CreateDecoration(colour:string, backgroundColour:string, overline=false, strikethrough=false, underline=false, bold=false, italic=false) {
	let options: vscode.DecorationRenderOptions = { color: colour, backgroundColor: backgroundColour };

	// ? the textDecoration is initialised to empty so we can concat a preceeding space on it
	options.textDecoration = "";

	//TODO: add line styles like dotted wavy etc... - https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
	if (overline) options.textDecoration += " overline";
	if (strikethrough) options.textDecoration += "line-through";
	if (underline) options.textDecoration += " underline";
	if (bold) options.fontWeight = "bold";
	if (italic) options.fontStyle = "italic";

	return vscode.window.createTextEditorDecorationType(options);
}