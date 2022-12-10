import * as vscode from 'vscode';
import { Configuration } from './configuration';
import { getLinksRangesDoc } from './providers/CommentLinkProvider';

import { linkedCommentDecoration } from './providers/DecorationProvider';
import { DocumentLoader } from './document';
import { FlagsArray } from './typings/BitFlags';

//Idea : Toggle key character option (specific tag which tells the parser what to highlight.)

export class Parser {
	private readonly regextags: RegexCommentTag[] = [];
	private readonly tags: CommentTag[] = [];
	private readonly tagsMap: Map<string,CommentTag> = new Map<string,CommentTag>();
	private PushTag(Tag : CommentTag) {
		this.tags.push(Tag);
		this.tagsMap.set(Tag.lowerTag, Tag);
	}

	protected PushRegexTag(Tag: RegexCommentTag) {
		this.regextags.push(Tag);
	}

	protected GetRegexTag(testString: string) {
		if (this.regextags.length === 0) return undefined;
		for (const RegexTag of this.regextags)
			if (RegexTag.regex.test(testString)) return RegexTag;
		return undefined;
	}

	protected GetTag(key: string) {
		return this.tagsMap.get(key);
	}

	//Stores all searching patterns for the tags.
	private readonly Expressions = {

		MonoLineSimple: / /,
		MonoLineMixed: / /,

		MultiLineSimple: / /,
		MultiLineMixed: / /,

		MultiLineJSSimple: / /,
		MultiLineJSMixed: / /,
		
		MonoLineBlockSimple: / /,
		MonoLineBlockMixed: / /,



		// MonoLineMatch: / /,
		// MultiLineMatch: / /,
		// MultiLineJSMatch: / /,
		// MultiLineMatchFull: / /,
		// MultiLineJSMatchFull: / /,
	}


	private delimiter: string = "";
	private blockCommentStart: string = "";
	private blockCommentEnd: string = "";
	//@ts-ignore
	private tagArray: string = "";

	private highlightMonolineComments = false;
	private highlightMultilineComments = false;
	private highlightJSDoc = true;
	private highlightLinkedComments = true;
	private highlightFullBlockComments = false;
	private highlightTagOnly = false;

	// * this will allow plaintext files to show comment highlighting if switched on
	private isPlainText = false;
	// * this is used to prevent the first line of the file (specifically python) from coloring like other comments
	private ignoreFirstLine = false;
	// * this is used to trigger the events when a supported language code is found
	public supportedLanguage = true;

	//This is a custom class i have made which acts like an array of booleans using integers over boolean types since a bool takes 4bytes of mem.
	//Bool arrays are also not as easy to query as opposed to ints where I can just use bitwise maths.
	private readonly CommentTracker: FlagsArray = new FlagsArray();

	// Read from the package.json
	private contributions: Contributions = vscode.workspace.getConfiguration('evenbettercomments') as any;
	
