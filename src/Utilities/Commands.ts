import * as vscode from 'vscode';
import * as path from 'path';
import { insertSnippet } from './SelectionTools';
import * as process from 'process';
import { deepCopy, isSimpleObject } from './Utils';
import { CommandId } from './StatusBar';
import * as fs from 'fs';
import { sleep } from './Async';
import { showQuickPickCommands } from './Input';
import JSONC from 'jsonc-simple-parser';


// export let $config: ExtensionConfig;

// export abstract class $state {
// 	static lastExecutedCommand: Runnable = { command: 'noop' };
// 	static context: vscode.ExtensionContext;
// 	/**
// 	 * Cache all Command Palette commands for `quickPickIncludeAllCommands` feature.
// 	 */
// 	static allCommandPaletteCommands: VSCodeCommandWithoutCategory[] = [];
// 	static commandsTreeViewProvider: CommandsTreeViewProvider;
// 	static commandsTreeView: TreeView<FolderTreeItem | RunCommandTreeItem>;
// 	static keybindings: VSCodeKeybindingItem[] = [];
// }

export const enum Constants {
	ExtensionId = 'usernamehw.commands',
	ExtensionName = 'commands',
	CommandsSettingId = 'commands.commands',
	WorkspaceCommandsSettingId = 'commands.workspaceCommands',

	CommandPaletteWasPopulatedStorageKey = 'was_populated',
}




type CmdParam = {
  command: string,
  args: any[],
}

export const staticConfig = {
	macroDefaultWaitDelay: 50,
	macros:  <Record<string, string[]>>{
		"macroA": ["Created by user in config"]
	}
};


export const enum WorkspaceConstants {
	StorageKey = 'workspaceId',
	ContextKey = 'usernamehw.commands.workspaceId',
}



/**
 * Main configuration property. Can contain folders or command objects.
 * Folders cannot contain folders.
 */
 export interface TopLevelCommands {
	[key: string]: CommandFolder & CommandObject;// TODO: ideally it would also have `| string`
}

export type Runnable = CommandObject | Sequence | string;

export interface CommandObject {
	command: string;
	args?: unknown;
	delay?: number;
	/**
	 * Run this command or sequence **repeat** number of times.
	 */
	repeat?: number;
	icon?: string;
	markdownTooltip?: string;
	disableTooltip?: boolean;
	iconColor?: string;
	statusBar?: StatusBar;
	sequence?: Sequence;
	hidden?: boolean;
	when?: string;
	workspace?: string;
}
/**
 * Add command/folder to status bar
 */
 interface StatusBar {
	alignment?: 'left' | 'right';
	text: string;
	name?: string;
	priority?: number;
	tooltip?: string;
	markdownTooltip?: string;
	hidden?: boolean;
	color?: string;
	backgroundColor?: 'error' | 'warning';
	activeEditorGlob?: string;
	activeEditorLanguage?: string;
}
export type Sequence = (CommandObject | string)[];
/**
 * Folder can only have `nestedItems` property.
 */
export interface CommandFolder {
	nestedItems?: TopLevelCommands;
	statusBar?: StatusBar;
	hidden?: boolean;
	workspace?: string;
}




interface WorkspaceCommand { workspace: string; }


export interface KeyBinding {
    key: string;
    command: string;
    when?: string;
}


















export const VARIABLE_REGEXP = /\$\{(.*?)\}/g;
export const HASVARIABLE = /\${(userHome|workspaceFolder|workspaceFolderBasename|fileWorkspaceFolder|relativeFile|fileBasename|fileBasenameNoExtension|fileExtname|fileDirname|cwd|pathSeparator|lineNumber|selectedText|env:(.*?)|config:(.*?))}/


// TODO: ${userHome}
export const enum VariableNames {
	UserHome = '${userHome}', //the path of the user's home folder
	File = '${file}', // the current opened file (absolute path?)
	FileBasename = '${fileBasename}', // the current opened file's basename
	FileBasenameNoExtension = '${fileBasenameNoExtension}', // the current opened file's basename with no file extension
	FileExtname = '${fileExtname}', // the current opened file's extension
	FileDirname = '${fileDirname}', // the current opened file's dirname
	FileWorkspaceFolder = '${fileWorkspaceFolder}', // the current opened file's workspace folder
	WorkspaceFolder = '${workspaceFolder}', // the path of the folder opened in VS Code
	WorkspaceFolderBasename = '${workspaceFolderBasename}', // the name of the folder opened in VS Code without any slashes (/)
	ExecPath = '${execPath}', //  location of Code.exe
	PathSeparator = '${pathSeparator}', // `/` on macOS or linux, `\` on Windows
	LineNumber = '${lineNumber}', // the current selected line number in the active file
	SelectedText = '${selectedText}', // the current selected text in the active file
	EnvironmentVariable = '${env}',
	SingleEnvironmentVariable = 'env',
	ConfigurationVariable = '${config}',
	SingleConfigurationVariable = 'config',
	// ────────────────────────────────────────────────────────────
	RelativeFile = '${relativeFile}', // the current opened file relative to `workspaceFolder`
	RelativeFileDirname = '${relativeFileDirname}', // the current opened file's dirname relative to `workspaceFolder`
	Cwd = '${cwd}', // the task runner's current working directory on startup
}


const variableRegexps : Record<string, RegExp> = {
	[VariableNames.UserHome]: /\${userHome}/g,
	[VariableNames.File]: /\${file}/g,
	[VariableNames.FileBasename]: /\${fileBasename}/g,
	[VariableNames.FileBasenameNoExtension]: /\${fileBasenameNoExtension}/g,
	[VariableNames.FileDirname]: /\${fileDirname}/g,
	[VariableNames.FileExtname]: /\${fileExtname}/g,
	[VariableNames.FileWorkspaceFolder]: /\${fileWorkspaceFolder}/g,
	[VariableNames.WorkspaceFolder]: /\${workspaceFolder}/g,
	[VariableNames.WorkspaceFolderBasename]: /\${workspaceFolderBasename}/g,
	[VariableNames.ExecPath]: /\${execPath}/g,
	[VariableNames.PathSeparator]: /\${pathSeparator}/g,
	[VariableNames.LineNumber]: /\${lineNumber}/g,
	[VariableNames.SelectedText]: /\${selectedText}/g,

	[VariableNames.SingleEnvironmentVariable]: /\${env:([a-zA-Z_]+[a-zA-Z0-9_]*)}/i,
	[VariableNames.EnvironmentVariable]: /\${env:([a-zA-Z_]+[a-zA-Z0-9_]*)}/ig,
	[VariableNames.SingleConfigurationVariable]: /\${config:([^}]+?)}/i,
	[VariableNames.ConfigurationVariable]: /\${config:([^}]+?)}/ig,

	[VariableNames.RelativeFile]: /\${relativeFile}/g,
	[VariableNames.RelativeFileDirname]: /\${relativeFileDirname}/g,
	[VariableNames.Cwd]: /\${cwd}/g,
};





