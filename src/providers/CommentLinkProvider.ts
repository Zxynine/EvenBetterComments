import {
	CodeLensProvider,
	HoverProvider,
	// DocumentLinkProvider,
	// DocumentLink,
	TextDocument,
	CodeLens,
	Range,
	Command,
	Uri,
	workspace,
	CancellationToken,
	Hover,
	Position,
	ProviderResult,
	MarkdownString,
} from "vscode";
import { resolve, join, dirname } from "path";
import { lstatSync } from "fs";
import { homedir } from "os";
	
const LINK_REGEX = /^(\.{1,2}[\/\\])?(.+?)$/;
	





//?.....................FindLinksInDoc..................................\\

const commentRegex = /^\*|^\/\/|^\/\*|^\#|^<!--/;
// const URLRegex = /[a-zA-z0-9.-_~+#,%&=*;:@]/

const isComment = (line: string) => line.replace(/ /g, "").match(commentRegex);

export const findLinksInLine = (line: string) => {
	const result: string[] = [];

	const cleanLine = line.split(/\r?\n/)[0];
	const lineMatchRegex = /\[\[.*?\]\]/g;
	if (isComment(cleanLine)) {
		line.match(lineMatchRegex)?.forEach((match) => 
			result.push(match.replace(/(\[|\])/g, ""))
		);
	}
	return result;
}

const findLinksInDoc = (doc: string) => {
	const result: {lN:number, str:string}[] = [];

	const splitDoc = doc.split(/\r?\n/);
	const lineMatchRegex = /\[\[.*?\]\]/g;
	splitDoc.forEach((line, lineNumber) => {
		if (!isComment(line)) return;
		line.match(lineMatchRegex)?.forEach((match) => 
			result.push({ lN: lineNumber, str: match.replace(/(\[|\])/g, "") })
		);
	});
	return result;
};

export const getLinksRanges = (doc:string) => {
	const result: Range[] = [];
	
	const splitDoc = doc.split(/\r?\n/);
	splitDoc.forEach((line, lineNumber) => {
		if (!isComment(line)) return;
		// console.log("Found comment line: " + line);
		const indexedMatch = /\[(\[.*?\])\]/g;
		for (let match: RegExpExecArray|null; (match = indexedMatch.exec(line));) {
			// console.log("Found comment link line: " + line, "\n", match);
			result.push(new Range(lineNumber, match.index+1, lineNumber, match.index-1 + match[0].length));
		}
	});
	return result;
}


//?....................................................................\\
//TODO: implement caching for document links/paths

export class CommentLinkHoverProvider implements HoverProvider {
	provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover>|undefined {
		if (document.uri.scheme === "output") return undefined;
		
		const workspacePath = DocumentTools.GetWorkspacePath(document);
		const basePath = DocumentTools.GetBasePath(document);
	
		const line = document.lineAt(position).text;
		if (!isComment(line)) return;
		
		
		const lineMatchRegex = /\[(\[.*?\])\]/g;
		for (let match: RegExpExecArray|null; (match = lineMatchRegex.exec(line));) {
			// console.log("Found comment hover link line: " + line, "\n", match, range);
			if ((match.index) < position.character && position.character < (match.index+match[0].length)) {
				const cleanedLine = match[0].replace(/(\[|\])/g, "");
				const components = LINK_REGEX.exec(cleanedLine)!;
				const filePath = components[2];
				const relativeFolder = components[1];
				const fullPath = (relativeFolder
					? resolve(basePath, relativeFolder, filePath)
					: resolve(workspacePath, filePath)
				);
				// Don't show the codelens if the file doesn't exist
				if (!DocumentTools.FileExists(fullPath)) return;
				
				const myContent = new MarkdownString(`[Open: ${cleanedLine}](${DocumentTools.GetFileUri(fullPath)} "Open ${DocumentTools.GetFileFsPath(filePath)}")`);
				// Command Uris are disabled by default for security reasons.
				// If you set this flag, make sure your content is not constructed using untrusted/unsanitized text.
				myContent.isTrusted = true;
				
				const matchRange = new Range(position.line, match.index, position.line, match.index+match[0].length);
				return new Hover(myContent, matchRange);

			}

		}
		return undefined;

	}
}



export class CommentLinkProvider implements CodeLensProvider {
	// Each provider requires a provideCodeLenses function which will give the various documents
	// the code lenses
	async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
		if (document.uri.scheme === "output") return [];
		
		const workspacePath = DocumentTools.GetWorkspacePath(document);
		const basePath = DocumentTools.GetBasePath(document);
	
		
		
