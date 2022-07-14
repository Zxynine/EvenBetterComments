interface CommentTag {
	tag: string;
	escapedTag: string;
	lowerTag: string;
	decoration: any;
	ranges: Array<any>;
}

interface Contributions {
	monolineComments: boolean;
	multilineComments: boolean;
	useJSDocStyle: boolean;
	highlightPlainText: boolean;
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


// interface EnclosingPair {
// 	leftTag : string;
// 	rightTag : string;
// }