// https://github.com/usernamehw/vscode-commands/blob/master/src/substituteVariables.ts

// https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/configurationResolver/common/variableResolver.ts

// const vscodeVariables = require('vscode-variables');
const vscodeVariables = function (string:string, recursive = false): string {
	string = string.replace(/\${userHome}/g, process.env['HOME'] || '');

    const workspaces = vscode.workspace.workspaceFolders;
    const workspace = workspaces?.length ? workspaces[0] : null;
    const activeEditor = vscode.window.activeTextEditor;
    const activeFile = activeEditor?.document;
    const absoluteFilePath = activeFile?.uri.fsPath;

    if (workspace) string = string.replace(/\${workspaceFolder}/g, workspace.uri.fsPath);
    if (workspace) string = string.replace(/\${workspaceFolderBasename}/g, workspace.name);
    if (absoluteFilePath) string = string.replace(/\${file}/g, absoluteFilePath);
	if (absoluteFilePath) {
		const parsedPath = path.parse(absoluteFilePath);
		string = string.replace(/\${fileBasename}/g, parsedPath.base);
		string = string.replace(/\${fileBasenameNoExtension}/g, parsedPath.name);
		string = string.replace(/\${fileExtname}/g, parsedPath.ext);
		string = string.replace(/\${fileDirname}/g, parsedPath.dir.slice(parsedPath.dir.lastIndexOf(path.sep) + 1));
		string = string.replace(/\${cwd}/g, parsedPath.dir);
	}

    let activeWorkspace = workspace;
    let relativeFilePath = absoluteFilePath;
	if (workspaces && absoluteFilePath) for (let workspace of workspaces) {
        if (absoluteFilePath.replace(workspace.uri.fsPath, '') !== absoluteFilePath) {
            activeWorkspace = workspace;
            relativeFilePath = absoluteFilePath.replace(workspace.uri.fsPath, '').slice(path.sep.length);
            break;
        }
    }
    if (activeWorkspace) string = string.replace(/\${fileWorkspaceFolder}/g, activeWorkspace?.uri.fsPath);
    if (relativeFilePath) string = string.replace(/\${relativeFile}/g, relativeFilePath);
    if (relativeFilePath) string = string.replace(/\${relativeFileDirname}/g, relativeFilePath.slice(0, relativeFilePath.lastIndexOf(path.sep)));

    string = string.replace(/\${pathSeparator}/g, path.sep);
    if (activeEditor) string = string.replace(/\${lineNumber}/g, `${activeEditor.selection.start.line+1}`);
    if (activeEditor) string = string.replace(/\${selectedText}/g, activeEditor.document.getText(new vscode.Range(activeEditor.selection.start, activeEditor.selection.end)));

    string = string.replace(/\${config:(.*?)}/g, (variable) => vscode.workspace.getConfiguration().get(variable.match(/\${config:(.*?)}/)?.[1] ?? '' , ''));
    string = string.replace(/\${env:(.*?)}/g, (variable) => {
		const EnvMatch = variable.match(/\${env:(.*?)}/)?.[1];
		return (EnvMatch)? process.env[EnvMatch] ?? '' : '';
	});

	return ((recursive && HASVARIABLE.test(string)) 
		? vscodeVariables(string, recursive) 
		: string
	);
}



export function replaceConfigurationVariable(configName: string): string {
	if (!configName.includes('.')) {
		vscode.window.showErrorMessage(`Need a dot (.) in the name of configuration. "${configName}"`);
		return configName;
	}
	const configParts = configName.split('.');
	const configValue = vscode.workspace.getConfiguration(configParts[0]).get(configParts.slice(1).join('.'));
	if (typeof configValue !== 'string' && typeof configValue !== 'number') {
		vscode.window.showErrorMessage(`Configuration must be of type: string or number "${configName}"`);
		return configName;
	}
	return String(configValue);
}


/**
 * Walk recursively through object/array and replace variables in strings.
 */
 export function substituteVariableRecursive(arg: unknown[] | object | string | unknown): object | string | unknown {
	if (typeof arg === 'string') return vscodeVariables(arg);

	if (Array.isArray(arg)) {
		for (const [key, value] of arg.entries()) {
			arg[key] = substituteVariableRecursive(value);
		}
	} else if (typeof arg === 'object' && arg !== null) {
		for (const key in arg) {
			// @ts-ignore
			arg[key] = substituteVariableRecursive(arg[key]);
		}
	}

	return arg;
}