	/** Creates a new instance of the Parser class */
	public constructor() {
		this.setTags();
	}

	
	//TODO: Add command to refresh contributions.
	public reloadSettings(): void {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) this.RemoveDecorations(activeEditor);
		this.tags.length = 0;
		this.tagsMap.clear();
		this.contributions = vscode.workspace.getConfiguration('evenbettercomments') as any;
		this.setTags();
		if (activeEditor) this.UpdateDecorations(activeEditor);
		console.log("EvenBetterComments: User refreshed tag settings.");
	}




	//Tools==========================================================================================================================================
	
 	//TODO: just save the regex string, this.tags should not change except for config reloads.
	/** Build up regex matcher for custom delimiter tags */
	protected static JoinDelimiters = (tags : Array<CommentTag>) => `(?:${tags.map(Tag => Tag.escapedTag).join('|')})`;

	protected static OffsetToLine = (document: vscode.TextDocument, offset:int): int => document.positionAt(offset).line;
	protected static CreateRange(document: vscode.TextDocument, startIndex: int, endIndex: int): vscode.Range {
		return new vscode.Range(document.positionAt(startIndex), document.positionAt(endIndex));
	}


	
	/**
	 * Static method used to create CommentTag objects.
	 * @param itemTag The string that repesents the tag.
	 * @returns {CommentTag} The created CommentTag object.
	 */
	protected static CreateTag(itemTag : string, options : vscode.DecorationRenderOptions) : CommentTag {
		const escapedSequence = itemTag.replace(/([.*+?^${()|[\\])/g, '\\$1'); //?   /([()[{*+.$^\\|?])/g
		return <CommentTag>{
			tag: itemTag,
			escapedTag: Parser.escapeSlashes(escapedSequence),  //? hardcoded to escape slashes
			lowerTag: itemTag.toLowerCase(), //? used for comparison
			ranges: [],
			decoration: vscode.window.createTextEditorDecorationType(options)
		};
	}


	/**
	 * Static method used to create CommentTag objects.
	 * @param itemTag The string that repesents the tag.
	 * @returns {CommentTag} The created CommentTag object.
	 */
	 protected static CreateRegexTag(itemTag : string, options : vscode.DecorationRenderOptions) : RegexCommentTag {
		return <RegexCommentTag>{
			tag: itemTag,
			regex: new RegExp(itemTag),
			ranges: [],
			decoration: vscode.window.createTextEditorDecorationType(options)
		};
	}


	private static TagDefinitionToDecorationOptions(tag : TagDefinition) {
		if (tag.CustomDecoration !== undefined) return tag.CustomDecoration;
		const options = <vscode.DecorationRenderOptions>{ color: tag.color, backgroundColor: tag.backgroundColor, textDecoration: "" /** ? initialised to empty so we can concat to it */ };

		//TODO: add line styles like dotted wavy etc... - https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
		if (tag.overline) options.textDecoration += " overline";
		if (tag.strikethrough) options.textDecoration += " line-through";
		if (tag.underline) options.textDecoration += " underline";
		if (tag.bold) options.fontWeight = "bold";
		if (tag.italic) options.fontStyle = "italic";
		return options;
	}
	
	/**
	 * Escapes a given string for use in a regular expression
	 * @param input The input string to be escaped
	 * @returns {string} The escaped string
	 */
	private static escapeRegExp(input: string): string { return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); } // $& means the whole matched string
	private static escapeSlashes(input: string): string { return input.replace(/\//ig, "\\/"); } // /? hardcoded to escape slashes

	private static *MatchAllInText(text:string, pattern:RegExp): Generator<RegExpExecArray> {
		for (let match:RegExpExecArray|null; (match = pattern.exec(text));) yield match;
	}


	//===============================================================================================================================================


	//Idea: preprocess to find lines with comment characters to pass to each function, save them the hassle of parsing the entire document.
	// Called to handle events below
	public UpdateDecorations(activeEditor : vscode.TextEditor) {
		// if this extension was set to disabled.
		if (!this.contributions.enabled) return;
		// if lanugage isn't supported, return
		if (!this.supportedLanguage) return;
		// if no active window is open, return
		if (!activeEditor) return;
		
		this.CommentTracker.ClearAll();
		this.CommentTracker.Expand(activeEditor.document.lineCount);

		//? Finding block comments first so that single comments wont appear inside of them.

		// Finds the jsdoc comments
		this.FindJSDocComments(activeEditor);
		// Finds the multi line comments using the language comment delimiter
		this.FindBlockComments(activeEditor);
		// Finds the single line comments using the language comment delimiter
		this.FindSingleLineComments(activeEditor);

		// console.log(this.CommentTracker.ToString())

		// Apply the styles set in the package.json
		this.ApplyDecorations(activeEditor);
	};


	/**
	 * Sets the regex to be used by the matcher based on the config specified in the package.json
	 * @param languageCode The short code of the current language
	 * https://code.visualstudio.com/docs/languages/identifiers
	 */
	public SetRegex(languageCode: string) {
		this.setDelimiter(languageCode); //This checks if language is supported as well. Make better name. InitialiseLanguage?
		// if the language isn't supported, we don't need to go any further
		if (!this.supportedLanguage) return;

		const TagArray = this.tagArray = Parser.JoinDelimiters(this.tags);
		// const CaptureSeparator = "([ \\t]+|:|$)";


		//..............................................
		if (this.isPlainText) this.delimiter = '';

		const MonoLineCommon = "("+this.delimiter+")+([ \\t]*)("+TagArray+")([ \\t]+|:|$)(.*$)";
		this.Expressions.MonoLineSimple = new RegExp("(^)([ \\t]*)"+MonoLineCommon, "igm");
		this.Expressions.MonoLineMixed = new RegExp("(^)([ \\t]*(?!"+this.delimiter+")\\S*.*?)"+MonoLineCommon, "igm");

		//..............................................
		
		// Use start and end delimiters to find block comments
		const MultiLineCommon = "("+this.blockCommentStart+")([^\\*][\\s\\S]*?)("+this.blockCommentEnd+")"
		
		this.Expressions.MultiLineSimple = new RegExp("(^[ \\t]*)"+MultiLineCommon, "igm");
		this.Expressions.MultiLineMixed = new RegExp("(^|[ \\t])"+MultiLineCommon, "igm");
		//..............................................
		
		// Combine custom delimiters and the rest of the comment block matcher
		this.Expressions.MultiLineJSSimple = /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*?\*\/)/igm; // Find rows of comments matching pattern /** */
		
		//..............................................

		this.Expressions.MonoLineBlockSimple = new RegExp(`(^[ \\t]*)(${this.blockCommentStart})(.*?)(${this.blockCommentEnd})`, "ig");
	}




	//===============================================================================================================================================









	/**  .......................................................................................................................
	 * Finds all single line comments delimited by a given delimiter and matching tags specified in package.json
	 * @param activeEditor The active text editor containing the code document
	**/
	public FindSingleLineComments(activeEditor: vscode.TextEditor): void {
		// If highlight single line comments is off, single line comments are not supported for this language
		if (!this.highlightMonolineComments) return;
		this.FindSingleLineCommentsSimple(activeEditor);
		this.FindSingleLineCommentsMixed(activeEditor);
	}



	/**
	 * Finds all single line comments which are the only content on a given line delimited by a given delimiter and matching tags specified in package.json
	 * @param activeEditor The active text editor containing the code document
	**/
	public FindSingleLineCommentsSimple(activeEditor: vscode.TextEditor): void {
		for (const match of Parser.MatchAllInText(activeEditor.document.getText(), this.Expressions.MonoLineSimple)) {
			const startPos = activeEditor.document.positionAt(match.index + match[2].length);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			//Mark line as visited.
			if (this.CommentTracker.CheckFlag(startPos.line)) continue;
			this.CommentTracker.SetFlag(startPos.line, true);

			// Required to ignore the first line of files (#61) Many scripting languages start their file with a shebang to indicate which interpreter should be used (i.e. python3 scripts have #!/usr/bin/env python3)
			if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) continue;

			// Find which custom delimiter was used in order to add it to the collection
			const matchString = (match[5] as string).toLowerCase();
			// console.log(match);
			this.tagsMap.get(matchString)?.ranges.push(
				((!this.highlightTagOnly)
					? new vscode.Range(startPos, endPos)
					: new vscode.Range(startPos.line, startPos.character + match[3].length, endPos.line, startPos.character + match[3].length + match[4].length + match[5].length + (match[6].trim().length))
				)
			);
		}
	}
	

	/**
	 * Finds all single line comments which are the only content on a given line delimited by a given delimiter and matching tags specified in package.json
	 * @param activeEditor The active text editor containing the code document
	**/
	public FindSingleLineCommentsMixed(activeEditor: vscode.TextEditor): void {
		const ActiveDocument = DocumentLoader.getDocument(activeEditor.document.uri); //TODO: Queue a refesh upon loading to reduce time for comments to work.
		if (ActiveDocument === undefined) return; //No tokens loaded yet, cant handle mixed comments properly.

		// This is used to isolate the comment and delimeter form the rest of the text so that it can be parsed.
		// ? [0: Full match] [1: LineStart To MixedData End] [2: Delimiter] [3: Space/Indent] [4: Tag] [5: Space/Colon] [6: Comment Text]
		const commentMatchString = "(^.*?)("+this.delimiter+")([ \\t]*)("+Parser.JoinDelimiters(this.tags)+")([ \\t]+|:|$)(.*$)";
		const commentRegEx = new RegExp(commentMatchString, "i");

		for (const match of Parser.MatchAllInText(activeEditor.document.getText(), this.Expressions.MonoLineMixed)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);

			//Mark line as visited.
			if (this.CommentTracker.CheckFlag(startPos.line)) continue;
			this.CommentTracker.SetFlag(startPos.line, true);
			
			// Required to ignore the first line of files (#61) Many scripting languages start their file with a shebang to indicate which interpreter should be used (i.e. python3 scripts have #!/usr/bin/env python3)
			if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) continue;

			const LineArray = ActiveDocument.getLineTokenData(startPos);
			if (LineArray?.Contains(StandardTokenType.Comment)) {
				const offset = LineArray.offsetOf(StandardTokenType.Comment);
				const matchResult = activeEditor.document.lineAt(startPos).text.substring(offset).match(commentRegEx);
				if (matchResult) {
					const ContainsCommentBefore = LineArray.ContainsBefore(offset+ (matchResult.index??0));
					if (ContainsCommentBefore) continue; //Dont highlight a line with multiple comments on the same line.
					
					// Find which custom delimiter was used in order to add it to the collection
					const matchString = (matchResult[4] as string).toLowerCase();
					if (this.tagsMap.has(matchString)) {
						const range = ((!this.highlightTagOnly)
							? new vscode.Range(startPos.line, offset, endPos.line, activeEditor.document.lineAt(startPos).text.length)
							: new vscode.Range(startPos.line, offset + matchResult[2].length, endPos.line, offset + matchResult[2].length + matchResult[3].length + matchResult[4].length + matchResult[5].trim().length)
						);
						this.tagsMap.get(matchString)!.ranges.push(range);
					}
				}
			}
		}
	}

















	/**  .......................................................................................................................





	/**
	 * Finds block comments as indicated by start and end delimiter
	 * @param activeEditor The active text editor containing the code document
	 */
	public FindBlockComments(activeEditor: vscode.TextEditor): void {
		// If highlight multiline is off in package.json or doesn't apply to his language, return
		if (!this.highlightMultilineComments) return;
		this.FindBlockCommentsSimple(activeEditor);
		this.FindBlockCommentsMixed(activeEditor);
	}



	/**
	 * Finds block comments as indicated by start and end delimiter
	 * @param activeEditor The active text editor containing the code document
	 */
	 public FindBlockCommentsSimple(activeEditor: vscode.TextEditor): void {
		// Combine custom delimiters and the rest of the comment block matcher
		// ? [0: Full Match] [1: lineStart + Space/Indent/BlockStart] [3: Tag] [4: BlockEnd/Space/Colon] [4: BlockEnd/LineEnd]
		const commentMatchString = "(^[ \\t]*(?:"+this.blockCommentStart+")?[ \\t]*)("+Parser.JoinDelimiters(this.tags)+")((?=\\*?"+this.blockCommentEnd+")|(?:[ \\t]+|:|$))(?<!\\*)(.*?(?=\\*?"+this.blockCommentEnd+"|$))";
		const commentRegEx = new RegExp(commentMatchString, "igm");

		//Finds if the block starts with the tag, highlight entire block
		// ? [0: Full Match] [1: lineStart+ Space/Indent] [2: BlockStart+Space] [3: Tag] [4: BlockEnd/Space/Colon]
		const fullBlockMatchString = "(^[ \\t]*)("+this.blockCommentStart+"[ \\t]*)("+Parser.JoinDelimiters(this.tags)+")((?=\\*?"+this.blockCommentEnd+")|(?:[ \\t]+|:|$))";
		const fullBlockRegEx = new RegExp(fullBlockMatchString, "i");


		// Find the multiline comment block
		for (const match of Parser.MatchAllInText(activeEditor.document.getText(), this.Expressions.MultiLineSimple)) {
			const commentBlock = match[0];
			const StartLine = activeEditor.document.positionAt(match.index).line;
			const EndLine = activeEditor.document.positionAt(match.index+commentBlock.length).line;
			if (this.CommentTracker.CheckRange(StartLine, EndLine)) continue; //Already has highlights in range, skip.


			// Check for leading delimiter for entire block colour.
			if (this.highlightFullBlockComments) {
				const SubMatch = activeEditor.document.lineAt(StartLine).text.match(fullBlockRegEx);
				if (SubMatch) {
					const matchString = (SubMatch[3] as string).toLowerCase();
					if (this.tagsMap.has(matchString)) {
						const StartIndex = match.index + match[1].length;
						const EndIndex = StartIndex + match[2].length + match[3].length + match[4].length;
						const Range = Parser.CreateRange(activeEditor.document, StartIndex, EndIndex);
						this.tagsMap.get(matchString)!.ranges.push(Range);
						//Adds full block to tracker to prevent nested highlighting
						this.CommentTracker.SetRange(StartLine, EndLine, true);
						continue;
					}
				}
			}

			// Find the specific lines that contain the match
			for (const line of Parser.MatchAllInText(commentBlock, commentRegEx)) {
				// Find which custom delimiter was used in order to add it to the collection
				const matchString = (line[2] as string).toLowerCase();
				if (this.tagsMap.has(matchString)) {
					const lineMatchIndex = line.index + match.index; //Adds index of start of block to index of match within the block.
					const range = ((!this.highlightTagOnly)
						? Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[0].length)
						: Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[1].length + line[2].length + line[3].trim().length)
					);
					if (this.CommentTracker.CheckFlag(range.start.line)) continue;
					this.CommentTracker.SetFlag(range.start.line, true);

					this.tagsMap.get(matchString)!.ranges.push(range);
				}
			}

			//Adds full block to tracker to prevent nested highlighting
			this.CommentTracker.SetRange(StartLine, EndLine, true);
		}
	}




	/**
	 * Finds block comments as indicated by start and end delimiter
	 * @param activeEditor The active text editor containing the code document
	 */
	 public FindBlockCommentsMixed(activeEditor: vscode.TextEditor): void {
		// Combine custom delimiters and the rest of the comment block matcher
		// ? [0: Full Match] [1: lineStart + Space/Indent/BlockStart] [2: Tag] [3: BlockEnd/Space/Colon] [4: BlockEnd/LineEnd]
		const commentMatchString = "(^[ \\t]*(?:"+ this.blockCommentStart +")?[ \\t]*)("+Parser.JoinDelimiters(this.tags)+")((?=\\*?"+this.blockCommentEnd+")|(?:[ \\t]+|:|$))(?<!\\*)(.*?(?=\\*?"+this.blockCommentEnd+"|$))";
		const commentRegEx = new RegExp(commentMatchString, "igm");

		// Find the multiline comment block
		for (const match of Parser.MatchAllInText(activeEditor.document.getText(), this.Expressions.MultiLineMixed)) {
			const commentBlock = match[0];
			const StartLine = activeEditor.document.positionAt(match.index).line;
			const EndLine = activeEditor.document.positionAt(match.index+commentBlock.length).line;
			if (this.CommentTracker.CheckRange(StartLine, EndLine)) continue; //Already has highlights in range, skip.
			for (const line of Parser.MatchAllInText(commentBlock, commentRegEx)) { // Find the line
				// Find which custom delimiter was used in order to add it to the collection
				const matchString = (line[2] as string).toLowerCase();
				if (this.tagsMap.has(matchString)) {
					const lineMatchIndex = line.index + match.index; //Adds index of start of block to index of match within the block.
					const range = ((!this.highlightTagOnly)
						? Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[0].length)
						: Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[1].length + line[2].length + line[3].trim().length)
					);
					if (this.CommentTracker.CheckFlag(range.start.line)) continue;
					this.CommentTracker.SetFlag(range.start.line, true);

					this.tagsMap.get(matchString)!.ranges.push(range);
				}
			}

			//Adds full block to tracker to prevent nested highlighting
			this.CommentTracker.SetRange(StartLine, EndLine, true);
		}
	}










	/**  .......................................................................................................................



	//Keyli


	/** 
	 * Finds all multiline comments starting with "*"
	 * @param activeEditor The active text editor containing the code document
	 */
	public FindJSDocComments(activeEditor: vscode.TextEditor): void {
		// If highlight multiline is off in package.json or doesn't apply to his language, return
		if (!this.highlightMultilineComments || !this.highlightJSDoc) return;

		// Highlight after leading /** or *
		const commentMatchString = "(^[ \\t]*(?:/\\*\\*|\\*)[ \\t]*)("+Parser.JoinDelimiters(this.tags)+")((?=\\*?\\*/|$)|(?:[ \\t]+|:|$))(?<!\\*)(.*?(?=\\*?\\*/|$))";
		const commentRegEx = new RegExp(commentMatchString, "igm");

		const fullBlockMatchString = "(^[ \\t]*)(/\\*\\*[ \\t]*)("+Parser.JoinDelimiters(this.tags)+")((?=\\*?\\*/|$)|(?:[ \\t]+|:|$))";
		const fullBlockRegEx = new RegExp(fullBlockMatchString, "i");


		// Find the multiline comment block
		for (const match of Parser.MatchAllInText(activeEditor.document.getText(), this.Expressions.MultiLineJSSimple)) {
			const commentBlock = match[0];
			const StartLine = activeEditor.document.positionAt(match.index).line;
			const EndLine = activeEditor.document.positionAt(match.index+commentBlock.length).line;
			if (this.CommentTracker.CheckRange(StartLine, EndLine)) continue; //Already has highlights in range, skip.

			if (this.highlightFullBlockComments) {
				// Check if the comment block contains a tag at the very start of it.
				const SubMatch = activeEditor.document.lineAt(StartLine).text.match(fullBlockRegEx);
				if (SubMatch) {
					const matchString = (SubMatch[3] as string).toLowerCase();
					if (this.tagsMap.has(matchString)) {
						const StartIndex = match.index + match[1].length;
						const EndIndex = StartIndex + match[2].length + match[3].length + match[4].length;
						const Range = Parser.CreateRange(activeEditor.document, StartIndex, EndIndex);
						this.tagsMap.get(matchString)!.ranges.push(Range);
						//Adds full block to tracker to prevent nested highlighting
						this.CommentTracker.SetRange(StartLine, EndLine, true);
						continue;
					}
				}
			}

			// Find the specific lines that contain the match
			for (const line of Parser.MatchAllInText(commentBlock, commentRegEx)) {
				// Find which custom delimiter was used in order to add it to the collection
				const matchString = (line[2] as string).toLowerCase();
				if (this.tagsMap.has(matchString)) {
					const lineMatchIndex = line.index + match.index;
					const range = ((!this.highlightTagOnly)
						? Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[0].length)
						: Parser.CreateRange(activeEditor.document, lineMatchIndex + line[1].length, lineMatchIndex + line[1].length + line[2].length + line[3].trim().length)
					);
					if (this.CommentTracker.CheckFlag(range.start.line)) continue;
					this.CommentTracker.SetFlag(range.start.line, true);
					this.tagsMap.get(matchString)!.ranges.push(range);
				}
			}

			//Adds full block to tracker to prevent nested highlighting
			this.CommentTracker.SetRange(StartLine, EndLine, true);
		}
	}




	//===============================================================================================================================================















	/** .......................................................................................................................
	 * Apply decorations after finding all relevant comments
	 * @param activeEditor The active text editor containing the code document
	 */
	public ApplyDecorations(activeEditor: vscode.TextEditor): void {
		// this.ApplyHide(activeEditor);
		for (const tag of this.tags) {
			activeEditor.setDecorations(tag.decoration, tag.ranges);
			tag.ranges.length = 0; // clear the ranges for the next pass
		}

		this.CommentTracker.ClearAll(); // clear the ranges for the next pass

		//Provides highlighting for comment links 
		if (this.highlightLinkedComments) {
			const ranges = getLinksRangesDoc(activeEditor.document);
			activeEditor.setDecorations(linkedCommentDecoration, ranges);
		}
	}

	/**
	 * Clears all active decorations.
	 * @param activeEditor The active text editor containing the code document
	 */
	 public RemoveDecorations(activeEditor: vscode.TextEditor): void {
		for (const tag of this.tags) {
			activeEditor.setDecorations(tag.decoration, []);
			tag.ranges.length = 0; // clear the ranges for the next pass
		}
		activeEditor.setDecorations(linkedCommentDecoration, []);
		
		// activeEditor.setDecorations(this.hideCommentsTag.decoration, []);
		// this.hideCommentsTag.ranges.length = 0; // clear the ranges for the next pass
	}





	//#region  Private Methods.......................................................................................................................

	/**
	 * A set listing all of the "languages", like plaintext, that don't have comment syntax
	 */ /* */
	private static readonly TextLanguages = new Set([
		'code-text-binary', 'bibtex', 'log', 'Log', 'search-result', 
		'plaintext', 'juliamarkdown', 'scminput', 'properties', 'csv', 'tsv', 'excel'
	]);


	/**
	 * Sets the comment delimiter [//, #, --, '] of a given language
	 * @param languageCode The short code of the current language
	 * https://code.visualstudio.com/docs/languages/identifiers
	 */
	private setDelimiter(languageCode: string): void {
		this.supportedLanguage = false;
		this.ignoreFirstLine = false;
		this.isPlainText = false;

		const config: vscode.CommentRule|undefined = Configuration.GetCommentConfiguration(languageCode); 
		if (config) {
			this.supportedLanguage = true;
			this.ignoreFirstLine = Configuration.GetHasShebang(languageCode);
			this.setCommentFormat(config.lineComment, config.blockComment?.[0], config.blockComment?.[1]);
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
			default:
				if (Parser.TextLanguages.has(languageCode)) {
					this.isPlainText = true;
					// If highlight plaintext is enabled, this is a supported language
					this.supportedLanguage = this.contributions.highlightPlainText;
					this.highlightMonolineComments = true;
					this.highlightMultilineComments = false;
				}
				break;
		}
	}
	

	/** Sets the highlighting tags up for use by the parser */
	private setTags(): void {
		for (const item of this.contributions.tags) {
			//Create the format used for the tag
			const options = Parser.TagDefinitionToDecorationOptions(item);
			
			//Idea: allow item.tag to be an array? Avoid the need for alias field to begin with.
			//Create CommentTag for primary tag
			if (!item.isRegex) this.PushTag(Parser.CreateTag(item.tag, options));
			else this.PushRegexTag(Parser.CreateRegexTag(item.tag, options))
			//Turn each alias into its own CommentTag because im lazy and it is easy to do.
			item.aliases?.forEach(aliasTag => this.PushTag(Parser.CreateTag(aliasTag, options)));
		}
	}

	

	


	/**
	 * Set up the comment format for single and multiline highlighting
	 * @param monoLine The single line comment delimiter. If NULL, monoline is not supported
	 * @param start The start delimiter for block comments
	 * @param end The end delimiter for block comments
	 */
	private setCommentFormat(monoLine: string|string[]|nulldefined, start: string|nulldefined = null, end: string|nulldefined = null): void {
		this.delimiter = "";
		this.blockCommentStart = "";
		this.blockCommentEnd = "";
		this.tagArray = "";
		this.highlightMonolineComments = false;
		this.highlightMultilineComments = false;
		this.highlightFullBlockComments = false;

		// If no single line comment delimiter is passed, monoline comments are not supported
		if (monoLine) {
			this.highlightMonolineComments = this.contributions.monolineComments;
			// if a single delimiter is passed, the language has one single line comment format
			if (IsString(monoLine)) {
				this.delimiter = Parser.escapeSlashes(Parser.escapeRegExp(monoLine));
			// if multiple delimiters are passed, the language has more than one single line comment format
			} else if (monoLine.length > 0) {
				this.delimiter = monoLine.map(Parser.escapeRegExp).map(Parser.escapeSlashes).join('|');
			} else {
				this.highlightMonolineComments = false;
			}
		}

		if (start && end) {
			this.highlightMultilineComments = this.contributions.multilineComments;
			this.blockCommentStart = Parser.escapeRegExp(start);
			this.blockCommentEnd = Parser.escapeRegExp(end);
			this.highlightFullBlockComments = this.contributions.allowFullBlockHighlights;
		}

		this.highlightTagOnly = this.contributions.highlightTagOnly;
	}



	//#endregion
}



