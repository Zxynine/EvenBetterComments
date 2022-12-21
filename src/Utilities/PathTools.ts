import * as vscode from 'vscode';
import * as path from 'path';
import * as minimatch from 'minimatch';
import * as process from 'process';
import * as fs from 'fs';
import * as os from 'os'
// import * as find from "find"













// const DRIVE_LETTER_PATH_REGEX = /^[a-z]:\//;




/* Path Manipulation */
const FS_REGEX = /\\/g;

/**
 * Get the normalised path of a URI.
 * @param uri The URI.
 * @returns The normalised path.
 */
export function getPathFromUri(uri: vscode.Uri) {
	return uri.fsPath.replace(FS_REGEX, '/');
}


/**
 * Get the normalised path of a string.
 * @param str The string.
 * @returns The normalised path.
 */
export function getPathFromStr(str: string) {
	return str.replace(FS_REGEX, '/');
}

/**
 * Get the path with a trailing slash.
 * @param path The path.
 * @returns The path with a trailing slash.
 */
export function pathWithTrailingSlash(path: string) {
	return (path.charCodeAt(path.length - 1) === CharCode.Slash)? path : path+'/';
}


/**
 * Check whether a path is within the current Visual Studio Code Workspace.
 * @param path The path to check.
 * @returns TRUE => Path is in workspace, FALSE => Path isn't in workspace.
 */
export function isPathInWorkspace(path: string) {
	let rootsExact = [], rootsFolder = [], workspaceFolders = vscode.workspace.workspaceFolders;
	if (typeof workspaceFolders !== 'undefined') {
		for (const Folder of workspaceFolders) {
			const tmpPath = getPathFromUri(Folder.uri);
			rootsExact.push(tmpPath);
			rootsFolder.push(pathWithTrailingSlash(tmpPath));
		}
	}
	return rootsExact.indexOf(path) > -1 || rootsFolder.findIndex(x => path.startsWith(x)) > -1;
}


/**
 * Get the normalised canonical absolute path (i.e. resolves symlinks in `path`).
 * @param path The path.
 * @param native Use the native realpath.
 * @returns The normalised canonical absolute path.
 */
export function realpath(path: string, native: boolean = false) {
	return new Promise<string>((resolve) => {
		(native ? fs.realpath.native : fs.realpath)(path, (err, resolvedPath) => resolve(err !== null ? path : getPathFromUri(vscode.Uri.file(resolvedPath))));
	});
}


/**
 * Checks whether a file exists, and the user has access to read it.
 * @param path The path of the file.
 * @returns Promise resolving to a boolean: TRUE => File exists, FALSE => File doesn't exist.
 */
export function doesFileExist(path: string) {
	return new Promise<boolean>((resolve) => fs.access(path, fs.constants.R_OK, (err) => resolve(err === null)));
}











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



























// export function formatPath(
// 	pathOrUri: string | vscode.Uri,
// 	options?:
// 		| {
// 				fileOnly?: false;
// 				relativeTo?: string;
// 				suffix?: string;
// 				truncateTo?: number;
// 		}
// 		| {
// 				fileOnly?: true;
// 				relativeTo?: never;
// 				suffix?: string;
// 				truncateTo?: number;
// 		},
// ): string {
// 	const _path = getBestPath(pathOrUri);
// 	let file = path.basename(_path);

// 	if (options?.truncateTo != null && file.length >= options.truncateTo) {
// 		return truncateMiddle(file, options.truncateTo);
// 	}

// 	if (options?.suffix) {
// 		if (options.truncateTo != null && file.length + options.suffix.length >= options.truncateTo) {
// 			return `${truncateMiddle(file, options.truncateTo - options.suffix.length)}${options.suffix}`;
// 		}

// 		file += options.suffix;
// 	}

// 	if (options?.fileOnly) return file;

// 	const directory = relativeDir(_path, options?.relativeTo);
// 	if (!directory) return file;