/**
 * Try to emulate variable substitution in tasks https://code.visualstudio.com/docs/editor/variables-reference
 *
 * TODO: throw errors (window.showMessage) when variable exists but can't resolve
 */
 export function substituteVariables(str: string): string {
	const activeTextEditor = vscode.window.activeTextEditor;
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
	const document = activeTextEditor?.document;

	if (str.includes(VariableNames.SelectedText) && activeTextEditor) {
		const selectedText = activeTextEditor.document.getText(activeTextEditor.selection);
		str = str.replace(variableRegexps[VariableNames.SelectedText], selectedText);
	}
	if (str.includes(VariableNames.LineNumber) && activeTextEditor) {
		str = str.replace(variableRegexps[VariableNames.LineNumber], String(activeTextEditor.selection.active.line + 1));
	}
	if (str.includes(VariableNames.PathSeparator)) {
		str = str.replace(variableRegexps[VariableNames.PathSeparator], path.sep);
	}
	if (str.includes(VariableNames.ExecPath)) {
		str = str.replace(variableRegexps[VariableNames.ExecPath], vscode.env.appRoot);
	}
	if (str.includes(VariableNames.File) && document) {
		str = str.replace(variableRegexps[VariableNames.File], document.uri.fsPath);
	}
	if (str.includes(VariableNames.FileBasename) && document) {
		str = str.replace(variableRegexps[VariableNames.FileBasename], path.basename(document.uri.fsPath));
	}
	if (str.includes(VariableNames.FileBasenameNoExtension) && document) {
		str = str.replace(variableRegexps[VariableNames.FileBasenameNoExtension], path.basename(document.uri.fsPath, path.extname(document.uri.fsPath)));
	}
	if (str.includes(VariableNames.FileExtname) && document) {
		str = str.replace(variableRegexps[VariableNames.FileExtname], path.extname(document.uri.fsPath));
	}
	if (str.includes(VariableNames.FileDirname) && document) {
		str = str.replace(variableRegexps[VariableNames.FileDirname], path.dirname(document.uri.fsPath));
	}
	if (str.includes(VariableNames.WorkspaceFolder) && workspaceFolder) {
		str = str.replace(variableRegexps[VariableNames.WorkspaceFolder], workspaceFolder);
	}
	if (str.includes(VariableNames.WorkspaceFolderBasename) && workspaceFolder) {
		str = str.replace(variableRegexps[VariableNames.WorkspaceFolderBasename], path.basename(workspaceFolder));
	}
	if (str.includes(VariableNames.FileWorkspaceFolder) && document && workspaceFolder) {
		const fileWorkspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
		if (fileWorkspaceFolder) str = str.replace(variableRegexps[VariableNames.FileWorkspaceFolder], fileWorkspaceFolder);
	}
	if (variableRegexps[VariableNames.EnvironmentVariable].test(str)) {
		for (const _ of (str.match(variableRegexps[VariableNames.EnvironmentVariable]) || [])) 
			str = str.replace(variableRegexps[VariableNames.SingleEnvironmentVariable], (__, g1) => process.env[g1] || g1);
	}
	if (variableRegexps[VariableNames.ConfigurationVariable].test(str)) {
		for (const _ of (str.match(variableRegexps[VariableNames.ConfigurationVariable]) || [])) 
			str = str.replace(variableRegexps[VariableNames.SingleConfigurationVariable], (__, g1) => replaceConfigurationVariable(g1));
	}
	return str;
}
















const $state: any = null;
const $config: any = null;


/**
 * Map commands with arguments;
 */
 export const commandArgs: Record<string, unknown> = {
	type: {
		text: '',
	},
	'workbench.action.tasks.runTask': '',
	'editor.action.insertSnippet': {
		snippet: '',
	},
	'workbench.action.terminal.sendSequence': {
		text: '',
	},
	'workbench.action.quickOpen': '',
	'workbench.action.openSettings': '',
	'workbench.action.openGlobalKeybindings': '',
	'workbench.extensions.search': '',
	'vscode.openIssueReporter': '',
	'vscode.setEditorLayout': {
		 orientation: 0,
		 groups: [{
			 groups: [{}, {}],
			 size: 0.5,
		},
		{
			groups: [{}, {}],
			size: 0.5,
		}],
	},
	'workbench.action.findInFiles': {
		query: '',
		isRegex: false,
		isCaseSensitive: false,
		matchWholeWord: false,
		preserveCase: false,
		excludeSettingAndIgnoreFiles: true,
		triggerSearch: true,
		onlyOpenEditors: false,
		replace: '',
		filesToInclude: '',
		filesToExclude: '',
	},
	'search.action.openNewEditor': {
		query: '',
		isRegexp: false,
		isCaseSensitive: false,
		matchWholeWord: false,
		preserveCase: false,
		excludeSettingAndIgnoreFiles: true,
		triggerSearch: true,
		contextLines: 1,
		showIncludesExcludes: true,
		filesToInclude: '',
		filesToExclude: '',
	},
	'editor.actions.findWithArgs': {
		searchString: '',
		replaceString: '',
		isRegex: false,
		isCaseSensitive: false,
		matchWholeWord: false,
		preserveCase: false,
		findInSelection: false,
	},
	cursorMove: {
		to: 'down',
		by: 'line',
		value: 1,
		select: false,
	},
	editorScroll: {
		to: 'down',
		by: 'line',
		value: 1,
		revealCursor: false,
	},
	moveActiveEditor: {
		to: 'left',
		by: 'tab',
		value: 1,
	},
	'editor.emmet.action.wrapWithAbbreviation': {
		abbreviation: 'div',
		language: 'html',
	},
	'workbench.extensions.installExtension': '',
	'editor.action.codeAction': {
		kind: '',
		apply: 'first',
		preferred: false,
	},
	[CommandId.ToggleSetting]: {
		setting: '',
		value: [],
		target: 'global',
	},
	[CommandId.IncrementSetting]: {
		setting: '',
		value: 1,
	},
	[CommandId.ToggleTheme]: {
		dark: 'Default Dark+,Abyss',
		light: 'Default Light+,Quiet Light',
	},
	[CommandId.OpenFolder]: '',
	[CommandId.RunInTerminal]: {
		text: '',
		name: '',
		reveal: true,
		cwd: '',
	},
	[CommandId.StartDebugging]: '',
	[CommandId.OpenExternal]: '',
	[CommandId.SetEditorLanguage]: '',
	[CommandId.ClipboardWrite]: '',
	[CommandId.RevealFileInOS]: '',
	[CommandId.ShowNotification]: {
		message: '',
		severity: 'error',
	},
	[CommandId.ShowStatusBarNotification]: {
		message: '',
		color: '',
		timeout: 4000,
	},
	[CommandId.Open]: {
		target: '',
		app: '',
		arguments: [],
	},
};



/**
 * Add arguments if command can accept them (even if they are optional).
 */
export function addArgs(commandId: string): { command: string; args?: unknown } {
	if (commandId in commandArgs) {
		return {
			command: commandId,
			args: commandArgs[commandId],
		};
	}
	if (commandId in $config.alias) {
		return {
			command: commandId,
			args: commandArgs[$config.alias[commandId]],
		};
	}
	return {
		command: commandId,
	};
}
/**
 * Return `true` if command accepts arguments.
 */
export function hasArgs(commandId: string): boolean {
	return commandId in commandArgs || $config.alias[commandId] in commandArgs;
}




















export interface VSCodeKeybindingItem {
	key: string;
	command: string;
	args?: any;
	when?: string;
}

/**
 * Return all keybindings from user `keybindings.json` file.
 */