const IsString = (item:any): item is String => typeof item === 'string';









export function getDocumentType(fsPath: string) { return /\.([\w]+)$/.exec(fsPath)?.pop(); }
























































//Makes all letters into character class of upper and lower versions.
export function MakeCaseInsensitive(regexString:string) {
	return regexString.replace(/\w/, (match) => `[${match.toLowerCase()}${match.toUpperCase()}]`)
}

export function MakeTitleMatcher(regexString:string) {
	return regexString + regexString.charAt(regexString.length-1) + '*';
}



















































	// // @ts-ignore
	// private static escapeRegExp2(s:string) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); }
	// private static escapeMarkdownSyntaxTokens(text: string): string {
	// 	return text.replace(/[.,_~-*+/;:^`'"!?%#&$@<=>()[\]{|}]/g, '\\$&');
	// }
	
	// private static removeMarkdownEscapes(text: string): string {
	// 	return text.replace(/\\([.,_~-*+/;:^`'"!?%#&$@<=>()[\]{|}])/g, '$1');
	// }






// export class RegexBuilder {
// 	public readonly LS = '^'
// 	public readonly LE = '$'
// 	public readonly Indent = "[ \\t]*";


// 	public Group(content:string) { return `(${content})`}
// 	public NamedGroup(name:string, content:string) { return `(?<${name}>${content})`}
// 	public NonCaptureGroup(content:string) { return `(?:${content})`}
	
