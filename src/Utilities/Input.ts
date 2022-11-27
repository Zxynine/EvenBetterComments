import * as vscode from 'vscode';
import * as path from 'path';
import { HistoryNavigator } from './Navigator';
import { goToSymbol } from './Utils';
import { isWorkspaceCommandItem, openSettingsJSON, Runnable, TopLevelCommands } from './Commands';
import * as fs from 'fs';
import { CommandId } from './StatusBar';
// import { Color } from 'vscode';








export interface TokenArgs {
    text?: string
}

export async function getInput(args: TokenArgs | undefined, message: string, validate: (str: string) => string | undefined){
    if (!args || !args.text) return vscode.window.showInputBox(<vscode.InputBoxOptions>{ prompt: message, validateInput: validate});
    else return Promise.resolve(args.text);
}

export async function showInputBox(placeHolder: string): Promise<string> {
	const input = await vscode.window.showInputBox(<vscode.InputBoxOptions>{ placeHolder: placeHolder });
	if (input === undefined) throw new Error("No input given");
	return input;
}


export async function showQuickPick(items: string[], placeHolder: string): Promise<string> {
	const item = await vscode.window.showQuickPick(items, <vscode.QuickPickOptions>{placeHolder: placeHolder});
	if (item === undefined) throw new Error("No item selected");
	return item;
}


export async function quickPickFromMap<T>(map: Map<string, T>, placeHolder: string, sort = true): Promise<T | undefined> {
	const keys: Array<string> = Array.from(map.keys());

	return vscode.window.showQuickPick(((sort)? keys.sort() : keys), <vscode.QuickPickOptions>{ placeHolder: placeHolder })
		.then((choice: string | undefined) => {
			if (choice === undefined) throw Error("No choice made."); // Ignore undefined
			return map.get(choice);
		}
	);
}




/**
 * Transforms the the selections of an editor into quick pick items.
 *
 * @param editor the text editor to get the selections from.
 */
export function selectionsToQuickPickItems(editor: vscode.TextEditor): vscode.QuickPickItem[] {
	return editor.selections.map((sel, i) => (<vscode.QuickPickItem>{
		label: i.toString()+': ',
		alwaysShow: true,
		description: editor.document.getText(sel).replace(/(\r?\n)+/g, " "),
	}));
}
  

/**
 * Prompts for text and returns it, while also managing history.
 *
 * @param title the title of the quick pick box.
 * @param prompt the placeholder text for the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
async function promptText(title: string, prompt: string, context: vscode.ExtensionContext, historyKey: string) {
	const box = vscode.window.createQuickPick();
	const history = context.globalState.get<string[]>(historyKey) ?? [];
	box.title = title;
	box.placeholder = prompt;
	box.items = history.map((label) => ({ label }));

	try {
		const text = await new Promise<string>((resolve, reject) => {
			box.onDidAccept(() =>
				box.value.length
					? resolve(box.value)
					: box.selectedItems.length
						? resolve(box.selectedItems[0].label)
						: reject()
			);
			box.onDidHide(reject);
			box.show();
		});
		context.globalState.update(historyKey, [text, ...history.filter((str) => str !== text)]);
		return text;
	} finally { box.dispose(); }
}


/**
 * Prompts for a regular expression and returns it.
 *
 * @param title the title of the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
export async function promptRegexp(title: string, context: vscode.ExtensionContext, historyKey: string) {
	return new RegExp(await promptText(title, "Enter a regular expression", context, historyKey), "g");
}




/**
 * Prompts for a JS expression and returns a function which evaluates it.
 *
 * @param title the title of the quick pick box.
 * @param context the context which contains the history.
 * @param historyKey the key of the history within the context.
 */
