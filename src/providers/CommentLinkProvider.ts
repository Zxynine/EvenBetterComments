import {
	CodeLensProvider,
	DocumentLinkProvider,
	DocumentLink,
	TextDocument,
	CodeLens,
	Range,
	Command,
	Uri,
	workspace,
} from "vscode";
import { resolve, join, dirname } from "path";
import { existsSync, lstatSync, Stats } from "fs";
import { homedir } from "os";
	
const LINK_REGEX = /^(\.{1,2}[\/\\])?(.+?)$/;
const SPLIT_LINES = /[\r\n]+/;
const CLEAN_LINK = /(\[|\])/g;




//?.....................FindLinksInDoc..................................\\
//TODO incorporate finding links into parser
const commentRegex = /^\*|^\/\/|^\/\*|^\#|^<!--/;
// const URLRegex = /[a-zA-z0-9.-_~+#,%&=*;:@]/
const lineMatchRegex = /\[\[.*?[./].*?\]\]/g;
const indexedLineMatchRegex = /\[(\[.*?[./].*?\])\]/g;

type LinkMatch = {
	lN:int, str:string
}

//TODO: use sementic tokens/parser to find comments.
const isComment = (line: string) => Boolean(line.replace(/\s/g, "").match(commentRegex));
// const isPath = (line: string) => Boolean(line.match(/.+[/.].*|.*[./].+/));

export const findLinksInLine = (line: string) => {
	const result: string[] = [];

	const cleanLine = line.split(SPLIT_LINES)[0];
	if (isComment(cleanLine)) {
		line.match(lineMatchRegex)?.forEach((match) => 
			result.push(match.replace(CLEAN_LINK, ""))
		);
	}
	return result;
}
export const findLinksInString = (str: string) => {
	const result: LinkMatch[] = [];

	const splitDoc = str.split(SPLIT_LINES);
	splitDoc.filter(isComment).forEach((line, lineNumber) => {
		line.match(lineMatchRegex)?.forEach((match) => 
			result.push({ lN: lineNumber, str: match.replace(CLEAN_LINK, "") })
		);
	});
	return result;
};

const findLinksInDoc = (doc: TextDocument) => {
	const result: LinkMatch[] = [];

	for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
		const line = doc.lineAt(lineNumber).text;
		if (!isComment(line)) continue;
		line.match(lineMatchRegex)?.forEach((match) => 
			result.push({ lN: lineNumber, str: match.replace(CLEAN_LINK, "") })
		);
	}
	return result;
};


export const getLinksRangesString = (str:string) => {
	const result: Range[] = [];
	
	const splitDoc = str.split(SPLIT_LINES);
	splitDoc.filter(isComment).forEach((line, lineNumber) => {
		for (let match: RegExpExecArray|null; (match = indexedLineMatchRegex.exec(line));) {
			result.push(new Range(lineNumber, match.index+1, lineNumber, match.index-1 + match[0].length));
		}
	});
	return result;
}


export const getLinksRangesDoc = (doc:TextDocument) => {
	const result: Range[] = [];
	
	const workspacePath = DocumentTools.GetWorkspacePath(doc);
	const basePath = DocumentTools.GetBasePath(doc);
	
	for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
		const line = doc.lineAt(lineNumber).text;
		if (!isComment(line)) continue;
		for (let match: RegExpExecArray|null; (match = indexedLineMatchRegex.exec(line));) {
			const fullPath = CreateFullPath(basePath,workspacePath, match[0].replace(CLEAN_LINK, ""));
			if (!fullPath || !DocumentTools.FileExists(fullPath)) continue;

			result.push(new Range(lineNumber, match.index+1, lineNumber, match.index-1 + match[0].length));
		}
	}
	return result;
}


export function getLinkMatchesDoc(doc:TextDocument) {
	const result: {lN:number, array:RegExpMatchArray}[] = [];

	for (let lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
		const line = doc.lineAt(lineNumber).text;
		if (!isComment(line)) continue;
		for (const match of line.matchAll(indexedLineMatchRegex)) {
			result.push({lN:lineNumber, array:match});
		}
	}
	return result;
}