// 	public LookAhead(content:string) { return `(?=${content})`}
// 	public LookNotAhead(content:string) { return `(?!${content})`}
	
// 	public LookBehind(content:string) { return `(?<=${content})`}
// 	public LookNotBehind(content:string) { return `(?<!${content})`}
	
// 	public Any(...content: string[]) { return content.join('|')}


// 	public GroupRef(index:int|string) {return (typeof index === 'number') 
// 		? `\\${index >>> 0}`
// 		: `\\k<${index}>`
// 	}
// }















		// this.Expressions.MonoLineBlockMixed = new RegExp(`(^[ \\t]*)(${this.blockCommentStart})(.*?)(${this.blockCommentEnd})`, "ig");
		//(^[ \t]*\S.*?)(/\*\*?)((?:.*[\r\n]+)*?.*)(\*?\*/)
		//^[ \t]*(?!/\*|//)\S+.*?(?:\*/)?(/\*[^\*])([\s\S\n]*?)(\*/)
		// this.Expressions.MultiLineMixed = new RegExp("(^)([ \\t]*(?!"+this.delimiter+"|"+this.blockCommentStart+")\\S+.*?(?:"+this.blockCommentEnd+")?)"+MultiLineCommon, "igm");



















// // Sort folders and workspace files alphabetically,
// // putting folders above workspace files.
// const sortFilesAndFolders = function sortFilesAndFolders(a:any, b:any) {
// 	if (a.collapsableState === vscode.TreeItemCollapsibleState.Collapsed) {
// 		if (b.collapsableState === vscode.TreeItemCollapsibleState.Collapsed) {
// 			return (a.label === [a.label, b.label].sort())? -1 : 1;
// 		} else return -1;
// 	}
// 	if (b.collapsableState === vscode.TreeItemCollapsibleState.Collapsed) return 1;
// 	return (a.label === [a.label, b.label].sort())? -1 : 1;
// };










