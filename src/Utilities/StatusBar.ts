import { languages, MarkdownString, StatusBarAlignment, StatusBarItem, TextEditor, ThemeColor, Uri, window } from 'vscode';
import { forEachCommand } from './Commands';

// import { CommandId } from './utils';
// import { createFolderHoverText } from './folderHoverText';
import { TopLevelCommands } from './Commands';



const statusBarItems: StatusBarWithActiveEditorMetadata[] = [];

type StatusBarWithActiveEditorMetadata = StatusBarItem & {
	activeEditorGlob?: string;
	activeEditorLanguage?: string;
};

/**
 * Dispose and refresh all status bar items.
 */
export function updateStatusBarItems(items: TopLevelCommands): void {
	disposeStatusBarItems();

	forEachCommand((item, key) => {
		if (item.statusBar && !item.statusBar.hidden) {
			const statusBarUserObject = item.statusBar;
			const alignment = statusBarUserObject.alignment === 'right' ? StatusBarAlignment.Right : StatusBarAlignment.Left;
			const newStatusBarItem: StatusBarWithActiveEditorMetadata = window.createStatusBarItem(statusBarUserObject.text, alignment, statusBarUserObject.priority ?? -9999);
			let icon = item.icon ? `$(${item.icon}) ` : '';
			newStatusBarItem.name = `Commands: ${statusBarUserObject.name || statusBarUserObject.text}`;
			newStatusBarItem.color = statusBarUserObject.color;
			newStatusBarItem.backgroundColor = statusBarUserObject.backgroundColor === 'error' ? new ThemeColor('statusBarItem.errorBackground') :
				statusBarUserObject.backgroundColor === 'warning' ? new ThemeColor('statusBarItem.warningBackground') : undefined;

			let mdTooltip = new MarkdownString(undefined, true);
			mdTooltip.isTrusted = true;
			if (statusBarUserObject.markdownTooltip) {
				mdTooltip.appendMarkdown(statusBarUserObject.markdownTooltip);
			} else {
				mdTooltip.appendText(statusBarUserObject.tooltip || key);
			}
			if (item.nestedItems) {
				icon = '$(folder) ';
				// mdTooltip = createFolderHoverText(item.nestedItems);
			}
			const args = [{
				workspaceId: item.workspace,
				label: key,
			}];
			const revealCommandUri = Uri.parse(
				`command:${CommandId.RevealCommand2}?${encodeURIComponent(JSON.stringify(args))}`,
			);
			mdTooltip.appendMarkdown(`\n\n---\n\n[Reveal in settings.json](${revealCommandUri})`);
			newStatusBarItem.tooltip = mdTooltip;

			newStatusBarItem.text = icon + (statusBarUserObject.text || '');
			newStatusBarItem.command = {
				command: CommandId.Run,
				title: 'Run Command',
				arguments: [item],
			};

			newStatusBarItem.activeEditorGlob = item.statusBar.activeEditorGlob;
			newStatusBarItem.activeEditorLanguage = item.statusBar.activeEditorLanguage;

			newStatusBarItem.show();
			statusBarItems.push(newStatusBarItem);
		}
	}, items);

	updateStatusBarItemsVisibilityBasedOnActiveEditor(window.activeTextEditor);
}

/**
 * Control whether or not status bar item should be shown
 * based on active text editor.
 */
export function updateStatusBarItemsVisibilityBasedOnActiveEditor(editor?: TextEditor) {
	// No active text editor (no editor opened).
	if (!editor) {
		for (const statusBarItem of statusBarItems) {
			if (!statusBarItem.activeEditorLanguage && !statusBarItem.activeEditorGlob) {
				statusBarItem.show();
			} else {
				statusBarItem.hide();
			}
		}
		return;
	}

	// Active text editor exists.
	for (const statusBarItem of statusBarItems) {
		if (!statusBarItem.activeEditorGlob && !statusBarItem.activeEditorLanguage) {
			statusBarItem.show();
			continue;
		}
		if (statusBarItem.activeEditorLanguage) {
			if (editor.document.languageId === statusBarItem.activeEditorLanguage) {
				statusBarItem.show();
			} else {
				statusBarItem.hide();
			}
		}
		if (statusBarItem.activeEditorGlob) {
			if (languages.match({
				pattern: statusBarItem.activeEditorGlob || '',
			}, editor.document) !== 0) {
				statusBarItem.show();
			} else {
				statusBarItem.hide();
			}
		}
	}
}
/**
 * Dispose all status bar items.
 */