export async function promptJS(title: string, context: vscode.ExtensionContext, historyKey: string): Promise<Func<[v:string, i:string, a:string], any>> {
	const expr = await promptText(title, "Enter a JS string (${v}: text, ${i}: index, ${a}: all texts)", context, historyKey);
	return new Function("v", "i", "a", `return \`${expr}\``) as any;
  }



  export async function showInputBox2(): Promise<void> {
	const result = await vscode.window.showInputBox({
		value: 'abcdef',
		valueSelection: [2, 4],
		placeHolder: 'For example: abcdef. But not: 123',
		ignoreFocusOut: true,
		validateInput: text => {
			vscode.window.showInformationMessage(`Validating: ${text}`);
			return text === '123' ? 'Not 123!' : null;
		}
	});
	vscode.window.showInformationMessage(`Got: ${result}`);

	const result2 = await vscode.window.showInputBox({
		value: 'xyz',
		placeHolder: 'Type another, for example: xyz.',
	});
	vscode.window.showInformationMessage(`Got: ${result2}`);

	const result3 = await vscode.window.showInputBox({
		value: 'xyz',
		placeHolder: 'Type another, for example: xyz.',
		validateInput: text => null
	});
	vscode.window.showInformationMessage(`Got: ${result3}`);
}

// /**
//  * Prompts for ranges of selections within an editor.
//  *
//  * @param title the title of the quick pick box.
//  * @param editor the editor which contains the selections.
//  */
//  async function promptRanges(title: string, editor: vscode.TextEditor) {
// 	const box = vscode.window.createQuickPick();
// 	box.title = title;
// 	box.placeholder = "Enter comma-separated ranges (example: 0-2,5-6)";
// 	box.canSelectMany = true;
// 	box.items = selectionsToQuickPickItems(editor);
// 	box.onDidChangeValue((value) => {
// 	  const ranges = parseRanges(value);
// 	  box.selectedItems = box.items.filter((_, i) =>
// 		ranges.some(([min, max]) => i >= min && i <= max)
// 	  );
// 	});
// 	try {
// 	  return parseRanges(
// 		await new Promise<string>((resolve, reject) => {
// 		  box.onDidAccept(() =>
// 			box.value.length ? resolve(box.value) : reject()
// 		  );
// 		  box.onDidHide(reject);
// 		  box.show();
// 		})
// 	  );
// 	} finally {
// 	  box.dispose();
// 	}
//   }








// /**
//  * Prompts for indices, and ranges of indices, of selections within an editor.
//  *
//  * @param title the title of the quick pick box.
//  * @param editor the editor which contains the selections.
//  */
//  async function promptIndices(title: string, editor: TextEditor) {
// 	const box = window.createQuickPick();
// 	box.title = title;
// 	box.placeholder =
// 	  "Enter comma-separated indices or ranges (example: 0,1,2-3,4)";
// 	box.canSelectMany = true;
// 	box.items = selectionsToQuickPickItems(editor);
// 	box.onDidChangeValue((value) => {
// 	  const indices = parseIndices(value);
// 	  box.selectedItems = box.items.filter((_, i) => indices.has(i));
// 	});
// 	try {
// 	  return parseIndices(
// 		await new Promise<string>((resolve, reject) => {
// 		  box.onDidAccept(() =>
// 			box.value.length ? resolve(box.value) : reject()
// 		  );
// 		  box.onDidHide(reject);
// 		  box.show();
// 		})
// 	  );
// 	} finally {
// 	  box.dispose();
// 	}
//   }












export interface IProgressStatus {
	steps: number;
	stepsMax: number;
	readonly increment: number;
	readonly progress: number;
  }
  
  
  export class ProgressStatus implements IProgressStatus {
	private stepsIntern: number;
	private stepsMaxIntern: number;
	private incrementIntern: number = 0;
	constructor(steps: number, stepsMax: number) {
	  this.stepsIntern = steps;
	  this.stepsMaxIntern = stepsMax;
	  this.updateIncrement(steps, this.stepsMax);
	}
	public get steps(): number { return this.stepsIntern; }
	public set steps(val: number) {
	  this.updateIncrement(val, this.stepsMax);
	  this.stepsIntern = val;
	}

	public get stepsMax(): number { return this.stepsMaxIntern; }
	public set stepsMax(val: number) {
	  this.updateIncrement(this.steps, val);
	  this.stepsMaxIntern = val;
	}

	public get increment(): number { return this.incrementIntern; }
	public get progress(): number { return this.steps / this.stepsMax; }

	private updateIncrement(steps: number, max: number) {
	  let progressNew = steps / max;
	  let progressOld = this.steps / this.stepsMax;
	  this.incrementIntern = progressNew - progressOld;
	}
  }

  
