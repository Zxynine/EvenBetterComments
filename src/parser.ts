import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { getLinksRangesDoc } from './providers/CommentLinkProvider';

import { linkedCommentDecoration, hiddenCommentDecoration } from './providers/DecorationProvider';
import { TryGetDocumentScopeFullFlat, DocumentLoader } from './document';


// const regexString = "(^|[ \\t])(" + this.blockCommentStart + "[\\s])+([\\s\\S]*?)(" + this.blockCommentEnd + ")"; 


export class Parser {
	private tags: CommentTag[] = [];
	// private enclosingPairs: EnclosingPair[] = [];
	//TODO: create variables for other types of expressions.
	private expression: string = "";

	private delimiter: string = "";
	private blockCommentStart: string = "";
	private blockCommentEnd: string = "";

	private highlightMonolineComments = false;
	private highlightMultilineComments = false;
	private highlightJSDoc = true;
	private highlightLinkedComments = true;

	// * this will allow plaintext files to show comment highlighting if switched on
	private isPlainText = false;
	// * this is used to prevent the first line of the file (specifically python) from coloring like other comments
	private ignoreFirstLine = false;
	// * this is used to trigger the events when a supported language code is found
	public supportedLanguage = true;

	// Read from the package.json
	private contributions: Contributions = vscode.workspace.getConfiguration('evenbettercomments') as any;
	// The configuration necessary to find supported languages on startup
	private configuration: Configuration;
	/** Creates a new instance of the Parser class */
	public constructor(config: Configuration) {
		this.configuration = config;
		this.setTags();
	}

	//Tools==========================================================================================================================================
	