export const LINK_REGEX2 = /^(\.{1,2}[/\\])?([^:#]+)?(:\d+|#[\w-]+)?$/;
export function createTarget(uri: Uri, line: number): Uri {
	return Uri.parse(`file://${uri.path}#${line}`);
}





//https://marketplace.visualstudio.com/items?itemName=Isotechnics.commentlinks&ssr=false#qna


//?....................................................................\\
//TODO: implement caching for document links/paths

function CreateFullPath(basePath:string, workspacePath:string, currentPath:string) {
	const components = LINK_REGEX.exec(currentPath);
	if (!components?.[2]) return null;
	const filePath = components[2];
	const relativeFolder = components[1];
	return (relativeFolder
		? resolve(basePath, relativeFolder, filePath)
		: resolve(workspacePath, filePath)
	);
}

//?....................................................................\\















export class CommentLinkLensProvider implements CodeLensProvider {
	// Each provider requires a provideCodeLenses function which will give the various documents the code lenses
	async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
		if (document.uri.scheme === "output") return [];
		
		const workspacePath = DocumentTools.GetWorkspacePath(document);
		const basePath = DocumentTools.GetBasePath(document);
	
		const lenses: CodeLens[] = [];
		
		const matches = findLinksInDoc(document);
		matches.forEach((match) => {
			
			const fullPath = CreateFullPath(basePath,workspacePath,match.str);
			// Don't show the codelens if the file doesn't exist
			if (!fullPath || !DocumentTools.FileExists(fullPath)) return;
			// Dont show the codelens if the path is just for a folder;
			if (DocumentTools.IsDirectory(fullPath)) return;
			
			lenses.push(new CodeLens(
				new Range(match.lN,0, match.lN,0), 
				<Command>{
					command: "vscode.open",
					title: `Open ${match.str}`,
					arguments: [DocumentTools.GetFileUri(fullPath)],
				}
			));
		});
	
		return lenses;
	}
}

				
//https://github.com/usernamehw/vscode-commands/blob/master/src/documentLinksProvider.ts



export class DocumentCommentLinkProvider implements DocumentLinkProvider {
	// Each provider requires a provideDocumentLinks function which will give the various documentLink objects
	async provideDocumentLinks(document: TextDocument) {
		if (document.uri.scheme === "output") return [];
		
		const workspacePath = DocumentTools.GetWorkspacePath(document);
		const basePath = DocumentTools.GetBasePath(document);

		const links: DocumentLink[] = [];
		
		const matches = getLinkMatchesDoc(document);
		matches.forEach((match) => {
			const cleanedLine = match.array[0]?.replace(CLEAN_LINK, "");
			if (!cleanedLine) return;
			const fullPath = CreateFullPath(basePath,workspacePath,cleanedLine);
			// Don't show the codelens if the file doesn't exist
			if (!fullPath || !DocumentTools.FileExists(fullPath)) return;
			// Dont show the codelens if the path is just for a folder;
			if (DocumentTools.IsDirectory(fullPath)) return;
		
			links.push(new DocumentLink(
				new Range(match.lN, match.array.index!+1, match.lN, match.array.index!-1 + match.array[0].length),
				DocumentTools.GetFileUri(fullPath)
			));

		});
		return links;
	}
}

				































class DocumentTools {
	static readonly newlineRegex = /\r?\n/;
	static readonly GetWorkspacePath = (document:TextDocument):string => workspace.getWorkspaceFolder(document.uri)?.uri?.fsPath ?? "";
	static readonly GetRelativeFolder = (filePath:string):string => workspace.asRelativePath(dirname(filePath)); //Get the relative path to the workspace folder  
	static readonly GetBasePath = (document:TextDocument):string => join(document.uri.fsPath, "..");
	static readonly SplitDocument = (document:TextDocument):Array<string> => document.getText().split(DocumentTools.newlineRegex);
	static readonly FileExists = (filePath:string):bool => existsSync(filePath);
	static readonly GetFileUri = (filePath:string):Uri => Uri.file(filePath);
	static readonly GetFileFsPath = (filePath:string):string => Uri.parse(filePath).fsPath;
	static readonly GetFullRange = (document:TextDocument):Range => new Range(0, 0, document.lineCount, 0);

	/** Exapnds ~ to homedir in non-Windows platform*/
	static readonly ResolveHomeDir = (inputPath:string):string => (inputPath.trim() && inputPath.startsWith('~')) ? join(homedir(),inputPath.substring(1)) : inputPath;

	static readonly GetPathInfo = (filePath:string):Stats => lstatSync(filePath);
	static readonly IsDirectory = (filePath:string):bool => lstatSync(filePath).isDirectory();
	static readonly IsFile = (filePath:string):bool => lstatSync(filePath).isFile();
}









// private static getDocumentWorkspaceFolder(): string | undefined {
// 	const fileName = vscode.window.activeTextEditor?.document.fileName;
// 	return (vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).filter((fsPath) => fileName?.startsWith(fsPath))[0]);
// }

	









// /**
//  * Returns a Code Lens with a position and a command.
//  * @param position A position to create Code Lens on.
//  * @param command A command to assign to Code Lens.
// */
// function createCodeLens(position: Position, command: Command): CodeLens {
// 	return new CodeLens(new Range(position, position), command);
// }

// /**
//  * Returns Code Lenses with given positions and a command.
//  * @param positions Positions to create Code Lenses on.
//  * @param command A command to assign to Code Lenses.
// */
// function createCodeLenses(positions: Position[], command: Command): CodeLens[] {
// 	return positions.map(position => createCodeLens(position, command));
// }

// export {
//     createCodeLens,
//     createCodeLenses
// };













// export class CommentLinkHoverProvider implements HoverProvider {
// 	provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover>|undefined {
// 		if (document.uri.scheme === "output") return undefined;
		
// 		const workspacePath = DocumentTools.GetWorkspacePath(document);
// 		const basePath = DocumentTools.GetBasePath(document);
	
// 		const line = document.lineAt(position).text;
// 		if (!isComment(line)) return;
		
		
// 		const lineMatchRegex = /\[(\[.*?\])\]/g;
// 		// for (let match: RegExpExecArray|null; (match = lineMatchRegex.exec(line));) {
// 		// 	// console.log("Found comment hover link line: " + line, "\n", match, range);
// 		// 	if ((match.index) < position.character && position.character < (match.index+match[0].length)) {
// 		// 		const cleanedLine = match[0].replace(/(\[|\])/g, "");
// 		// 		const components = LINK_REGEX.exec(cleanedLine)!;
// 		// 		const filePath = components[2];
// 		// 		const relativeFolder = components[1];
// 		// 		const fullPath = (relativeFolder
// 		// 			? resolve(basePath, relativeFolder, filePath)
// 		// 			: resolve(workspacePath, filePath)
// 		// 		);
// 		// 		// Don't show the codelens if the file doesn't exist
// 		// 		if (!DocumentTools.FileExists(fullPath)) return;
				
// 		// 		const myContent = new MarkdownString(`[Open: ${cleanedLine}](${DocumentTools.GetFileUri(fullPath)} "Open ${DocumentTools.GetFileFsPath(filePath)}")`);
// 		// 		// Command Uris are disabled by default for security reasons.
// 		// 		// If you set this flag, make sure your content is not constructed using untrusted/unsanitized text.
// 		// 		myContent.isTrusted = true;
				
// 		// 		const matchRange = new Range(position.line, match.index, position.line, match.index+match[0].length);
// 		// 		return new Hover(myContent, matchRange);

// 		// 	}

// 		// }
// 		return undefined;

// 	}
// }