export type visualizerType = 'dialogBox' | 'statusBar';

interface IProgressVisualizer {
  progress(status: IProgressStatus): void;
  close(): void;
}

// Progress class
export class Progress {
	// Registered visualizers
	private static progressVisualizers = new Map<string, IProgressVisualizer>();
	public static autoCloseTimeout = 2000;

	public static showDialogBox<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void
	) {
	  ProgressDialogBox.show<T>(id, title, progressFormatter, cancellationHandler);
	}
  
	public static showStatusBar<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void,
	  icon?: Icon
	) {
	  ProgressStatusBarItem.show(id, title, progressFormatter, cancellationHandler, icon);
	}
  
	public static progress(id: string, status: IProgressStatus) {
	  this.progressVisualizers.get(id)?.progress(status);
	}
  
	public static close(id: string) {
	  const handler = this.progressVisualizers.get(id);
	  if (handler) {
		handler.close();
		this.remove(id);
	  }
	}
  
	private static remove(id: string) {
	  this.progressVisualizers.delete(id);
	}
  
	public static addVisualizer(id: string, visualizer: IProgressVisualizer) {
	  this.progressVisualizers.set(id, visualizer);
	}
  
  }








  
// DialogBox Variant
class ProgressDialogBox<T extends IProgressStatus> implements IProgressVisualizer {
	private lastProgress = 0;
	constructor(
	  private readonly progressHandler: (increment: number, message: string) => void,
	  private readonly progressFormatter: (status: T) => string,
	  private readonly closeHandler: () => void
	) {}
  
	public progress(status: T) {
	  let increment = status.progress > this.lastProgress ? status.increment : 0;
	  this.lastProgress = status.progress;
	  let message = this.progressFormatter(status);
	  this.progressHandler(100 * increment, message);
	}
  
	public close() { this.closeHandler(); }
  
	public static show<T extends IProgressStatus>(
	  id: string,
	  title: string,
	  progressFormatter: (status: T) => string,
	  cancellationHandler?: () => void
	) {
	  vscode.window.withProgress(
		{
		  location: vscode.ProgressLocation.Notification,
		  title: title,
		  cancellable: cancellationHandler != undefined
		},
		(progress, token) => {
		  return new Promise<void>((resolve) => {
			// Final no response timeout:
			const createTimeout = (time: number) => setTimeout(resolve, time);
			let timeout = createTimeout(30000);
			token.onCancellationRequested(() => {
				clearTimeout(timeout);
				cancellationHandler?.();
				resolve();
			});
			
			const progressHandler = (increment: number, message: string) => {
				clearTimeout(timeout);
				timeout = createTimeout(30000);
				progress.report({ increment: increment, message: message });
			};
			const closeHandler = () => {
				clearTimeout(timeout);
				timeout = createTimeout(Progress.autoCloseTimeout);
			};
			Progress.addVisualizer(id, new ProgressDialogBox(progressHandler, progressFormatter, closeHandler));
		  });
		}
	  );
	}
  }
  
  // ProgressBar Variant
class ProgressStatusBarItem<T extends IProgressStatus> implements IProgressVisualizer {
	private statusBarItem: vscode.StatusBarItem;
  
	constructor(
	  private readonly title: string,
	  private readonly progressFormatter: (status: T) => string,
	  private readonly closeHandler?: () => void,
	  private readonly maxSize?: number,
	  private readonly icon?: Icon
	) {
	  this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	}
  
	public progress(status: T) {
	  this.statusBarItem.text = `${this.getIconPlaceholder()} ${this.title} (${status.steps}/${status.stepsMax}) ${this.getAsciiProgress(status)}`.trimStart();
	  this.statusBarItem.tooltip = this.progressFormatter(status);
	  this.statusBarItem.show();
	}
  
	public close() {
		this.closeHandler?.();
		setTimeout(this.statusBarItem.hide, Progress.autoCloseTimeout);
	}

