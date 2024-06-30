import * as vscode from 'vscode';

export namespace Console {
	const Channel = vscode.window.createOutputChannel('Even Better Comments');
	const Format = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium' })

	export function Raw(...args: any[]) { Display(...args); }
	export function Log(...args: any[]) { Display('[LOG] ', ...args); }
	export function Error(...args: any[]) { Display('[ERROR] ', ...args); }
	export function Warn(...args: any[]) { Display('[WARNING] ', ...args); }

	export function GetTimeStamp() { return Format.format(new Date()); }

	function Display(...args: any[]) { 
		Channel.appendLine(
			args.map(obj => (
				(typeof obj === 'object') 
				? JSON.stringify(obj) 
				: obj
			)).join(' ')
		);
	}

	
	export function TimeLog(...args: any[]) { Display(`${Console.GetTimeStamp()}:`,'[LOG] ', ...args); }
	export function TimeError(...args: any[]) { Display(`${Console.GetTimeStamp()}:`,'[ERROR] ', ...args); }
	export function TimeWarn(...args: any[]) { Display(`${Console.GetTimeStamp()}:`,'[WARNING] ', ...args); }
}