import * as vscode from 'vscode';
import * as path from 'path';
import * as minimatch from 'minimatch';
import * as process from 'process';











export function endWithSlash(path: string): string {
	return (path.charCodeAt(path.length - 1) === CharCode.Slash)? path : path+'/';
}

export function dirname(fsPath: string, path: path.PlatformPath) {
    return path.dirname(fsPath) + path.sep;
}

export function basename(fsPath: string, withExt: boolean, path: path.PlatformPath) {
	return path.basename(fsPath, ((withExt)? path.extname(fsPath) : undefined));
}

















export function GlobSearch(editor : vscode.TextEditor, path : string) {
	// Support matches by filenames and relative file paths.
	const pattern = path.includes('/') || path.includes('\\') ? path : `**/${path}`;
	const options = <minimatch.IOptions>{ nocase: (process.platform === 'win32') };
	return minimatch(vscode.workspace.asRelativePath(editor.document.fileName), pattern, options);
}



export function createFilter (includeSTR:string[], excludeSTR:string[]) {
	const options = <minimatch.IOptions>{ nocase: (process.platform === 'win32') };

	const includes = includeSTR.map(id => new minimatch.Minimatch(path.resolve(id), options));
	const excludes = excludeSTR.map(id => new minimatch.Minimatch(path.resolve(id), options));

	return (id:string) => {
		if (/\0/.test(id)) return false;
		id = id.replace(path.sep, '/');

		let included = !includes.length;
		includes.forEach(minimatch => { if (minimatch.match(id)) included = true; });
		excludes.forEach(minimatch => { if (minimatch.match(id)) included = false; });
		return included;
	};
}






/**
 * Checks if a string matches a list of patterns.
 */
export function matchPatterns(filePath: string, includePatterns: string[], excludePatterns: string[]): boolean {
	const included = includePatterns.some((pattern) => minimatch(filePath, pattern));
	const excluded = excludePatterns.every((pattern) => minimatch(filePath, pattern));
	return included && excluded;
}

/**
 * Given a list of patterns, returns include and exclude patterns.
 * Exclude patterns are prefixed with !.
 */
export const sortPatterns = (patterns: string[]) => ({
	includePatterns: patterns.filter((pattern) => !pattern.startsWith('!')),
	excludePatterns: patterns.filter((pattern) => pattern.startsWith('!')),
});




/**
 * replace \ with \\ in a path to make it windows compatible
 * for example replace
 * from c:\my-folder\my-file with
 * from c:\\my-folder\\my-file
 */
 export function toWindowsCompatiblePath(path: string): string {
	return path.replace(/\\/g, '\\\\');
  }

// sometimes, destination may not contain path separator in the end (path to folder), but the src does. So let's ensure paths have path separators in the end
export function ensureEndSlash(s: string) {
	return s.length === 0 || s.endsWith(path.sep) ? s : (s + path.sep)
}


// https://github.com/joshwnj/minimatch-all/blob/master/index.js
export function minimatchAll(path:string, patterns:string[], opts?:minimatch.IOptions) {
	var match = false;

	patterns.forEach(function (pattern) {
		const isExclusion = (pattern[0] === '!');

		// If we've got a match, only re-test for exclusions.
		// if we don't have a match, only re-test for inclusions.
		if (match !== isExclusion) return;

		match = minimatch(path, pattern, opts);
	});
	return match;
};



export function filterFiles(files: string[], patterns: string[], include: boolean): string[] {
    if (patterns.length === 0) return (include)? [] : files;
    const matcher = patterns.map(pattern => new minimatch.Minimatch(pattern, { dot: !include })); // `glob` always enables `dot` for ignore patterns
    return files.filter(file => include === matcher.some(pattern => pattern.match(file)));
}




// const root = path.join(__dirname, "..", "..")


export function excludePatternFromList(excludeSearch: string[], stringList: string[], isFolders: boolean = true) {
	for (const pattern of excludeSearch) {
		if (isFolders === pattern.includes('/')) stringList = stringList.filter((str) => !minimatch(str, pattern));
	}
	return stringList;
}

















export abstract class BaseFilter {

    private includeFilters: string[];
    private excludeFilters: string[];

    private cache: Map<string, boolean> = new Map<string, boolean>();

    public constructor(includeFilters: string[], excludeFilters: string[]) {
        this.includeFilters = includeFilters;
        this.excludeFilters = excludeFilters;
    }

    protected baseMatch(matchValue: string): boolean {
        if (this.cache.has(matchValue)) return this.cache.get(matchValue)!;

        let result = false;

        for (const index in this.includeFilters) {
            if (minimatch(matchValue, this.includeFilters[index])) {
                result = true;
                break;
            }
        }

        if (!result) {
            this.cache.set(matchValue, result);
            return result;
        }

        for (const index in this.excludeFilters) {
            if (minimatch(matchValue, this.excludeFilters[index], { flipNegate: true })) {
                result = false;
                break;
            }
        }

        this.cache.set(matchValue, result);
        return result;
    }
}