	private getAsciiProgress(status: T) {
		const barCount = Math.min(status.stepsMax, this.maxSize || 15);
		const preCount = Math.floor(status.progress * barCount);
		const remCount = Math.floor((1 - status.progress) * barCount);
		const midCount = barCount - preCount - remCount;
		const pre = '█'.repeat(preCount);
		const mid = '▓'.repeat(midCount);
		const rem = '▒'.repeat(remCount);
		return `${pre}${mid}${rem}`;
	}

	private getIconPlaceholder() {
		return this.icon ? this.icon.toPlaceholder() : '';
	}
  
	public static show<T extends IProgressStatus>(
		id: string,
		title: string,
		progressFormatter: (status: T) => string,
		cancellationHandler?: () => void,
		icon?: Icon
	) {
	  Progress.addVisualizer(id, new ProgressStatusBarItem<T>(title, progressFormatter, cancellationHandler, undefined, icon));
	}
  }
























/**
 * A file opener using window.createQuickPick().
 * 
 * It shows how the list of items can be dynamically updated based on
 * the user's input in the filter field.
 */
 export async function quickOpen() {
	const uri = await pickFile();
	if (uri) {
		const document = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(document);
	}
}






class FileItem implements vscode.QuickPickItem {

	label: string;
	description: string;

	constructor(public base: vscode.Uri, public uri: vscode.Uri) {
		this.label = path.basename(uri.fsPath);
		this.description = path.dirname(path.relative(base.fsPath, uri.fsPath));
	}
}

class MessageItem implements vscode.QuickPickItem {

	label: string;
	description = '';
	detail: string;

	constructor(public base: vscode.Uri, public message: string) {
		this.label = message.replace(/\r?\n/g, ' ');
		this.detail = base.fsPath;
	}
}

  
async function pickFile() {
	const cp = await import('child_process');
	const disposables: vscode.Disposable[] = [];
	try {
		return await new Promise<vscode.Uri | undefined>((resolve, reject) => {
			const input = vscode.window.createQuickPick<FileItem | MessageItem>();
			input.placeholder = 'Type to search for files';
			let rgs: import('child_process').ChildProcess[] = [];
			disposables.push(
				input.onDidChangeValue(value => {
					rgs.forEach(rg => rg.kill());
					if (!value) {
						input.items = [];
						return;
					}
					input.busy = true;
					const cwds = vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) ?? [process.cwd()];
					const q = process.platform === 'win32' ? '"' : '\'';
					rgs = cwds.map(cwd => {
						const rg = cp.exec(`rg --files -g ${q}*${value}*${q}`, { cwd }, (err, stdout) => {
							const i = rgs.indexOf(rg);
							if (i !== -1) {
								if (rgs.length === cwds.length) input.items = [];
								if (!err) input.items = input.items.concat(stdout
									.split('\n').slice(0, 50)
									.map(relative => new FileItem(vscode.Uri.file(cwd), vscode.Uri.file(path.join(cwd, relative))))
								);
								if (err && !(<any>err).killed && (<any>err).code !== 1 && err.message) {
									input.items = input.items.concat([new MessageItem(vscode.Uri.file(cwd), err.message)]);
								}
								rgs.splice(i, 1);
								if (!rgs.length) input.busy = false;
							}
						});
						return rg;
					});
				}),



				input.onDidChangeSelection(items => {
					const item = items[0];
					if (item instanceof FileItem) {
						resolve(item.uri);
						input.hide();
					}
				}),



				input.onDidHide(() => {
					rgs.forEach(rg => rg.kill());
					resolve(undefined);
					input.dispose();
				})
			);
			input.show();
		});
	} finally {
		disposables.forEach(d => d.dispose());
	}
}

