function disposeStatusBarItems() {
	for (const statusBarItem of statusBarItems) {
		statusBarItem.dispose();
	}
	statusBarItems.length = 0;
}








/**
 * All command ids contributed by this extension.
 */
 export const enum CommandId {
	// ──── Core ──────────────────────────────────────────────────
	Run = 'commands.run',
	Rerun = 'commands.rerun',
	SelectAndRun = 'commands.selectAndRun',
	NewCommand = 'commands.newCommand',
	NewFolder = 'commands.newFolder',
	DeleteCommand = 'commands.deleteCommand',
	SuggestCommands = 'commands.suggestCommands',
	SuggestVariables = 'commands.suggestVariables',
	RevealCommand = 'commands.revealCommand',
	RevealCommand2 = 'commands.revealCommand2',
	OpenAsQuickPick = 'commands.openAsQuickPick',
	AssignKeybinding = 'commands.assignKeybinding',
	ToggleStatusBar = 'commands.addToStatusBar',
	NewCommandInFolder = 'commands.newCommandInFolder',
	RevealCommandsInSettignsGUI = 'commands.revealCommandsInSettignsGUI',
	EscapeCommandUriArgument = 'commands.escapeCommandUriArgument',
	// ──── Additional ────────────────────────────────────────────
	ToggleSetting = 'commands.toggleSetting',
	IncrementSetting = 'commands.incrementSetting',
	ClipboardWrite = 'commands.clipboardWrite',
	SetEditorLanguage = 'commands.setEditorLanguage',
	OpenFolder = 'commands.openFolder',
	ShowNotification = 'commands.showNotification',
	ShowStatusBarNotification = 'commands.showStatusBarNotification',
	RunInTerminal = 'commands.runInTerminal',
	StartDebugging = 'commands.startDebugging',
	ToggleTheme = 'commands.toggleTheme',
	OpenExternal = 'commands.openExternal',
	RevealFileInOS = 'commands.revealFileInOS',
	Open = 'commands.open',
}


// export function applyForTreeItem(
// 	action: (o: { treeItem: FolderTreeItem | RunCommandTreeItem; commands: TopLevelCommands; settingId: string; configTarget: 'global' | 'workspace' })=> any,
// 	treeItem: FolderTreeItem | RunCommandTreeItem) {
// 	const isWorkspaceTreeItem = (treeItem: FolderTreeItem | RunCommandTreeItem) => treeItem instanceof RunCommandTreeItem && isWorkspaceCommandItem(treeItem.runnable) ||
// 			treeItem instanceof FolderTreeItem && isWorkspaceCommandItem(treeItem.folder);
// 	if (isWorkspaceTreeItem(treeItem)) {
// 		return action({ treeItem, commands: $config.workspaceCommands, settingId: Constants.WorkspaceCommandsSettingId, configTarget: 'workspace' });
// 	} else {
// 		return action({ treeItem, commands: $config.commands, settingId: Constants.CommandsSettingId, configTarget: 'global' });
// 	}
// }