// export class RegexBuilder {
// 	private regexString: string;


// 	public constructor();
// 	public constructor(initialValue:string);
// 	public constructor(initialValue:string = '') {
// 		this.regexString = initialValue;
// 	}





// }













// export namespace CustomCommands {
// 	export async function RemoveSelectedComments() {
// 		const ActiveEditor = vscode.window.activeTextEditor;
// 		if (!ActiveEditor) return;
// 		const ActiveDocument = DocumentLoader.getDocument(ActiveEditor.document.uri);
// 		if (ActiveDocument === undefined) return; //No tokens loaded yet, cant properly find comments.
// 		const Selections = ActiveEditor.selections;
		


		
// 	}




// }





























//[[./extension.ts]]

//[[icon.png]]


	/**
	 * Idea: first split document up into groups that are not block comments and ones that are. Iterate over each individual group and apply the formatting appropriately.
	 * ? Nothing is telling this code not to parse single line and multi line in the same area.
	 * 
	 * ISSUE: When you put "//*" inside a string, it will detect that line as a string from that point onwards.
	 * Example: ^"//*" this text gets highlighted;
	 *
	 * [[Hello ]] dadw [[    ]] [[icon.png]]
	**/



	/*!*/
	/**!*/
	/*!**/
	/**!**/
	
	/*! */
	/**! */
	/*! **/
	/**! **/

	/* !*/
	/** !*/
	/* !**/
	/** !**/

	/* ! */
	/** ! */
	/* ! **/
	/** ! **/