export async function SearchBoxInput(message:string, placeHolder:string = 'Type to search') {
	const InputBox = vscode.window.createInputBox();
	InputBox.title = "Search"
	InputBox.prompt = message;
	InputBox.placeholder = placeHolder;
	InputBox.ignoreFocusOut = true;
	InputBox.buttons = [
		vscode.QuickInputButtons.Back,
		<vscode.QuickInputButton>{
			iconPath: new vscode.ThemeIcon(Icons.IconSearch)
		}
	];
	const disposables: vscode.Disposable[] = [];
	try { return await new Promise<string | undefined>((resolve) => {
		disposables.push(
			InputBox.onDidTriggerButton((button) => {
				
			}),
			InputBox.onDidAccept(() => {
				resolve(undefined);
				InputBox.dispose();

			}),
			InputBox.onDidChangeValue((value) => {

			}),
			InputBox.onDidHide(() => {
				resolve(undefined);
				InputBox.dispose();
			}),
		);
		
	
	
	
	
	});
	} finally { disposables.forEach(d => d.dispose()); }
}







// function showQuickPickDefault(title:string, value:string, ...items:string[]) : Promise<string|undefined> {
// 	return new Promise<string|undefined>((resolve) => {
// 		const picker = vscode.window.createQuickPick();
// 		const disposable = vscode.Disposable.from(
// 			picker,
// 			picker.onDidAccept(() => {
// 				resolve(picker.selectedItems[0].label);
// 				disposable.dispose();
// 			}),

// 			picker.onDidHide(() => {
// 				resolve(undefined);
// 				disposable.dispose();
// 			}),
// 		);

// 		picker.title = title;

// 		// TODO: support localization for "Default".
// 		picker.items = items.map(
// 			(item) =>(<vscode.QuickPickItem>{
// 					label: item,
// 					description: (item === value)? 'Default' : undefined,
// 				}),
// 		);

// 		for (const item of picker.items) {
// 			if (item.label === value) {
// 				picker.activeItems = [item];
// 				break;
// 			}
// 		}

// 		picker.show();
// 	});
// }






export class HistoryInputBox extends vscode.Disposable {
	private readonly history: HistoryNavigator<string>;
	private readonly InputBox: vscode.InputBox;


	public constructor(history?: string[]) {
		super(() => this.history.clear());
		this.history = new HistoryNavigator<string>(history ?? [], 100);
		this.InputBox = vscode.window.createInputBox();
		//Text will be prefixed with \u21C5 plus a single space, then used as a hint where input field keeps history
		// const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX = ` or \u21C5 for history`;
		const NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS = ` (\u21C5 for history)`;
		this.InputBox.placeholder = NLS_PLACEHOLDER_HISTORY_HINT_SUFFIX_IN_PARENS;
	}


	public addToHistory(): void {
		if (this.InputBox.value && this.InputBox.value !== this.getCurrentValue()) {
			this.history.add(this.InputBox.value);
		}
	}

	public getHistory(): string[] {
		return this.history.getHistory();
	}

	public showNextValue(): void {
		if (!this.history.has(this.InputBox.value)) this.addToHistory();

		let next = this.getNextValue();
		if (next) next = (next === this.InputBox.value)? this.getNextValue() : next;
		if (next) this.InputBox.value = next;
	}

	public showPreviousValue(): void {
		if (!this.history.has(this.InputBox.value)) this.addToHistory();

		let previous = this.getPreviousValue();
		if (previous) previous = previous === this.InputBox.value ? this.getPreviousValue() : previous;
		if (previous) this.InputBox.value = previous;
	}

	public clearHistory(): void {
		this.history.clear();
	}

	

	private getCurrentValue(): string | null {
		let currentValue = this.history.current();
		if (!currentValue) {
			currentValue = this.history.last();
			this.history.next();
		}
		return currentValue;
	}

	private getPreviousValue(): string | null {
		return this.history.previous() || this.history.first();
	}

	private getNextValue(): string | null {
		return this.history.next() || this.history.last();
	}
}




























interface ReadFromMinibufferOption {
	prompt: string;
}
	
export interface Minibuffer {
	readonly isReading: boolean;
	paste: (text: string) => void;
	readFromMinibuffer: (option: ReadFromMinibufferOption) => Promise<string | undefined>;
}
	
export class InputBoxMinibuffer implements Minibuffer {
	private inputBox: vscode.InputBox | undefined;
	
	constructor() {
		this.inputBox = undefined;
	}
	
	public get isReading(): boolean {
		return this.inputBox != null && this.inputBox.enabled && !this.inputBox.busy;
	}
	