export async function getKeybindings(context: vscode.ExtensionContext): Promise<VSCodeKeybindingItem[]> {
	const UserDirPath = path.join(context.logUri.fsPath, '..', '..', '..', '..', '..', 'User');
	const keybindingsPath = path.join(UserDirPath, 'keybindings.json');
	try {
		const keybindingsContents = await fs.promises.readFile(keybindingsPath);
		return JSONC.parse(keybindingsContents.toString());
	} catch (err) {
		vscode.window.showErrorMessage((err as Error).message);
		return [];
	}
}




// https://github.com/usernamehw/vscode-commands/blob/master/src/documentLinksProvider.ts








// /**
//  * Merge global and workspace commands.
//  */
//  export function getAllCommands(): TopLevelCommands {
// 	const workspaceId = getWorkspaceId($state.context);
// 	const workspaceCommands = vscode.workspace.getConfiguration(Constants.ExtensionName).inspect('workspaceCommands')?.workspaceValue as vscode.ExtensionConfig['workspaceCommands'] | undefined;
// 	if (workspaceId && workspaceCommands) {
// 		return {
// 			...$config.commands,
// 			...addWorkspaceIdToCommands(workspaceCommands, workspaceId),
// 		};
// 	} else {
// 		return $config.commands;
// 	}
// }














//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~










//CommandPallette.ts


const commandPaletteCommandsList: vscode.Disposable[] = [];
/**
 * Command format in `package.json`.
 */
interface ICommand {
	command: string;
	title: string;
	category?: string;
	enablement: string;
}
interface ICommandPalette {
	command: string;
	when: string;
}




/**
 * Commands this extension contributes in **commands** section of `package.json`
 */
 const coreCommandIds = [
	'commands.openAsQuickPick',
	'commands.rerun',
	'commands.suggestCommands',
	'commands.newCommand',
	'commands.newFolder',
	'commands.deleteCommand',
	'commands.selectAndRun',
	'commands.newCommandInFolder',
	'commands.revealCommand',
	'commands.assignKeybinding',
	'commands.addToStatusBar',
	'commands.revealCommandsInSettignsGUI',
	'commands.escapeCommandUriArgument',
];

/**
 * VSCode doesn't support dynamic Command Palette items: https://github.com/microsoft/vscode/issues/1422
 *
 * This function updates `package.json` file to add items from `commands.commands` to Command Palette (but requires editor reload after changing configuration)
 */
 export async function updateCommandPalette(items: TopLevelCommands, context: vscode.ExtensionContext): Promise<void> {
	unregisterCommandPalette();

	if (!$config.populateCommandPalette) {
		if (context.globalState.get(Constants.CommandPaletteWasPopulatedStorageKey)) {
			// Setting was enabled then disabled. Only in this case revert/write `package.json` so it would contain only core commands again.
			const { coreCommands, packageJSONObject, packageJsonPath } = await getCommandsFromPackageJson(context);
			packageJSONObject.contributes.commands = coreCommands;
			await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJSONObject, null, '\t'));
			await context.globalState.update(Constants.CommandPaletteWasPopulatedStorageKey, false);
		}
		return;
	}

	const {
		coreCommands,
		oldCommands,
		packageJSONObject,
		packageJsonPath,
		coreCommandPalette,
		otherWorkspacesCommands,
		otherWorkspacesCommandPalette,
	} = await getCommandsFromPackageJson(context);

	const userCommands: ICommand[] = [];
	const userCommandPalette: { command: string; when: string }[] = [];
	forEachCommand((item, key) => {
		if (item.nestedItems) return;// Skip folders

		const baseWhen = item.when ?? 'true';
		const when = isWorkspaceCommandItem(item) ? `${WorkspaceConstants.ContextKey} == ${item.workspace} && ${baseWhen}` : baseWhen;
		userCommands.push({
			command: key,
			title: key,
			category: 'Commands',
			enablement: when,
		});
		userCommandPalette.push({command: key, when, });
	}, items);
	const newCommands = [...coreCommands, ...userCommands];

	if (JSON.stringify(newCommands.sort((a, b) => a.command.localeCompare(b.command))) ===
		JSON.stringify(oldCommands.sort((a, b) => a.command.localeCompare(b.command)))) {
		return;// Only write file if necessary
	}

	packageJSONObject.contributes.commands = [...coreCommands, ...otherWorkspacesCommands, ...userCommands];
	packageJSONObject.contributes.menus.commandPalette = [...coreCommandPalette, ...otherWorkspacesCommandPalette, ...userCommandPalette];
	await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJSONObject, null, '\t'));
	await context.globalState.update(Constants.CommandPaletteWasPopulatedStorageKey, true);
}

async function getCommandsFromPackageJson(context: vscode.ExtensionContext) {
	const packageJsonPath = context.asAbsolutePath('./package.json');
	const packageJsonFile = await fs.promises.readFile(packageJsonPath);
	const packageJSONObject = JSON.parse(packageJsonFile.toString());
	const oldCommands = packageJSONObject.contributes.commands as ICommand[];
	const coreCommands: ICommand[] = (packageJSONObject.contributes.commands as ICommand[]).filter(command => coreCommandIds.includes(command.command));
	const coreCommandPalette = (packageJSONObject.contributes.menus.commandPalette as ICommandPalette[]).filter(command => coreCommandIds.includes(command.command));
	const workspaceId = getWorkspaceId(context);
	const isOtherWorkspaceCommand = (c: string | undefined) => !workspaceId || c !== undefined && c.includes(WorkspaceConstants.ContextKey) && !c.includes(workspaceId);
	const otherWorkspacesCommands = packageJSONObject.contributes.commands.filter((c: ICommand) => isOtherWorkspaceCommand(c.enablement));
	const otherWorkspacesCommandPalette = packageJSONObject.contributes.menus.commandPalette.filter((c: ICommandPalette) => isOtherWorkspaceCommand(c.when));
	return {
		packageJsonPath,
		packageJSONObject,
		oldCommands,
		coreCommands,
		coreCommandPalette,
		otherWorkspacesCommands,
		otherWorkspacesCommandPalette,
	};
}

/**
 * Dispose user defined commands.
 */
export function unregisterCommandPalette() {
	for (const command of commandPaletteCommandsList) command.dispose();
	commandPaletteCommandsList.length = 0;
}






































//registerUserCommands.ts


const registeredCommandsDisposables: vscode.Disposable[] = [];