// /**
//  * Register all commands (core + additional)
//  * Core command is needed for this extension to operate
//  * Additional commands are just useful commands that accept arguments.
//  */
//  export function registerExtensionCommands() {
// 	// ──── Core Commands ─────────────────────────────────────────
// 	commands.registerCommand(CommandId.Run, runCommand);
// 	commands.registerCommand(CommandId.Rerun, rerunCommand);
// 	commands.registerCommand(CommandId.SelectAndRun, selectAndRunCommand);
// 	commands.registerCommand(CommandId.RevealCommand, revealCommandCommand);
// 	commands.registerCommand(CommandId.RevealCommand2, revealCommand2Command);
// 	commands.registerCommand(CommandId.AssignKeybinding, assignKeybindingCommand);
// 	commands.registerCommand(CommandId.ToggleStatusBar, toggleStatusBarCommand);
// 	commands.registerCommand(CommandId.RevealCommandsInSettignsGUI, revealCommandsInSettingsGUICommand);
// 	commands.registerCommand(CommandId.OpenAsQuickPick, openAsQuickPickCommand);
// 	commands.registerCommand(CommandId.NewCommand, newCommandCommand);
// 	commands.registerCommand(CommandId.NewCommandInFolder, newCommandInFolderCommand);
// 	commands.registerCommand(CommandId.NewFolder, newFolderCommand);
// 	commands.registerCommand(CommandId.DeleteCommand, deleteCommandCommand);
// 	commands.registerTextEditorCommand(CommandId.SuggestCommands, suggestCommandsCommand);
// 	commands.registerTextEditorCommand(CommandId.SuggestVariables, suggestVariableCommand);
// 	commands.registerTextEditorCommand(CommandId.EscapeCommandUriArgument, escapeCommandUriArgumentCommand);
// 	// ──── Additional Commands ───────────────────────────────────
// 	commands.registerCommand(CommandId.ToggleSetting, toggleSettingCommand);
// 	commands.registerCommand(CommandId.IncrementSetting, incrementSettingCommand);
// 	commands.registerCommand(CommandId.ClipboardWrite, clipboardWriteCommand);
// 	commands.registerCommand(CommandId.SetEditorLanguage, setEditorLanguageCommand);
// 	commands.registerCommand(CommandId.OpenFolder, openFolderCommand);
// 	commands.registerCommand(CommandId.ShowNotification, showNotificationCommand);
// 	commands.registerCommand(CommandId.ShowStatusBarNotification, showStatusBarNotificationCommand);
// 	commands.registerCommand(CommandId.RunInTerminal, runInTerminalCommand);
// 	commands.registerCommand(CommandId.StartDebugging, startDebuggingCommand);
// 	commands.registerCommand(CommandId.ToggleTheme, toggleThemeCommand);
// 	commands.registerCommand(CommandId.OpenExternal, openExternalCommand);
// 	commands.registerCommand(CommandId.RevealFileInOS, revealFileInOSCommand);
// 	commands.registerCommand(CommandId.Open, openCommand);
// }

















// port from https://changaco.oy.lc/unicode-progress-bars/

const bar_styles = [
	'▁▂▃▄▅▆▇█',
	'⣀⣄⣤⣦⣶⣷⣿',
	'⣀⣄⣆⣇⣧⣷⣿',
	'○◔◐◕⬤',
	'□◱◧▣■',
	'□◱▨▩■',
	'□◱▥▦■',
	'░▒▓█',
	'░█',
	'⬜⬛',
	'⬛⬜',
	'▱▰',
	'▭◼',
	'▯▮',
	'◯⬤',
	'⚪⚫',
  ]
  
  export function unicodeProgressBar(p: number, style = 7, min_size = 8, max_size = 8) {
	let d; let full; let m; let middle; let r; let rest; let x

	const bar_style = bar_styles[style]
	const n = bar_style.length - 1
	const full_symbol = bar_style[n]
	if (p === 100)  return full_symbol.repeat(max_size)
	let min_delta = Number.POSITIVE_INFINITY
	
	p /= 100
	for (let i = max_size; i >= min_size; i--) {
	  x = p * i
	  full = Math.floor(x)
	  rest = x - full
	  middle = Math.floor(rest * n)
	  if (p !== 0 && full === 0 && middle === 0) middle = 1
	  d = Math.abs(p - (full + middle / n) / i) * 100
	  if (d < min_delta) {
		min_delta = d
		m = bar_style[middle]
		if (full === i) m = ''
		r = full_symbol.repeat(full) + m + bar_style[0].repeat(i - full - 1)
	  }
	}
	return r
  }