/** ! */ /** ! */
/** ! */ //! hello? /** ! */
/** ! */ /** //! Oh no 
 * ! hello? 
*/







	
//The idea is that monoline comments which are the only content on the line are easy to identify
//same goes for block comments which span multiple lines, however,
//identifying comments which are on the same line as actual code/text, is near impossible to properly support without parsing grammar.
//So it stands to reason that using simple regex to find the easy cases combined with the more intensive grammar parsing on possible matches 
//Will enable a fast decoration while handling all of the edge cases as they appear in the more accurate but worst performance way would be ideal.

//Plan:
//Use regex for finding monoline comments which are the only content on the line,
//Use refex for finding multiline block comments which span many lines

//Use regex to identify possible mixed lines and pass to the token parser to extract those comments to maintain consitant highlightning.

//.................................
//(^)[ \t]*(//)[ \t]*(\*|Todo)([ :].*)
//.................................
//? Finds all basic monoline comments
//(^)[ \t]*(//)[ \t]*(.*)
//? Finds all basic multiline comments
//(^)[ \t]*(/\*\*?)((?:.*[\r\n]+)*?.*)(\*?\*/)

//? Finds all possible mixed monoline comments
//(^[ \t]*(?!//)\S.*?)(//)(.*)
//? Finds all possible mixed multiline comments
//(^[ \t]*\S.*?)(/\*\*?)((?:.*[\r\n]+)*?.*)(\*?\*/)