// 	file = `/${file}`;

// 	if (options?.truncateTo != null && file.length + directory.length >= options.truncateTo) {
// 		return `${truncateLeft(directory, options.truncateTo - file.length)}${file}`;
// 	}

// 	return `${directory}${file}`;
// }



//https://github.com/gitkraken/vscode-gitlens/blob/main/src/system/searchTree.ts



// const slash = 47; //slash;

// const driveLetterNormalizeRegex = /(?<=^\/?)([A-Z])(?=:\/)/;
const hasSchemeRegex = /^([a-zA-Z][\w+.-]+):/;
// const pathNormalizeRegex = /\\/g;
const vslsHasPrefixRegex = /^[/|\\]~(?:\d+?|external)(?:[/|\\]|$)/;
const vslsRootUriRegex = /^[/|\\]~(?:\d+?|external)(?:[/|\\]|$)/;

// export function addVslsPrefixIfNeeded(path: string): string;
// export function addVslsPrefixIfNeeded(uri: vscode.Uri): vscode.Uri;
// export function addVslsPrefixIfNeeded(pathOrUri: string | vscode.Uri): string | vscode.Uri;
// export function addVslsPrefixIfNeeded(pathOrUri: string | vscode.Uri): string | vscode.Uri {
// 	if (typeof pathOrUri === 'string') {
// 		if (maybeUri(pathOrUri)) {
// 			pathOrUri = vscode.Uri.parse(pathOrUri);
// 		}
// 	}

// 	if (typeof pathOrUri === 'string') {
// 		if (hasVslsPrefix(pathOrUri)) return pathOrUri;

// 		pathOrUri = normalizePath(pathOrUri);
// 		return `/~0${pathOrUri.charCodeAt(0) === slash ? pathOrUri : `/${pathOrUri}`}`;
// 	}

// 	let path = pathOrUri.fsPath;
// 	if (hasVslsPrefix(path)) return pathOrUri;

// 	path = normalizePath(path);
// 	return pathOrUri.with({ path: `/~0${path.charCodeAt(0) === slash ? path : `/${path}`}` });
// }

export function hasVslsPrefix(path: string): boolean {
	return vslsHasPrefixRegex.test(path);
}

export function isVslsRoot(path: string): boolean {
	return vslsRootUriRegex.test(path);
}

// export function commonBase(s1: string, s2: string, delimiter: string, ignoreCase?: boolean): string | undefined {
// 	const index = commonBaseIndex(s1, s2, delimiter, ignoreCase);
// 	return index > 0 ? s1.substring(0, index + 1) : undefined;
// }

// export function commonBaseIndex(s1: string, s2: string, delimiter: string, ignoreCase?: boolean): number {
// 	if (s1.length === 0 || s2.length === 0) return 0;

// 	if (ignoreCase ?? !isLinux) {
// 		s1 = s1.toLowerCase();
// 		s2 = s2.toLowerCase();
// 	}

// 	let char;
// 	let index = 0;
// 	for (let i = 0; i < s1.length; i++) {
// 		char = s1[i];
// 		if (char !== s2[i]) break;

// 		if (char === delimiter) {
// 			index = i;
// 		}
// 	}

// 	return index;
// }

// export function getBestPath(uri: vscode.Uri): string;
// export function getBestPath(pathOrUri: string | vscode.Uri): string;
// export function getBestPath(pathOrUri: string | vscode.Uri): string {
// 	if (typeof pathOrUri === 'string') {
// 		if (!hasSchemeRegex.test(pathOrUri)) return normalizePath(pathOrUri);

// 		pathOrUri = vscode.Uri.parse(pathOrUri, true);
// 	}

// 	return normalizePath(pathOrUri.scheme === Schemes.File ? pathOrUri.fsPath : pathOrUri.path);
// }

export function getScheme(path: string): string | undefined {
	return hasSchemeRegex.exec(path)?.[1];
}

