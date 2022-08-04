// import * as vscode from 'vscode';
// import { Configuration } from '../configuration';
// import { Parser } from '../parser';
// import { CommentLinkLensProvider, DocumentCommentLinkProvider } from "./CommentLinkProvider";
// import { LoadDocumentsAndGrammer, DocumentLoader, GetGetScopeAtAPI } from "../document";
// import { TMRegistry } from '../Tokenisation/TextmateLoader';
// import { highlighterDecoratiuon } from './DecorationProvider';















// async function HyperscopesDisplayScopes() {
// 	console.log("HyperScopes: show command run!");
// 	const activeTextEditor = vscode.window.activeTextEditor;
// 	if (activeTextEditor) {
// 		const token = api.getScopeAt(activeTextEditor.document, activeTextEditor.selection.active);
// 		if (token) {
// 			extensionOutputChannel.show(true);
// 			extensionOutputChannel.appendLine(token.GetTokenDisplayInfo());

// 			let counter = 0;
// 			activeTextEditor.setDecorations(highlighterDecoratiuon, []);
// 			const intervalId = setInterval(() => {
// 				if (counter++ > 5) clearInterval(intervalId);
// 				activeTextEditor.setDecorations(highlighterDecoratiuon, ((counter%2)===0)? [token.range] : []);
// 			}, 100);
// 		} else console.log("HyperScopes: Token not found.");
// 	}
// }
// async function HyperscopesDisplayScopesLine() {
// 	console.log("HyperScopes: show line command run!");
// 	const activeTextEditor = vscode.window.activeTextEditor;
// 	if (activeTextEditor) {
// 		const tokenArray = api.getScopeLine(activeTextEditor.document, activeTextEditor.selection.active);
// 		if (tokenArray) {
// 			const highlightRange : vscode.Range[] = [];
// 			tokenArray.forEach(token => {
// 				if (token) highlightRange.push(activeEditor.document.lineAt(token.range.start).range)
// 			});
// 			if (highlightRange.length) {
// 				extensionOutputChannel.show(true);
// 				for (const token of tokenArray) if (token) extensionOutputChannel.appendLine(token.GetTokenDisplayInfo());

// 				let counter = 0;
// 				activeTextEditor.setDecorations(highlighterDecoratiuon, []);
// 				const intervalId = setInterval(() => {
// 					if (counter++ > 5) clearInterval(intervalId);
// 					activeTextEditor.setDecorations(highlighterDecoratiuon, ((counter%2)===0)? highlightRange : []);
// 				}, 100);

// 			}
// 		}
// 	}
// }