	public paste(text: string): void {
		if (!this.isReading || this.inputBox == null || !this.inputBox.enabled) {
			vscode.window.showWarningMessage("Minibuffer is not active.");
			return;
		}
	
		if (this.inputBox.busy) {
			vscode.window.showWarningMessage("Minibuffer is busy");
			return;
		}
	
		this.inputBox.value = this.inputBox.value + text; // XXX: inputBox cannot get the cursor position, so the pasted text can only be appended to the tail.
	}
	
	public async readFromMinibuffer(option: ReadFromMinibufferOption): Promise<string | undefined> {
		await this.setMinibufferReading(true);
	
		const inputBox = vscode.window.createInputBox();
		this.inputBox = inputBox;
		inputBox.title = option.prompt;
		inputBox.show();
	
		const dispose = () => {
			this.setMinibufferReading(false);
			inputBox.dispose();
			this.inputBox = undefined;
		};
	
		return new Promise<string | undefined>((resolve) => {
			let completed = false;
			inputBox.onDidAccept(() => {
				if (completed) return;
				completed = true;
		
				const value = inputBox.value;
				dispose();
				resolve(value);
			});
			inputBox.onDidHide(() => {
				if (completed) return;
				completed = true;
		
				dispose();
				resolve(undefined);
			});
		});
	}
	
	private setMinibufferReading(minibufferReading: boolean): Thenable<unknown> {
		return vscode.commands.executeCommand("setContext", "emacs-mcx.minibufferReading", minibufferReading);
	}
}































//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


interface VSCodeCommand {
	command: string;
	title: string;
	category?: string;
}

export type VSCodeCommandWithoutCategory = Omit<VSCodeCommand, 'category'>;

type QuickPickWithRunnable = vscode.QuickPickItem & { runnable: Runnable };

// /**
//  * - Convert command ids to {@link QuickPickItem `QuickPickItem[]`}
//  * - Add `args` detail to commands that can accept arguments.
//  */
//  export function commandsToQuickPickItems(commandList: string[]): vscode.QuickPickItem[] {
// 	const quickPickItems: vscode.QuickPickItem[] = [];
// 	for (const com of commandList) {
// 		quickPickItems.push({
// 			label: `${com}${hasArgs(com) ? ' ($(pass-filled) args)' : ''}`,
// 		});
// 	}
// 	return quickPickItems;
// }

export function convertVSCodeCommandToQuickPickItem(commanList: VSCodeCommand[]): QuickPickWithRunnable[] {
	return commanList.map(com => ({
		label: com.title,
		detail: com.command,
		runnable: {
			command: com.command,
		},
	} as QuickPickWithRunnable));
}



const $state: any = null;
const $config: any = null;