 	//TODO: Join using '|' char, the array is not needed.
 	//TODO: just save the regex string, this.tags should not change.	
	/** Build up regex matcher for custom delimiter tags */
	private static CreateCharactersArray(tags : Array<CommentTag>) : Array<string> {
		let characters: Array<string> = [];
		for (let commentTag of tags) characters.push(commentTag.escapedTag);
		return characters;
	}

	
	private static CreateRange(document: vscode.TextDocument, startIndex : number, endIndex : number) : vscode.DecorationOptions {
		let startPos = document.positionAt(startIndex);
		let endPos = document.positionAt(endIndex);
		return <vscode.DecorationOptions>{ range: new vscode.Range(startPos, endPos) };
	}

	
	/**
	 * Static method used to create CommentTag objects.
	 * @param itemTag The string that repesents the tag.
	 * @param decorationType The decoration format definition.
	 * @returns {CommentTag} The created CommentTag object.
	 */
	private static CreateTag(itemTag : string, options : vscode.DecorationRenderOptions) : CommentTag {
		let escapedSequence = itemTag.replace(/([()[{*+.$^\\|?])/g, '\\$1');
		let newTag : CommentTag = {
			tag: itemTag,
			escapedTag: escapedSequence.replace(/\//gi, "\\/"), //? hardcoded to escape slashes
			lowerTag: itemTag.toLowerCase(), //? used for comparison
			ranges: [],
			decoration: vscode.window.createTextEditorDecorationType(options)
		};
		return newTag;
	}
	
	/**
	 * Escapes a given string for use in a regular expression
	 * @param input The input string to be escaped
	 * @returns {string} The escaped string
	 */
	private static escapeRegExp(input: string): string {
		return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}


	//===============================================================================================================================================
	//TODO: preprocess to find lines with comment characters to pass to each function, save them the hassle of parsing the entire document.
	// Called to handle events below
	public UpdateDecorations(activeEditor : vscode.TextEditor) {
		// if lanugage isn't supported, return
		if (!this.supportedLanguage) return;
		// if no active window is open, return
		if (!activeEditor) return;

		// this.GetAllCommentRanges(activeEditor);

		// Finds the single line comments using the language comment delimiter
		this.FindSingleLineComments(activeEditor);
		// Finds the multi line comments using the language comment delimiter
		this.FindBlockComments(activeEditor);
		// Finds the jsdoc comments
		this.FindJSDocComments(activeEditor);

		// Apply the styles set in the package.json
		this.ApplyDecorations(activeEditor);
	};


	/**
	 * Sets the regex to be used by the matcher based on the config specified in the package.json
	 * @param languageCode The short code of the current language
	 * https://code.visualstudio.com/docs/languages/identifiers
	 */
	public SetRegex(languageCode: string) {
		this.setDelimiter(languageCode);

		// if the language isn't supported, we don't need to go any further
		if (!this.supportedLanguage) return;

		
		if (this.isPlainText && this.contributions.highlightPlainText) {
			// start by tying the regex to the first character in a line
			this.expression = "(^)+([ \\t]*[ \\t]*)";
		} else {
			// start by finding the delimiter (//, --, #, ') with optional spaces or tabs
			this.expression = "(" + this.delimiter + ")+( |\t)*";
		}
		
		let characters: Array<string> = Parser.CreateCharactersArray(this.tags);
		// Apply all configurable comment start tags
        this.expression += "(" + characters.join("|") + ")+(.*)";
	}





	//TODO implemennt check for comment tokens before commiting

	/**
	 * Finds all single line comments delimited by a given delimiter and matching tags specified in package.json
	 * @param activeEditor The active text editor containing the code document
	**/
	public FindSingleLineComments(activeEditor: vscode.TextEditor): void {
		// If highlight single line comments is off, single line comments are not supported for this language
		if (!this.highlightMonolineComments) return;

		const text = activeEditor.document.getText();

		// if it's plain text, we have to do mutliline regex to catch the start of the line with ^
		let regexFlags = (this.isPlainText) ? "igm" : "ig";
		let regEx = new RegExp(this.expression, regexFlags);

		
		for (let match:RegExpExecArray|null; (match = regEx.exec(text));) {
			let startPos = activeEditor.document.positionAt(match.index);
			let endPos = activeEditor.document.positionAt(match.index + match[0].length);
			

			// Required to ignore the first line of files (#61) Many scripting languages start their file with a shebang to indicate which interpreter should be used (i.e. python3 scripts have #!/usr/bin/env python3)
			if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) continue;
			//^.*?Regex non greedy
			const LineArray = DocumentLoader.getDocument(activeEditor.document.uri)?.getLineTokenData(startPos);
			if ( LineArray) {
				if (!LineArray.hasTokenType(StandardTokenType.Comment))	continue;
				else {
		
					let characters: Array<string> = Parser.CreateCharactersArray(this.tags);


					const offset = LineArray.offsetOf(StandardTokenType.Comment);
					const lineSub = activeEditor.document.lineAt(startPos).text.substring(offset);
					const searchRegex = "^.*?(" + this.delimiter + ")+( |\t)*(" + characters.join("|") + ")+(.*)"

					const matchResult = lineSub.match(searchRegex);
					if (matchResult) {
						// Find which custom delimiter was used in order to add it to the collection
						let matchString = (matchResult[3] as string).toLowerCase();
						let matchTag = this.tags.find(item => item.lowerTag === matchString);
						if (matchTag) {
							let range: vscode.DecorationOptions = { range: new vscode.Range(startPos.line, offset, endPos.line, activeEditor.document.lineAt(startPos).text.length) };
							console.log(searchRegex, "\n", lineSub, "\n", offset, "\n", matchResult, "\n", range);
							matchTag.ranges.push(range);
						}
					}
				}
			}  else {

				let range: vscode.DecorationOptions = { range: new vscode.Range(startPos, endPos) };
				
				// Find which custom delimiter was used in order to add it to the collection
				let matchString = (match[3] as string).toLowerCase();
				let matchTag = this.tags.find(item => item.lowerTag === matchString);
				if (matchTag) matchTag.ranges.push(range);
			}
		}
	}

	/**
	 * Finds block comments as indicated by start and end delimiter
	 * @param activeEditor The active text editor containing the code document
	 */
	public FindBlockComments(activeEditor: vscode.TextEditor): void {
		// If highlight multiline is off in package.json or doesn't apply to his language, return
		if (!this.highlightMultilineComments) return;
		
		let text = activeEditor.document.getText();
		// Build up regex matcher for custom delimiter tags
		let characters: Array<string> = Parser.CreateCharactersArray(this.tags);

		// Combine custom delimiters and the rest of the comment block matcher
		let commentMatchString = (this.contributions.allowNestedHighlighting)? ("(^)+([ \\t]*(?:"+ this.blockCommentStart +")?[ \\t]*)(") : ("(^)+([ \\t]*[ \\t]*)(");
		commentMatchString += characters.join("|");
		commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

		/* 
			"(^)+([ \\t]*[ \\t]*)(|chars|)([ ]*|[:])+([^* /][^\\r\\n]*)"
		
			
			"(^)+                 ([ \\t]*[ \\t]*)              (|chars|)                   ([ ]*|[:])+                         ([^* /][^\\r\\n]*)"
		capture start pos        capture whitespace          capture any tag        capture trailing spaces/colon         capture char not {* or /} any char not {\r\n}
		at least one of them    any number of leading     first tag first non ws            one or more                             one char             any chars
		
		
		              ([ \\t]*                  (?:this.blockCommentStart)?              [ \\t]*)
		capture    any leading whitespace       dont index block start            any trailing whitespace
		*/


		// Use start and end delimiters to find block comments
		let regexString = "(^|[ \\t])(" + this.blockCommentStart + "[\\s])+([\\s\\S]*?)(" + this.blockCommentEnd + ")"; 

		/* 
		"(^|[ \\t])(this.blockCommentStart[\\s])+([\\s\\S]*?)(this.blockCommentEnd)"
		
		        "(^|[ \\t])                 (this.blockCommentStart[\\s])+               ([\\s\\S]*?)          (this.blockCommentEnd)"
		capture newline or whitespace   capture block start and whitespace char     capture any characters        capture block end
		     single character                       at least one                        all non greedy                single char    
		*/




		let regEx = new RegExp(regexString, "gm");
		let commentRegEx = new RegExp(commentMatchString, "igm");

		// Find the multiline comment block
		for (let match:RegExpExecArray|null; (match = regEx.exec(text));) {
			let commentBlock = match[0];

			// Find the line
			for (let line:RegExpExecArray|null; (line = commentRegEx.exec(commentBlock));) {
				let lineMatchIndex = line.index + match.index;
				let range: vscode.DecorationOptions = Parser.CreateRange(activeEditor.document, lineMatchIndex + line[2].length, lineMatchIndex + line[0].length);

				// Find which custom delimiter was used in order to add it to the collection
				let matchString = (line[3] as string).toLowerCase();
				let matchTag = this.tags.find(item => item.lowerTag === matchString);
				if (matchTag) matchTag.ranges.push(range);
			}
		}
	}


	/**
	 * Idea: first split document up into groups that are not block comments and ones that are. Iterate over each individual group and apply the formatting appropriately.
	 * 
	 * ? Nothing is telling this code not to parse single line and multi line in the same area.
	 * 
	 * ISSUE: When you put "//*" inside a string, it will detect that line as a string from that point onwards.
	 * Example: ^"//*" this text gets highlighted;
	 *
	 * [[Hello ]] dadw [[    ]]
	**/

	/** 
	 * Finds all multiline comments starting with "*"
	 * @param activeEditor The active text editor containing the code document
	 */
	public FindJSDocComments(activeEditor: vscode.TextEditor): void {
		// If highlight multiline is off in package.json or doesn't apply to his language, return
		if (!this.highlightMultilineComments && !this.highlightJSDoc) return;

		let text = activeEditor.document.getText();
		// Build up regex matcher for custom delimiter tags
		let characters: Array<string> = Parser.CreateCharactersArray(this.tags);

		// Combine custom delimiters and the rest of the comment block matcher
		const regEx : RegExp = /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*\/)/gm; // Find rows of comments matching pattern /** */
		
		/*                               /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*\/)/gm
		        (^|[ \t])                         (\/\*\*)+            ([\s\S]*?)                 (\*\/)                gm
		begining of line or whitespace       one or more '/ **'    all characters non greedy    one match '*-/'   global multiline
		*/

		// Highlight after leading /** or *
		let commentMatchString = (this.contributions.allowNestedHighlighting)? "(^)+([ \\t]*(?:/\\*\\*|\\*)[ \\t]*)(" : "(^)+([ \\t]*\\*[ \\t]*)("; 
		commentMatchString += characters.join("|");
		commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

		/*                 "(^)+([ \\t]*(?:/\\*\\*|\\*)[ \\t]*)(|characters|)([ ]*|[:])+([^* /][^\\r\\n]*)"
		        "(^)+                          ([ \\t]*(?:/\\*\\*|\\*)[ \\t]*)                      (|characters|)           ([ ]*|[:])+         ([^* /][^\\r\\n]*)"
		one or many beginings     any-all whitespace {dont group '/**' or '/*'} any-all whitespace     some tag        all space/one colon       one '*-/' any chars not newline

						"([ \\t]*\\*[ \\t]*)"
		*/

		let commentRegEx = new RegExp(commentMatchString, "igm");

		// Find the multiline comment block
		for (let match:RegExpExecArray|null; (match = regEx.exec(text));) {
			const commentBlock = match[0];

			// Find the line
			for (let line:RegExpExecArray|null; (line = commentRegEx.exec(commentBlock));) {
				const lineMatchIndex = line.index + match.index;
																							// length of leading delimeter and spaces        //length of word?
				const range: vscode.DecorationOptions = Parser.CreateRange(activeEditor.document, lineMatchIndex + line[2].length, lineMatchIndex+ line[0].length);

				// Find which custom delimiter was used in order to add it to the collection
				const matchString = (line[3] as string).toLowerCase();
				const matchTag = this.tags.find(item => item.lowerTag === matchString);
				if (matchTag) matchTag.ranges.push(range);
			}
		}
	}



	// public GetAllCommentRanges(activeEditor: vscode.TextEditor): void {
	// 	const AllTokens = TryGetDocumentScopeFullFlat(activeEditor.document);
	// 	if (!AllTokens) return;

	// 	const commentRanges : vscode.Range[] = [];
	// 	AllTokens.forEach((Token) => {
	// 		if (Token.IsComment()) commentRanges.push(Token.range);
	// 	});



	// 	this.tags[0].ranges = commentRanges.map(element => <vscode.DecorationOptions>{ range: element });
	// 	console.log(commentRanges);
	// }




	/**
	 * Apply decorations after finding all relevant comments
	 * @param activeEditor The active text editor containing the code document
	 */
	public ApplyDecorations(activeEditor: vscode.TextEditor): void {
		// this.ApplyHide(activeEditor);
		for (let tag of this.tags) {
			activeEditor.setDecorations(tag.decoration, tag.ranges);
			tag.ranges.length = 0; // clear the ranges for the next pass
		}

		//Provides highlighting for comment links
		if (this.highlightLinkedComments) {
			const ranges = getLinksRangesDoc(activeEditor.document).map(element => <vscode.DecorationOptions>{ range: element });
			activeEditor.setDecorations(linkedCommentDecoration, ranges);
		}
	}


	// public ApplyHide(activeEditor: vscode.TextEditor):void {
	// 	// for (let tag of this.tags) {
	// 	// 	activeEditor.setDecorations(tag.decoration, []); //Removes current decorations
	// 	// }
	// 	const newRange:vscode.Range[] = this.tags.flatMap((tag)=> tag.ranges);

	// 	activeEditor.setDecorations(hiddenCommentDecoration, newRange);
	// 	this.tags.forEach((tag)=> tag.ranges.length = 0);

	// }


	// /**
	//  * Clears all active decorations.
	//  * @param activeEditor The active text editor containing the code document
	//  */
	// public RemoveDecorations(activeEditor: vscode.TextEditor): void {
	// 	for (let tag of this.tags) {
	// 		activeEditor.setDecorations(tag.decoration, []);
	// 		tag.ranges.length = 0; // clear the ranges for the next pass
	// 	}
	// 	activeEditor.setDecorations(linkedCommentDecoration, []);
	// }





	//#region  Private Methods.......................................................................................................................

	/**
	 * Sets the comment delimiter [//, #, --, '] of a given language
	 * @param languageCode The short code of the current language
	 * https://code.visualstudio.com/docs/languages/identifiers
	 */
	private setDelimiter(languageCode: string): void {
		this.supportedLanguage = false;
		this.ignoreFirstLine = false;
		this.isPlainText = false;

		const config: vscode.CommentRule|undefined = this.configuration.GetCommentConfiguration(languageCode);
		if (config) {
			this.supportedLanguage = true;

			let blockCommentStart = config.blockComment ? config.blockComment[0] : null;
			let blockCommentEnd = config.blockComment ? config.blockComment[1] : null;


			this.setCommentFormat(config.lineComment ?? blockCommentStart, blockCommentStart, blockCommentEnd);

			this.ignoreFirstLine = this.configuration.GetHasShebang(languageCode);
		}

		switch (languageCode) {
			case "apex":
			case "javascript":
			case "javascriptreact":
			case "typescript":
			case "typescriptreact":
				this.highlightJSDoc = true;
				break;

			case "elixir":
			case "python":
			case "perl":
			case "perl6":
			case "go":
			case "tcl":
				this.ignoreFirstLine = true;
				break;

			case "objectpascal":
				// This language seems to not have its config set up properly but it is supported.
				this.supportedLanguage = true;
				this.setCommentFormat("//", "/*", "*/");
				break;

			case "plaintext":
				this.isPlainText = true;
				// If highlight plaintext is enabled, this is a supported language
				this.supportedLanguage = this.contributions.highlightPlainText;
				break;
		}




	}
	

	/** Sets the highlighting tags up for use by the parser */
	private setTags(): void {
		let items = this.contributions.tags;
		for (let item of items) {
			const options = <vscode.DecorationRenderOptions>{ color: item.color, backgroundColor: item.backgroundColor };

			// ? the textDecoration is initialised to empty so we can concat a preceeding space on it
			options.textDecoration = "";

			//TODO: add line styles like dotted wavy etc... - https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
			if (item.overline) options.textDecoration += " overline";
			if (item.strikethrough) options.textDecoration += "line-through";
			if (item.underline) options.textDecoration += " underline";
			if (item.bold) options.fontWeight = "bold";
			if (item.italic) options.fontStyle = "italic";
			
			//TODO: allow item.tag to be an array? Avoid the need for alias to begin with.
			//Create CommentTag for primary tag
			this.tags.push(Parser.CreateTag(item.tag, options));
			
			//Turn each alias into its own CommentTag because im lazy and it is easy to do.
			if (item.aliases) {
				for (let aliasTag of item.aliases) {
					this.tags.push(Parser.CreateTag(aliasTag, options));
				}
			}
		}
	}

	

	/**
	 * Set up the comment format for single and multiline highlighting
	 * @param monoLine The single line comment delimiter. If NULL, monoline is not supported
	 * @param start The start delimiter for block comments
	 * @param end The end delimiter for block comments
	 */
	private setCommentFormat(monoLine: string|string[]|null, start: string|null = null, end: string|null = null): void {
		this.delimiter = "";
		this.blockCommentStart = "";
		this.blockCommentEnd = "";

		// console.log(this.contributions, "\n", monoLine, start, end);
		// If no single line comment delimiter is passed, monoline comments are not supported
		if (monoLine) {
			this.highlightMonolineComments = this.contributions.monolineComments;
			if (typeof monoLine === 'string') {
				this.delimiter = Parser.escapeRegExp(monoLine).replace(/\//ig, "\\/");
			} else if (monoLine.length > 0) {
				// * if multiple delimiters are passed, the language has more than one single line comment format
				this.delimiter = monoLine.map(s => Parser.escapeRegExp(s)).join("|");
			}
		}

		if (start && end) {
			this.highlightMultilineComments = this.contributions.multilineComments;
			this.blockCommentStart = Parser.escapeRegExp(start);
			this.blockCommentEnd = Parser.escapeRegExp(end);
		}
	}



	//#endregion
}









const enum CommentTokens {
	NoComments = (0<<0),
	MonoLine = (1<<0),
	MultiLine = (1<<1),
}








		// const WS = "[ \\t]*"
		// const NL = "[\\r\\n]*"
		// const notNL = "[^\\r\\n]*"
		// const SpacesColon = "([]*|[:])+"
		// const skipGroupsCb = "(?:\{[^\}]*\})*";
		// const skipGroupsBr = "(?:\[[^\]]*\])*";
		// const skipAllGroups = "((?:\{[^\}]*\})*|(?:\[[^\]]*\])*|.*?(?=//))*";








			//https://github.com/davidhewitt/shebang-language-associator

	//https://github.com/aaron-bond/better-comments/issues/404
	//https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#theming
	//https://code.visualstudio.com/api/extension-guides/color-theme#syntax-colors
	//https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide






	


		//https://regex101.com
		//[!\?].*([^!\?]*\n)*
		//(^)+([ \t]*(?:\/\*\*|\*)[ \t]*)([\!|\?])([ ]*|[:])+(.*(?:[^!|\?]*\n)*)

		//G1=^	G2=*...	G3=[?!] G4=indexstart	G5=content

		//((?:(?!\*\/).)*[\r\n]*(?:(?:(?!\*\/)(?!\!|\?).)*\n)*)







		


		/**! */
		/**!*/
		
		/*! */
		/*!*/

		/*.! */
		/*.!*/

		/* ! */
		/* !*/


	//https://github.com/estruyf/vscode-hide-comments
	//https://github.com/kingsimba/vscode-tsdoc-comment
	//https://github.com/baendlorel/cpp-comment-generator
	//https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.bettercomment
	//https://marketplace.visualstudio.com/search?term=comments&target=VSCode&category=Other&sortBy=Relevance





	// private static groupRegExp(start:string, end:string) : string {
	// 	return "(?:"+start+"[^"+end+"]*("+end+"|[ \\t])+)"
		
	// 	const skipGroupsBr = "(?:\[[^\]]*\])*";
	// }








	
			// let currentLine = activeEditor.document.lineAt(startPos.line);

			// let groupFinder = "";
			// currentLine.text



			






















						
			// if (!this.isPlainText) {
			// 	const LineScopes = TryGetDocumentScopeLine(activeEditor.document, startPos);
			// 	if (LineScopes) {
			// 		const commentStart = LineScopes[LineScopes.firstIndex((Token)=> Token.IsComment())].range.start
			// 		const lineSlice = activeEditor.document.lineAt(startPos.line).text.substring(commentStart.character);

			// 		const lineParse = lineSlice.match(this.expression);
			// 		if (lineParse) {
			// 			let range: vscode.DecorationOptions = { range: new vscode.Range(commentStart, endPos) };
						
			// 			// Find which custom delimiter was used in order to add it to the collection
			// 			let matchString = (lineParse[3] as string).toLowerCase();
			// 			let matchTag = this.tags.find(item => item.lowerTag === matchString);
			// 			if (matchTag) matchTag.ranges.push(range);
			// 			continue;
			// 		}
			// 	}
			// }
