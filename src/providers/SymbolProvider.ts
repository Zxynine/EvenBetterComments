import * as vscode from 'vscode';










export class CommentDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): Thenable<vscode.SymbolInformation[]> {
        return new Promise((resolve) => {
            var symbols = [];

            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);
                if (line.text.startsWith("@")) {
                    symbols.push(<vscode.SymbolInformation>{
                        name: line.text.slice(1),
                        kind: vscode.SymbolKind.String,
                        location: new vscode.Location(document.uri, line.range)
                    })
                }
            }

            resolve(symbols);
        });
    }
}