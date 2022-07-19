

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





// interface CommentConfig {
//     lineComment?: string;
//     blockComment?: [string, string];
// }


 /** The 'package.json' file of an app. */
interface AppPackageJSON {
	/** Information about the author. */
	author?: {
		 /** The email address. */
		email?: string;
		 /** The name. */
		name?: string;
		 /** The (homepage) URL. */
		url?: string;
	};
	 /** A list of one or more dependencies. */
	dependencies?: { [module: string]: string };
	 /** A list of one or more dev dependencies. */
	devDependencies?: { [module: string]: string };
	 /** The description. */
	description?: string;
	 /** The display name. */
	displayName?: string;
	 /** The software license (ID). */
	license?: string;
	 /** The (internal) name. */
	name?: string;
	 /** Options for the script. */
	options?: { [key: string]: any };
	 /** The version number. */
	version?: string;
	 /** Use Vuetify instead of Bootstrap or not. */
	vue?: boolean;
}


// (/\*\*)\n.+\*(.*)\n.*( \*/)
// $1$2$3