/**
 * Register commands to be able to execute it from a keybinding.
 */
 export function updateUserCommands(items: TopLevelCommands): void {
	unregisterUserCommands();

	forEachCommand((item, key) => {
		try {
			const disposable = vscode.commands.registerCommand(key, () => run(item));
			registeredCommandsDisposables.push(disposable);
		} catch (err) { vscode.window.showErrorMessage(`Failed to register command: ${(err as Error).message}`); }
	}, items);

	for (const alias in $config.alias) {
		const command = $config.alias[alias];
		try {
			const disposable = vscode.commands.registerCommand(alias, (args: unknown[]) => run({ command, args }));
			registeredCommandsDisposables.push(disposable);
		} catch (err) { vscode.window.showErrorMessage(`Failed to register alias: ${(err as Error).message}`); }
	}
}
/**
 * Dispose user defined commands.
 */
export function unregisterUserCommands() {
	for (const command of registeredCommandsDisposables) command.dispose();
	registeredCommandsDisposables.length = 0;
}





















//run.ts

/**
 * Execute runnable or folder.
 * Executing a folder - is to show Quick Pick to choose one of the commands inside that folder.
 */
 export async function run(runnable: CommandFolder & Runnable): Promise<void> {
	$state.lastExecutedCommand = runnable;
	if (typeof runnable === 'string') {
		const { command, args } = parseSimplifiedArgs(runnable);
		await runObject({
			command,
			args,
		});
		return;
	}
	if (runnable.nestedItems) {
		runFolder(runnable);
		return;
	}
	if (Array.isArray(runnable)) {
		await runArray(runnable);
		return;
	} else if (isSimpleObject(runnable)) {
		if (Array.isArray(runnable.sequence)) {
			await runArray(runnable.sequence);
		} else {
			await runObject(runnable);
		}
		return;
	}
	vscode.window.showErrorMessage(`Unknown command type ${JSON.stringify(runnable)}`);
}
async function runArray(arr: Sequence): Promise<void> {
	for (const item of arr) await runObject((typeof item === 'string')? { command: item } : item);
}
/**
 * `runObject()` must be used in all other `run...` functions because
 * it applies `commands.alias` when needed.
 */
async function runObject(object: CommandObject): Promise<void> {
	if (object.repeat !== undefined) {
		const repeat = object.repeat;
		if (typeof repeat !== 'number') {
			vscode.window.showErrorMessage('"repeat" must be number.');
			return;
		}
		if (repeat <= 0) {
			vscode.window.showErrorMessage('"repeat" must be bigger than zero.');
			return;
		}
		// property "repeat" is read-only (can't delete), need copy
		const objectWithoutRepeat = { ...object };
		delete objectWithoutRepeat?.repeat;

		for (let i = 0; i < repeat; i++) await runObject(objectWithoutRepeat);
	}

	if (object.delay) await sleep(object.delay);

	let commandId = object.command;
	if ($config.alias[commandId]) commandId = $config.alias[commandId];
	if (!commandId) vscode.window.showErrorMessage('Missing `command` property.');

	let args = object.args;
	if ($config.variableSubstitutionEnabled) {
		if (typeof args === 'string') {
			args = substituteVariables(args);
		} else if (Array.isArray(args) || (typeof args === 'object' && args !== null)) {
			args = substituteVariableRecursive({ ...args });
		}
	}

	try {
		await vscode.commands.executeCommand(commandId, args);
	} catch (err) {
		vscode.window.showErrorMessage((err as Error).message);
		throw err;
	}
}
/**
 * Run folder (show Quick pick with all commands inside that folder).
 */
function runFolder(folder: CommandFolder): void {
	showQuickPickCommands(folder.nestedItems!, true);
}
/**
 * Allow running a string with args: `commands.runInTerminal?npm run watch` (for runnables that are strings)
 */
function parseSimplifiedArgs(stringArgs: string): {	command: string; args?: unknown } {
	const firstQuestionIndex = stringArgs.indexOf('?');
	return ((firstQuestionIndex === -1)
		? { command: stringArgs }
		: {
			command: stringArgs.slice(0, firstQuestionIndex),
			args: stringArgs.slice(firstQuestionIndex + 1),
		}
	);
}

































let executeSingleton = false;


export function executeCommands(commands: Array<string | CmdParam | Function>) {
	if (executeSingleton) return;
	executeSingleton = true;

	const waitPattern = new RegExp('^wait(:([0-9]+)){0,1}$');
	const typePattern = new RegExp('^type:([\\s\\S]+)', 'gm');
	const loopFunction = async (i:int) => {
		if (i >= commands.length) {
			executeSingleton = false;
			return;
		}
		const command = commands[i];
		if (typeof command === 'function') {
			command();
			loopFunction(++i);
		} else if (typeof command === 'object') {
			await vscode.commands.executeCommand(command.command, command.args);
			loopFunction(++i);
		} else {
			const foundWait = waitPattern.exec(command);
			const foundType = typePattern.exec(command);
			if (foundWait) {
				setTimeout(() => loopFunction(++i), foundWait[2] && parseInt(foundWait[2]) || staticConfig.macroDefaultWaitDelay);
			} else if (foundType) {
				await insertSnippet(foundType[1])
				loopFunction(++i);
			} else {
				await vscode.commands.executeCommand(command);
				loopFunction(++i);
			}
		}
	}
	loopFunction(0);
}



// {
// 	"clever.macros": {
// 	  "exampleAddFragment": [ // macro name to remember in bindings
// 		"type:<>\n\n</>",     // type command with text param
// 		"cursorUp"            // 2nd command
// 	  ],
// 	  "betterAddFragment": [
// 		"type:<>\n$1\n</>"    // type also support snippet syntax
// 	  ]
// 	  // "otherMacro": [/* commands list */]
// 	  // ...
// 	}
//   }


export function fastArrowFunction() {
	insertSnippet("($1) => {\n\t$2\n}");
}

// TODO add more embed functions
export function previewCurrentFile() {
	executeCommands(["list.select", "wait", "workbench.action.focusSideBar"]);
}

export function executeMacro(macroName: string) {
	const commands = staticConfig.macros[macroName];
	if (commands) executeCommands(commands);
}


