// export function isChild(path: string, base: string | vscode.Uri): boolean;
// export function isChild(uri: vscode.Uri, base: string | vscode.Uri): boolean;
// export function isChild(pathOrUri: string | vscode.Uri, base: string | vscode.Uri): boolean {
// 	if (typeof base === 'string') {
// 		if (base.charCodeAt(0) !== slash) {
// 			base = `/${base}`;
// 		}

// 		return (
// 			isDescendent(pathOrUri, base) &&
// 			(typeof pathOrUri === 'string' ? pathOrUri : pathOrUri.path)
// 				.substr(base.length + (base.charCodeAt(base.length - 1) === slash ? 0 : 1))
// 				.split('/').length === 1
// 		);
// 	}

// 	return (
// 		isDescendent(pathOrUri, base) &&
// 		(typeof pathOrUri === 'string' ? pathOrUri : pathOrUri.path)
// 			.substr(base.path.length + (base.path.charCodeAt(base.path.length - 1) === slash ? 0 : 1))
// 			.split('/').length === 1
// 	);
// }

// export function isDescendent(path: string, base: string | vscode.Uri): boolean;
// export function isDescendent(uri: vscode.Uri, base: string | vscode.Uri): boolean;
// export function isDescendent(pathOrUri: string | vscode.Uri, base: string | vscode.Uri): boolean;
// export function isDescendent(pathOrUri: string | vscode.Uri, base: string | vscode.Uri): boolean {
// 	if (typeof base === 'string') {
// 		base = normalizePath(base);
// 		if (base.charCodeAt(0) !== slash) {
// 			base = `/${base}`;
// 		}
// 	}

// 	if (typeof pathOrUri === 'string') {
// 		pathOrUri = normalizePath(pathOrUri);
// 		if (pathOrUri.charCodeAt(0) !== slash) {
// 			pathOrUri = `/${pathOrUri}`;
// 		}
// 	}

// 	if (typeof base === 'string') {
// 		return (
// 			base.length === 1 ||
// 			(typeof pathOrUri === 'string' ? pathOrUri : pathOrUri.path).startsWith(
// 				base.charCodeAt(base.length - 1) === slash ? base : `${base}/`,
// 			)
// 		);
// 	}

// 	if (typeof pathOrUri === 'string') {
// 		return (
// 			base.path.length === 1 ||
// 			pathOrUri.startsWith(base.path.charCodeAt(base.path.length - 1) === slash ? base.path : `${base.path}/`)
// 		);
// 	}

// 	return (
// 		base.scheme === pathOrUri.scheme &&
// 		base.authority === pathOrUri.authority &&
// 		(base.path.length === 1 ||
// 			pathOrUri.path.startsWith(
// 				base.path.charCodeAt(base.path.length - 1) === slash ? base.path : `${base.path}/`,
// 			))
// 	);
// }

// export function isAbsolute(path: string): boolean {
// 	return !maybeUri(path) && _isAbsolute(path);
// }

export function isFolderGlob(_path: string): boolean {
	return path.basename(_path) === '*';
}

export function maybeUri(path: string): boolean {
	return hasSchemeRegex.test(path);
}

// export function normalizePath(path: string): string {
// 	if (!path) return path;

// 	path = path.replace(pathNormalizeRegex, '/');
// 	if (path.charCodeAt(path.length - 1) === slash) {
// 		// Don't remove the trailing slash on Windows root folders, such as z:\
// 		if (!isWindows || path.length !== 3 || path[1] !== ':') {
// 			path = path.slice(0, -1);
// 		}
// 	}

// 	if (isWindows) {
// 		// Ensure that drive casing is normalized (lower case)
// 		path = path.replace(driveLetterNormalizeRegex, d => d.toLowerCase());
// 	}

// 	return path;
// }

