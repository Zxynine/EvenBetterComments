interface CommentTag {
	tag: string;
	escapedTag: string;
	decoration: any;
	ranges: Array<any>;
}

interface Contributions {
	singlelineComments: boolean;
	multilineComments: boolean;
	useJSDocStyle: boolean;
	highlightPlainText: boolean;
	ignoreShebangFormat: boolean;
	allowNestedHighlighting: boolean;
	tags: [{
		tag: string;
		aliases: Array<string>;
		color: string;
        overline: boolean;
		strikethrough: boolean;
		underline: boolean;
		bold: boolean;
		italic: boolean;
		backgroundColor: string;
	}];
}

interface CommentConfig {
	lineComment?: string;
	blockComment?: [string, string];
}