export class Command {
    constructor(
        private readonly exe: string,
        private readonly args: object | undefined,
        private readonly repeat: number,
        private readonly onSuccess: Array<Command> | undefined,
        private readonly onFail: Array<Command> | undefined,
        private readonly variableSubstitution: boolean
    ) {}

    public async execute() {
        try {
            if (this.args) {
				const args = (this.variableSubstitution)? this.substituteVariables(this.args) : this.args;
                for(let i = 0; i < this.repeat; i++) await vscode.commands.executeCommand(this.exe, args);
            } else {
                for(let i = 0; i < this.repeat; i++) await vscode.commands.executeCommand(this.exe);
            }

            if (this.onSuccess) for (let command of this.onSuccess) await command.execute();
		} catch(e) {
            if (this.onFail) for (let command of this.onFail) await command.execute();
            else throw(e);
        }
    }

    private substituteVariables(args: any ): any {
		return (
			(typeof args === 'string')? vscodeVariables(args) :
			(typeof args === 'object')? Object.fromEntries(Object.entries(args).map(([Key, Val]) => [Key, this.substituteVariables(Val)]))
			: args
		);
    }
    
}


export class MultiCommand {
    constructor(
        readonly id: string,
        readonly label: string | undefined,
        readonly description: string | undefined,
        readonly interval: number | undefined,
        readonly sequence: Array<Command>,
        readonly languages: Array<string> | undefined
    ) {}

    public async execute() {
        for (let command of this.sequence) {
            await command.execute();
            await delay(this.interval || 0);
        }
    }
}

function delay(ms: number) {
    if (ms > 0) return new Promise((resolve) => setTimeout(resolve, ms));
	else return Promise.resolve();
}






































// export interface ExecuteControllerOptions { openFileInEditor?: boolean; }
// export interface CommandConstructorOptions { relativeToRoot?: boolean; }
export interface Command { execute(uri?: vscode.Uri): Promise<void>; }


// export interface DialogOptions {
//     prompt?: string;
//     uri?: vscode.Uri;
// }

// export interface ExecuteOptions {
//     fileItem: FileItem;
// }

// export interface GetSourcePathOptions {
//     relativeToRoot?: boolean;
//     ignoreIfNotExists?: boolean;
//     uri?: vscode.Uri;
// }

// export interface FileController {
//     showDialog(options?: DialogOptions): Promise<FileItem | FileItem[] | undefined>;
//     execute(options: ExecuteOptions): Promise<FileItem>;
//     openFileInEditor(fileItem: FileItem): Promise<vscode.TextEditor | undefined>;
//     closeCurrentFileEditor(): Promise<unknown>;
//     getSourcePath(options?: GetSourcePathOptions): Promise<string>;
// }

// export abstract class BaseCommand<T extends FileController> implements Command {
//     constructor(protected controller: T, readonly options?: CommandConstructorOptions) {}

//     public abstract execute(uri?: vscode.Uri): Promise<void>;

//     protected async executeController(
//         fileItem: FileItem | undefined,
//         options?: ExecuteControllerOptions
//     ): Promise<void> {
//         if (fileItem) {
//             const result = await this.controller.execute({ fileItem });
//             if (options?.openFileInEditor) {
//                 await this.controller.openFileInEditor(result);
//             }
//         }
//     }
// }


// export class FileItem {
//     // private SourcePath: Uri;
//     // private TargetPath: Uri | undefined;

//     // constructor(sourcePath: Uri | string, targetPath?: Uri | string, private IsDir: boolean = false) {
//     //     this.SourcePath = this.toUri(sourcePath);
//     //     if (targetPath !== undefined) {
//     //         this.TargetPath = this.toUri(targetPath);
//     //     }
//     // }

//     // get name(): string {
//     //     return path.basename(this.SourcePath.path);
//     // }

//     // get path(): Uri {
//     //     return this.SourcePath;
//     // }

//     // get targetPath(): Uri | undefined {
//     //     return this.TargetPath;
//     // }

//     // get exists(): boolean {
//     //     if (this.targetPath === undefined) {
//     //         return false;
//     //     }
//     //     return fs.existsSync(this.targetPath.fsPath);
//     // }

//     // get isDir(): boolean {
//     //     return this.IsDir;
//     // }

//     // public async move(): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     const edit = new WorkspaceEdit();
//     //     edit.renameFile(this.path, this.targetPath, { overwrite: true });
//     //     await workspace.applyEdit(edit);

//     //     this.SourcePath = this.targetPath;
//     //     return this;
//     // }

//     // public async duplicate(): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     await workspace.fs.copy(this.path, this.targetPath, { overwrite: true });

//     //     return new FileItem(this.targetPath, undefined, this.isDir);
//     // }

//     // public async remove(): Promise<FileItem> {
//     //     const edit = new WorkspaceEdit();
//     //     edit.deleteFile(this.path, { recursive: true, ignoreIfNotExists: true });
//     //     await workspace.applyEdit(edit);
//     //     return this;
//     // }

//     // public async create(mkDir?: boolean): Promise<FileItem> {
//     //     assertTargetPath(this.targetPath);

//     //     if (this.exists) {
//     //         await workspace.fs.delete(this.targetPath, { recursive: true });
//     //     }

//     //     if (mkDir === true || this.isDir) {
//     //         await workspace.fs.createDirectory(this.targetPath);
//     //     } else {
//     //         await workspace.fs.writeFile(this.targetPath, new Uint8Array());
//     //     }

//     //     return new FileItem(this.targetPath, undefined, this.isDir);
//     // }

//     // private toUri(uriOrString: Uri | string): Uri {
//     //     return uriOrString instanceof Uri ? uriOrString : Uri.file(uriOrString);
//     // }
// }






















export interface Rename {
	uri: vscode.Uri;
	range: vscode.Range;
	newName: string;
}



export async function renameManyDocuments(renames: Rename[]): Promise<void> {
	const edit = new vscode.WorkspaceEdit();
	for (const r of renames) {
		const result: vscode.WorkspaceEdit = await renameDocument(r);
		// TODO how to combine file renames?
		for (const [uri, changes] of result.entries()) {
			for (const c of changes) edit.replace(uri, c.range, c.newText);
		}
	}
	await vscode.workspace.applyEdit(edit);
}


export async function renameDocument(rename: Rename): Promise<vscode.WorkspaceEdit> {
	return (await vscode.commands.executeCommand(
		"vscode.executeDocumentRenameProvider",
		rename.uri,
		rename.range.start,
		rename.newName
	)) as any;
}


