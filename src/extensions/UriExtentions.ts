import * as vscode from 'vscode';
import { Uri } from 'vscode';


export { };






declare module 'vscode' {
    interface Uri {
		asResourceUrl(range: vscode.Range): vscode.Uri;
    }
}






vscode.Uri.prototype.asResourceUrl = function asResourceUrl(this: vscode.Uri, range: vscode.Range): vscode.Uri {
	return this.with({ fragment: `L${1 + range.start.line},${1 + range.start.character}-${1 + range.end.line},${1 + range.end.character}` });
}












export class FileUri {
	private readonly uri: Uri;
	public constructor(uri: Uri|string) {
		this.uri = (typeof uri === 'string')? Uri.file(uri) : uri;
	}

	public static fromString(path: string): FileUri {return new FileUri(Uri.file(path));}
	public static fromUri(uri: Uri): FileUri {return new FileUri(uri);}

	public get Uri(): Uri {return this.uri;}
	public get Path(): string {return this.uri.fsPath;}
}