//For possible mixed comments, check the token just before if its a comment, if it is then ignore the match.





//TODO: on multiline, check if starts with delimiter




















// // 'sticky' flag is not yet supported :(
// const lineEndingRE = /([^\r\n]*)(\r\n|\r|\n)?/;

// function getContent(lineText:string, match:RegExpMatchArray) {
//     return lineText.substring(lineText.indexOf(match[0]), lineText.length);
// };


// function createStatusBarItem() {
//     var statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Left);
//     statusBarItem.text = defaultIcon + defaultMsg;
//     statusBarItem.tooltip = 'List annotations';
//     statusBarItem.command = 'todohighlight.showOutputChannel';
//     return statusBarItem;
// };



// function errorHandler(err) {
//     window.processing = true;
//     setStatusMsg(defaultIcon, defaultMsg);
//     console.log('todohighlight err:', err);
// }


// function setStatusMsg(icon, msg, tooltip) {
// 	window.sta
//     if (window.statusBarItem) {
//         window.statusBarItem.text = `${icon} ${msg}` || '';
//         if (tooltip) {
//             window.statusBarItem.tooltip = tooltip;
//         }
//         window.statusBarItem.show();
//     }
// }



/* /* 
 */

/* 
 dwada*/   /* 
 */

 /* 
 wad */           /*  */
 
/*  */         /*  */


//  /* not selected */