export async function rename() {
	return vscode.commands.executeCommand("editor.action.rename");
}


export async function setContext(key: string, value: string | boolean): Promise<void> {
	return (await vscode.commands.executeCommand("setContext", key, value)) as any;
}


export async function executeDocumentHighlights(
	uri: vscode.Uri,
	position: vscode.Position
): Promise<vscode.DocumentHighlight[]> {
	return (await vscode.commands.executeCommand(
		"vscode.executeDocumentHighlights",
		uri,
		position
	)) as any;
}

export async function executeCompletionItemProvider(
	uri: vscode.Uri,
	position: vscode.Position,
	triggerCharacter?: string
): Promise<vscode.CompletionList> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeCompletionItemProvider",
		uri,
		position,
		triggerCharacter
	);
	return result;
}

export async function executeDefinitionProvider(
	uri: vscode.Uri,
	position: vscode.Position
): Promise<vscode.LocationLink[]> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeDefinitionProvider",
		uri,
		position
	);
	return result;
}

export async function executeSignatureHelpProvider(
	uri: vscode.Uri,
	position: vscode.Position,
	triggerCharacter?: string
): Promise<vscode.SignatureHelp | undefined> {
	const result: any = await vscode.commands.executeCommand(
		"vscode.executeSignatureHelpProvider",
		uri,
		position,
		triggerCharacter
	);
	return result;
}

export async function executeReloadWindow() {
	return vscode.commands.executeCommand('workbench.action.reloadWindow');
}

export async function closeCurrentFileEditor(): Promise<unknown> {
	return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
}

export function openSettings(kind?: string) {
    vscode.commands.executeCommand("workbench.action.openSettings", kind ? `projectManager.${kind}` : "projectManager");
}




/**
 * Open vscode Settings GUI with input value set to the specified value.
 */
 export async function openSettingGuiAt(settingName: string): Promise<void> {
	await vscode.commands.executeCommand('workbench.action.openSettings', settingName);
}
/**
 * Open vscode Keybindings GUI with input value set to the specified value.
 */
export async function openKeybindingsGuiAt(value: string): Promise<void> {
	await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings', value);
}
/**
 * Open global or workspace settings.json file in the editor.
 */
export async function openSettingsJSON(target: 'global' | 'workspace'): Promise<void> {
	await vscode.commands.executeCommand(target === 'global' ? 'workbench.action.openSettingsJson' : 'workbench.action.openWorkspaceSettingsFile');
}


/**
 * Return all registered vscode commands (excluding internal).
 */
export async function getAllVscodeCommands(): Promise<string[]> {
	return await vscode.commands.getCommands(true);
}
/**
 * Unique id... Ehh, good enough.
 */
 export function uniqueId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Walk over all items (only 1 lvl nesting) from
 * `commands.commands` setting and execute callback for each item/command.
 */
 export function forEachCommand(
	callback: (item: TopLevelCommands['anykey'], key: string, parentElement: TopLevelCommands)=> void,
	items: TopLevelCommands,
): void {
	for (const [key, item] of Object.entries(items)) {
		callback(item, key, items);

		if (item.nestedItems) {
			for (const [nestedKey, nestedItem] of Object.entries(item.nestedItems) || []) {
				callback(nestedItem, nestedKey, item.nestedItems);
			}
		}
	}
}






export function isWorkspaceCommandItem(item: any): item is (CommandFolder & WorkspaceCommand) | (CommandObject & WorkspaceCommand) {
	return item.workspace !== undefined;
}

export function getWorkspaceId(context: vscode.ExtensionContext): string | undefined {
	return context.workspaceState.get<string>(WorkspaceConstants.StorageKey);
}


export function addWorkspaceIdToCommands(workspaceCommands: TopLevelCommands, workspaceId: string): TopLevelCommands {
	const itemsDeepCopy = deepCopy(workspaceCommands);
	forEachCommand(((item) => item.workspace = workspaceId), itemsDeepCopy);
	return itemsDeepCopy;
}

export async function setWorkspaceIdToContext(context: vscode.ExtensionContext): Promise<string> {
	let maybeWorkspaceId = getWorkspaceId(context);
	if (!maybeWorkspaceId) {
		maybeWorkspaceId = uniqueId();
		await context.workspaceState.update(WorkspaceConstants.StorageKey, maybeWorkspaceId);
	}
	const workspaceId = maybeWorkspaceId;
	await vscode.commands.executeCommand('setContext', WorkspaceConstants.ContextKey, workspaceId);
	return workspaceId;
}


// workspace.onDidChangeConfiguration(() => {
// 	runInAction("Update Configuration", () => {
// 		VsCodeSettingResource.onConfigChange.emit();
// 	});
// });



































// // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
// function escapeRegExp(string: string) {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
// }






export class Replacement {
	static readonly RegexEscape = /[.*+?^${}()|[\]\\]/g;

    static defaultFlags = 'gm';
    public find: RegExp | string;
    public replace: string;

    public constructor(find: string, replace: string, flags: string, literal = false) {
        if (flags) flags = (flags.search('g') === -1) ? flags + 'g' : flags;
        find = (literal)? find.replace(Replacement.RegexEscape, '\\$&') : find;
        this.find = new RegExp(find, flags || Replacement.defaultFlags);
        this.replace = replace || '';
    }
}



export class ReplaceRule {
	static readonly objToArray = (obj: any): Array<any> => (Array.isArray(obj)) ? obj : Array(obj);

    public steps: Replacement[];

    public constructor(rule: any) {
        let ruleSteps: Replacement[] = [];
        let find = ReplaceRule.objToArray(rule.find);
        for (let i = 0; i < find.length; i++) {
            ruleSteps.push(new Replacement(find[i], ReplaceRule.objToArray(rule.replace)[i], ReplaceRule.objToArray(rule.flags)[i], rule.literal));
        }
        this.steps = ruleSteps;
    }

    public appendRule(newRule: any) {
        let find = ReplaceRule.objToArray(newRule.find);
        for (let i = 0; i < find.length; i++) {
            this.steps.push(new Replacement(find[i], ReplaceRule.objToArray(newRule.replace)[i], ReplaceRule.objToArray(newRule.flags)[i], newRule.literal));
        }
    }
}



export default class ReplaceRulesEditProvider {
	//https://github.com/bhughes339/vscode-replacerules
    private textEditor: vscode.TextEditor;
    private configRules: any;
    private configRulesets: any;