		const lenses: CodeLens[] = [];
		
		const matches = findLinksInDoc(document.getText());
		matches.forEach((match) => {
			const components = LINK_REGEX.exec(match.str)!;
			const filePath = components[2];
			const relativeFolder = components[1];
			const fullPath = (relativeFolder
				? resolve(basePath, relativeFolder, filePath)
				: resolve(workspacePath, filePath)
			);
			// Don't show the codelens if the file doesn't exist
			if (!DocumentTools.FileExists(fullPath)) return;
			
			const thisMatchRange = new Range(match.lN,0, match.lN,0);
			lenses.push(new CodeLens(thisMatchRange, <Command>{
				command: "vscode.open",
				title: `Open ${match.str}`,
				arguments: [DocumentTools.GetFileUri(fullPath)],
			}));
		});
	
		return lenses;
	}
}

				
//https://github.com/usernamehw/vscode-commands/blob/master/src/documentLinksProvider.ts



// export class DocumentCommentLinkProvider implements DocumentLinkProvider {
// 	static readonly regex = /@([a-z\d._-]+)(\?([^@]+))?@/ig;

// 	// Each provider requires a provideCodeLenses function which will give the various documents
// 	// the code lenses
// 	async provideDocumentLinks(document: TextDocument) {
// 		if (document.uri.scheme === "output") return [];
		
// 		const workspacePath = DocumentTools.GetWorkspacePath(document);
// 		const basePath = DocumentTools.GetBasePath(document);

// 		const links: DocumentLink[] = [];

// 		const matches = findLinksInDoc(document.getText());
// 		matches.forEach((match) => {
// 			const components = LINK_REGEX.exec(match.str)!;
// 			const filePath = components[2];
// 			const relativeFolder = components[1];
		
// 			const fullPath = (relativeFolder
// 				? resolve(basePath, relativeFolder, filePath)
// 				: resolve(workspacePath, filePath)
// 				);
// 				// Don't show the codelens if the file doesn't exist
// 				if (!DocumentTools.FileExists(fullPath)) return;
			
// 			matches.push({
// 				range: new Range(i, match.index, i, match[0].length + match.index),
// 				target: Uri.from({
// 					scheme: env.uriScheme,
// 					authority: Constants.ExtensionId,
// 					query: match[1],
// 					fragment: match[3],
// 				}),
// 				tooltip: 'Custom command.',
// 			});
// 		});
// 		return matches;
// 	}
// }

				






				

class DocumentTools {
	static readonly commentRegex = /^\*|^\/\/|^\/\*|^\#|^<!--/;
	static readonly newlineRegex = /\r?\n/;
	static GetWorkspacePath = (document:TextDocument):string => workspace.getWorkspaceFolder(document.uri)?.uri?.fsPath ?? "";
	static GetRelativeFolder = (filePath:string):string => workspace.asRelativePath(dirname(filePath)); //Get the relative path to the workspace folder  
	static GetBasePath = (document:TextDocument):string => join(document.uri.fsPath, "..");
	static SplitDocument = (document:TextDocument):Array<string> => document.getText().split(DocumentTools.newlineRegex);
	static FileExists = (filePath:string):boolean => lstatSync(filePath).isFile();
	static GetFileUri = (filePath:string):Uri => Uri.file(filePath);
	static GetFileFsPath = (filePath:string):string => Uri.parse(filePath).fsPath;
	static GetFullRange = (document:TextDocument):Range => new Range(0, 0, document.lineCount, 0);
}









// private static getDocumentWorkspaceFolder(): string | undefined {
// 	const fileName = vscode.window.activeTextEditor?.document.fileName;
// 	return (vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).filter((fsPath) => fileName?.startsWith(fsPath))[0]);
// }

	


	
/**
 * Exapnds ~ to homedir in non-Windows platform
 */
export function resolveHomeDir(inputPath: string): string {
	return (inputPath.trim() && inputPath.startsWith('~')) ? join(homedir(),inputPath.substring(1)) : inputPath;
}















/**
 * Returns a Code Lens with a position and a command.
 * @param position A position to create Code Lens on.
 * @param command A command to assign to Code Lens.
*/
function createCodeLens(position: Position, command: Command): CodeLens {
	return new CodeLens(new Range(position, position), command);
}

/**
 * Returns Code Lenses with given positions and a command.
 * @param positions Positions to create Code Lenses on.
 * @param command A command to assign to Code Lenses.
*/
function createCodeLenses(positions: Position[], command: Command): CodeLens[] {
	return positions.map(position => createCodeLens(position, command));
}

export {
    createCodeLens,
    createCodeLenses
};