// export function relative(from: string, to: string, ignoreCase?: boolean): string {
// 	from = hasSchemeRegex.test(from) ? vscode.Uri.parse(from, true).path : normalizePath(from);
// 	to = hasSchemeRegex.test(to) ? vscode.Uri.parse(to, true).path : normalizePath(to);

// 	const index = commonBaseIndex(`${to}/`, `${from}/`, '/', ignoreCase);
// 	return index > 0 ? to.substring(index + 1) : to;
// }

// export function relativeDir(relativePath: string, relativeTo?: string): string {
// 	const dirPath = path.dirname(relativePath);
// 	if (!dirPath || dirPath === '.' || dirPath === relativeTo) return '';
// 	if (!relativeTo) return dirPath;

// 	const [relativeDirPath] = splitPath(dirPath, relativeTo);
// 	return relativeDirPath;
// }

// export function splitPath(
// 	pathOrUri: string | vscode.Uri,
// 	repoPath: string | undefined,
// 	splitOnBaseIfMissing: boolean = false,
// 	ignoreCase?: boolean,
// ): [string, string] {
// 	pathOrUri = getBestPath(pathOrUri);

// 	if (repoPath) {
// 		let repoUri;
// 		if (hasSchemeRegex.test(repoPath)) {
// 			repoUri = vscode.Uri.parse(repoPath, true);
// 			repoPath = getBestPath(repoUri);
// 		} else {
// 			repoPath = normalizePath(repoPath);
// 		}

// 		const index = commonBaseIndex(`${repoPath}/`, `${pathOrUri}/`, '/', ignoreCase);
// 		if (index > 0) {
// 			repoPath = pathOrUri.substring(0, index);
// 			pathOrUri = pathOrUri.substring(index + 1);
// 		} else if (pathOrUri.charCodeAt(0) === slash) {
// 			pathOrUri = pathOrUri.slice(1);
// 		}

// 		if (repoUri != null) {
// 			repoPath = repoUri.with({ path: repoPath }).toString();
// 		}
// 	} else {
// 		repoPath = normalizePath(splitOnBaseIfMissing ? path.dirname(pathOrUri) : '');
// 		pathOrUri = splitOnBaseIfMissing ? path.basename(pathOrUri) : pathOrUri;
// 	}

// 	return [pathOrUri, repoPath];
// }







export function normalizePath(p: string) {
    p = path.normalize(p);
    
	if (process.platform === 'win32') {
        // normalize drive letter only, assuming rest is identical
        if (path.isAbsolute(p)) {
            p = p.substr(0, 1).toLowerCase() + p.substr(1)
        }
	}

	return p;
}












function isWindowsPath(path: string): boolean {
	return /^[a-zA-Z]:\\/.test(path);
}

export function isDescendant(parent: string, descendant: string): boolean {
	if (parent === descendant) {
		return true;
	}

	if (parent.charAt(parent.length - 1) !== path.sep) {
		parent += path.sep;
	}

	// Windows is case insensitive
	if (isWindowsPath(parent)) {
		parent = parent.toLowerCase();
		descendant = descendant.toLowerCase();
	}

	return descendant.startsWith(parent);
}










export interface CheckFile {
	isFile: boolean;
	isFolder: boolean;
  }
  
  export const checkFile = (file: string): CheckFile => {
	try {
	  const isFolder = fs.lstatSync(file).isDirectory();
	  return { isFile: !isFolder, isFolder };
	} catch (error) {
	  return { isFile: false, isFolder: false };
	}
  };


//   const foldersToIgnore = ['node_modules', 'out', 'dist', 'build', 'public']; // Folders that slow down collection or won't have workspace files in
// const foldersToAllow = ['.vscode']; // Some users store workspaces files here