/**
 * Show quick pick with user commands. After picking one - run it.
 */
 export async function showQuickPickCommands(commandsForPicking: TopLevelCommands, isFolder = false): Promise<void> {
	const treeAsOneLevelMap: Record<string, {
		runnable: Runnable;
		parentFolderName?: string;
	}> = {};
	function traverseCommands(items: TopLevelCommands, parentFolderName?: string): void {
		for (const key in items) {
			const runnable = items[key];
			if (runnable.nestedItems) {
				traverseCommands(runnable.nestedItems, key);
			} else {
				treeAsOneLevelMap[key] = {
					runnable,
					parentFolderName,
				};
			}
		}
	}
	traverseCommands(commandsForPicking);

	const newCommandButton: vscode.QuickInputButton = {
		iconPath: new vscode.ThemeIcon('add'),
		tooltip: 'Add new command',
	};

	const revealCommandButton: vscode.QuickInputButton = {
		iconPath: new vscode.ThemeIcon('go-to-file'),
		tooltip: 'Reveal in settings.json',
	};

	const userCommands: QuickPickWithRunnable[] = Object.keys(treeAsOneLevelMap).map(label => ({
		// @ts-ignore
		label: `${treeAsOneLevelMap[label]?.runnable.icon ? `$(${treeAsOneLevelMap[label].runnable.icon}) ` : ''}${label}`,
		buttons: [revealCommandButton],
		runnable: treeAsOneLevelMap[label].runnable,
		description: treeAsOneLevelMap[label].parentFolderName ? `$(folder) ${treeAsOneLevelMap[label].parentFolderName}` : undefined,
	}));

	let pickedItem: vscode.QuickPickItem | undefined;
	const quickPick = vscode.window.createQuickPick();
	quickPick.matchOnDescription = true;
	quickPick.matchOnDetail = true;
	quickPick.title = 'Run command';


	if ($config.quickPickIncludeAllCommands && !isFolder) {
		const allCommandPaletteCommands = convertVSCodeCommandToQuickPickItem(await getAllCommandPaletteCommands());
		// dedup?
		quickPick.items = [
			...userCommands,
			...allCommandPaletteCommands,
		];
	} else quickPick.items = userCommands;

	quickPick.buttons = [newCommandButton];
	quickPick.onDidTriggerItemButton(async e => {
		const labelWithoutCodiconIcon = removeCodiconIconFromLabel(e.item.label);
		const clickedItem = treeAsOneLevelMap[labelWithoutCodiconIcon];
		if (e.button.tooltip === revealCommandButton.tooltip) {
			await openSettingsJSON(isWorkspaceCommandItem(clickedItem) ? 'workspace' : 'global');
			goToSymbol(vscode.window.activeTextEditor, labelWithoutCodiconIcon);
		}
		quickPick.hide();
		quickPick.dispose();
	});
	quickPick.onDidChangeSelection(e => {
		pickedItem = e[0];
	});
	quickPick.onDidTriggerButton(e => {
		if (e.tooltip === newCommandButton.tooltip) vscode.commands.executeCommand(CommandId.NewCommand);
		quickPick.hide();
		quickPick.dispose();
	});

	quickPick.onDidAccept(async () => {
		if (pickedItem) {
			// @ts-ignore
			await run(pickedItem.runnable);
		}
		quickPick.hide();
		quickPick.dispose();
	});
	quickPick.show();
}



















async function getAllCommandPaletteCommands(): Promise<VSCodeCommandWithoutCategory[]> {
	if ($state.allCommandPaletteCommands.length) {
		return $state.allCommandPaletteCommands;
	}
	const commandsFromExtensions = getAllCommandsFromExtensions();
	const builtinCommands = await getAllBuiltinCommands();
	const allCommandPaletteCommands = [
		...builtinCommands,
		...commandsFromExtensions,
	];
	$state.allCommandPaletteCommands = allCommandPaletteCommands;
	return allCommandPaletteCommands;
}



async function getAllBuiltinCommands(): Promise<VSCodeCommandWithoutCategory[]> {
	const commandsDataPath = $state.context.asAbsolutePath('./data/commandTitleMap.json');
	const file = await fs.promises.readFile(commandsDataPath);
	try {
		const fileContentAsObject = JSON.parse(file.toString());
		const result: VSCodeCommandWithoutCategory[] = [];
		for (const key in fileContentAsObject) {
			result.push({
				command: key,
				title: fileContentAsObject[key],
			});
		}
		return result;
	} catch (e) {
		vscode.window.showErrorMessage(`Failed to get builtin commands: ${String(e)}`);
	}
	return [];
}




export function getAllCommandsFromExtensions(): VSCodeCommandWithoutCategory[] {
	const coms: VSCodeCommandWithoutCategory[] = [];
	for (const extension of vscode.extensions.all) {
		const contributedCommands: VSCodeCommand[] | undefined = extension.packageJSON?.contributes?.commands;
		if (contributedCommands) {
			coms.push(...contributedCommands.map(command => ({
				command: command.command,
				title: `${command.category ? `${command.category}: ` : ''}${command.title}`,
			})));
		}
	}
	return coms;
}


/**
 * Remove codicon that shows at the start of the label when
 * the item has "icon" property.
 */
export function removeCodiconIconFromLabel(str: string): string {
	return str.replace(/\$\([a-z-]+\)\s/i, '');
}
/**
 * Remove codicon with the args text that shows at the end of the label
 * of the command that accepts arguments.
 */
export function removeCodiconFromLabel(str: string): string {
	return str.replace(/\s\(\$\([a-z-]+\)\sargs\)/i, '');
}