    constructor(textEditor: vscode.TextEditor) {
        this.textEditor = textEditor;
        let config = vscode.workspace.getConfiguration("replacerules");
        this.configRules = config.get<any>("rules");
        this.configRulesets = config.get<any>("rulesets");
    }

    public pickRuleAndRun() { vscode.window.showQuickPick(this.getQPRules()).then(qpItem => (qpItem)&& this.runSingleRule(qpItem.key)); }
    public pickRulesetAndRun() { vscode.window.showQuickPick(this.getQPRulesets()).then(qpItem => (qpItem)&& this.runRuleset(qpItem.key)); }
    public pickRuleAndPaste() { vscode.window.showQuickPick(this.getQPRules()).then(qpItem => (qpItem)&& this.pasteReplace(qpItem.key)); }
    public pickRulesetAndPaste() { vscode.window.showQuickPick(this.getQPRulesets()).then(qpItem => (qpItem)&& this.pasteReplaceRuleset(qpItem.key)); }

    private getQPRules(): any[] {
        let language = this.textEditor.document.languageId;
        let configRules = this.configRules;
        let items = [];
        for (const r in configRules) {
            let rule = configRules[r];
            if (Array.isArray(rule.languages) && rule.languages.indexOf(language) === -1) continue;
            if (rule.find) {
                try {
                    items.push({
                        label: "Replace Rule: " + r,
                        description: "",
                        key: r
                    });
                } catch (err: any) { ReplaceRulesEditProvider.FormatError('parsing rule', r, err); }
            }
        }
        return items;
    }

    private getQPRulesets(): any[] {
        let configRulesets = this.configRulesets;
        let items = [];
        for (const r in configRulesets) {
            let ruleset = configRulesets[r];
            if (Array.isArray(ruleset.rules)) {
                try {
                    items.push({
                        label: "Ruleset: " + r,
                        description: "",
                        key: r
                    });
                } catch (err: any) { ReplaceRulesEditProvider.FormatError('parsing ruleset', r, err); }
            }
        }
        return items;
    }

    public runSingleRule(ruleName: string) {
        let rule = this.configRules[ruleName];
        if (rule) {
            let language = this.textEditor.document.languageId;
            if (Array.isArray(rule.languages) && rule.languages.indexOf(language) === -1) {
                return;
            }
            try {
                this.doReplace(new ReplaceRule(rule));
            } catch (err: any) { ReplaceRulesEditProvider.FormatError('executing rule', ruleName, err); }
        }
    }

    public runRuleset(rulesetName: string) {
        let language = this.textEditor.document.languageId;
        let ruleset = this.configRulesets[rulesetName];
        if (ruleset) {
            let ruleObject = new ReplaceRule({ find: '' });
            try {
                ruleset.rules.forEach((r: string) => {
                    let rule = this.configRules[r];
                    if (rule) {
                        if (Array.isArray(rule.languages) && rule.languages.indexOf(language) === -1) {
                            return;
                        }
                        ruleObject.appendRule(this.configRules[r])
                    }
                });
                if (ruleObject) this.doReplace(ruleObject);
            } catch (err: any) { ReplaceRulesEditProvider.FormatError('executing ruleset', rulesetName, err); }
        }
    }

    public pasteReplace(ruleName: string) {
        let rule = this.configRules[ruleName];
        if (rule) {
            let language = this.textEditor.document.languageId;
            if (Array.isArray(rule.languages) && rule.languages.indexOf(language) === -1) {
                return;
            }
            try {
                this.doPasteReplace(new ReplaceRule(rule));
            } catch (err: any) { ReplaceRulesEditProvider.FormatError('executing rule', ruleName, err); }
        }
    }

    private async doReplace(rule: ReplaceRule) {
        let e = this.textEditor;
        let d = e.document;
        let editOptions = { undoStopBefore: false, undoStopAfter: false };
        let numSelections = e.selections.length;
        for (const x of Array(numSelections).keys()) {
            let sel = e.selections[x];
            let index = (numSelections === 1 && sel.isEmpty) ? -1 : x;
            let range = ReplaceRulesEditProvider.rangeUpdate(e, d, index);
            for (const r of rule.steps) {
                let findText = ReplaceRulesEditProvider.stripCR(d.getText(range));
                await e.edit((edit) => edit.replace(range, findText.replace(r.find, r.replace)), editOptions);
                range = ReplaceRulesEditProvider.rangeUpdate(e, d, index);
            }
        }
        return;
    }

    private async doPasteReplace(rule: ReplaceRule) {
        let e = this.textEditor;
        let editOptions = { undoStopBefore: false, undoStopAfter: false };
        let clip = ReplaceRulesEditProvider.stripCR(await vscode.env.clipboard.readText());
        for (const r of rule.steps) clip = clip.replace(r.find, r.replace);
        await e.edit((edit) => e.selections.forEach(X => edit.replace(new vscode.Range(X.start, X.end), clip)), editOptions);
        return;
    }

    public pasteReplaceRuleset(rulesetName: string) {
        let language = this.textEditor.document.languageId;
        let ruleset = this.configRulesets[rulesetName];
        if (ruleset) {
            let ruleObject = new ReplaceRule({ find: '' });
            try {
                ruleset.rules.forEach((r: string) => {
                    let rule = this.configRules[r];
                    if (rule) {
                        if (Array.isArray(rule.languages) && rule.languages.indexOf(language) === -1) return;
                        ruleObject.appendRule(this.configRules[r])
                    }
                });
                if (ruleObject) this.doPasteReplace(ruleObject);
            } catch (err: any) { ReplaceRulesEditProvider.FormatError('executing ruleset', rulesetName, err); }
        }
    }



	static readonly FormatError = ((CurrentAction: string, RulesetName: string, Error: Exception) => 
		vscode.window.showErrorMessage(`Error ${CurrentAction} ${RulesetName}: ${Error.message}`)
	);

	static readonly stripCR = (str: string) => str.replace(new RegExp(/\r\n/, 'g'), '\n');
		
	static readonly rangeUpdate = (e: vscode.TextEditor, d: vscode.TextDocument, index: number) => {
		if (index === -1) return new vscode.Range(d.positionAt(0), d.lineAt(d.lineCount - 1).range.end)
		else return e.selections[index].ToRange();
	}
}