// export const collectFilesFromFolder = async (
//   folder: string,
//   fileType: string,
//   maxDepth: number,
//   curDepth: number
// ): Promise<WsFiles> => {
//   if (curDepth <= maxDepth) {
//     try {
//       const filenames = await fs.promises.readdir(folder).then((files) => {
//         return files.reduce((allFiles: string[], curFile) => {
//           if (
//             foldersToAllow.includes(curFile) ||
//             (!isHiddenFile(curFile) && !foldersToIgnore.includes(curFile))
//           ) {
//             return [...allFiles, curFile];
//           }

//           return allFiles;
//         }, []);
//       });

//       const folders = getFilenamesOfType('folders', filenames, folder, fileType);
//       let files = getFilenamesOfType('files', filenames, folder, fileType);

//       if (folders.length > 0) {
//         for (let index = 0; index < folders.length; index++) {
//           const subFiles = await collectFilesFromFolder(
//             folders[index],
//             fileType,
//             maxDepth,
//             curDepth + 1
//           );
//           files = [...files, ...subFiles];
//         }
//       }

//       return files;
//     } catch (err) {
//       return [];
//     }
//   }

//   return [];
// };


export const isHiddenFile = (fileName: string): boolean => fileName.substring(0, 1) === '.';
export const isSelected = (file: string, selected: string, platform: string) => {
	if (platform === 'win32') {
	  return file.toLowerCase() === selected.toLowerCase();
	}
  
	return file === selected;
  };

  
export const isWorkspaceFile = (path: string, scheme: string) => {
	if (scheme === 'file') {
	  const fileName = getLastPathSegment(path);
	  const ext = fileName.substring(fileName.lastIndexOf('.') + 1);
  
	  if (ext && ext === FS_WS_FILETYPE) {
		return true;
	  }
	}
  
	return false;
  };


  
export const getLastPathSegment = (_path: string): string => {
	const lastSlashIndex = _path.lastIndexOf(path.sep);
	return _path.substring(lastSlashIndex + 1);
  };


// export const FS_FOLDER_CSS = 'css';
// export const FS_FOLDER_IMAGES = 'images';
// export const FS_FOLDER_IMAGES_DARK = 'dark';
// export const FS_FOLDER_IMAGES_LIGHT = 'light';
// export const FS_FOLDER_JS = 'js';
// export const FS_FOLDER_RESOURCES = 'resources';
export const FS_WS_FILETYPE = 'code-workspace';
// export const FS_WS_EXT = `.${FS_WS_FILETYPE}`;
// export const FS_WEBVIEW_CODICONS_CSS = 'codicon.css';
// export const FS_WEBVIEW_UI_TOOLKIT_JS = 'toolkit.js';
// export const FS_WEBVIEW_WORKSPACE_CSS = 'webview-workspace.css';
// export const FS_WEBVIEW_WORKSPACE_JS = 'webview-workspace.js';











export function createFolderGlob( folderPath:string, rootPath:string, filter:string ) {
    if( process.platform === 'win32' ) {
        var fp = folderPath.replace( /\\/g, '/' );
        var rp = rootPath.replace( /\\/g, '/' );

        if( fp.indexOf( rp ) === 0 ) {
            fp = fp.substring( path.dirname( rp ).length );
        }

        return ( "**/" + fp + filter ).replace( /\/\//g, '/' );
    }

    return ( folderPath + filter ).replace( /\/\//g, '/' );
}

// function getSubmoduleExcludeGlobs( rootPath:string ) {
//     var submodules = find.fileSync( '.git', rootPath );
//     submodules = submodules.map( function( submodule )
//     {
//         return path.dirname( submodule );
//     } );
//     submodules = submodules.filter( function( submodule )
//     {
//         return submodule != rootPath;
//     } );
//     return submodules;
// }



export function isHidden( filename:string) {
	return path.basename( filename ).indexOf( '.' ) !== -1 && path.extname( filename ) === "";
}


export function expandTilde( filePath:string ) {
	if( filePath && filePath[ 0 ] === '~' ) {
		filePath = path.join( os.homedir(), filePath.slice( 1 ) );
	}

	return filePath;
}