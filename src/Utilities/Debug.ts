
export namespace Console {
	export const ExtentionTitle = 'EvenBetterComments: ';
	export function FormatMessage(message:unknown): string;
	export function FormatMessage(message:unknown, delimeter: string = "", ...args: unknown[]): string {
		return (ExtentionTitle + [message, ...args].join(delimeter));
	}

	export function GetTimeStamp(): string { // Ex: "22/11/2022, 22:16:50"
		return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date());
	}

		
	export function LogTime(message:string, ...args: any[]): void {
		console.log(`[${Console.GetTimeStamp()}]: ${message}`, ...args);
	}

	export function LogError(err: Exception): void {
		console.error(`[${Console.GetTimeStamp()}] Error<${err.name}>: '${err.message}'\n\n${err.stack}`);
	}

	export function LogWarning(message:string, ...args: any[]): void {
		console.warn(`[${Console.GetTimeStamp()}]: ${message}`, ...args);
	}
 


	export const enum Type {
		Info, Warning, Error
	}


	/**
	 * Show an information message to users. Optionally provide an array of items which will be presented as
	 * clickable buttons.
	 *
	 * @param message The message to show.
	 * @param logType The type of message to display (Default is Information message).
	 * @param buttons A set of items that will be rendered as actions in the message.
	 * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
	 */

	

	export function Log(message:string) : void;
	export function Log(message:string, logType:Type, ...args: any[]) : void;
	export function Log(message:string, logType:Type=Type.Info, ...args: any[]) : void {
		switch (logType) {
			case Type.Info: return console.log(`[${Console.GetTimeStamp()}]: ${message}`, ...args);
			case Type.Warning: return console.warn(`[${Console.GetTimeStamp()}]: ${message}`, ...args);
			case Type.Error: console.error(`[${Console.GetTimeStamp()}]: ${message}`, ...args);
		}
	}

}












// export class Log {
// 	private static _channel: vscode.OutputChannel

// 	static get outputChannel(): vscode.OutputChannel {
// 	if (!this._channel)
// 		this._channel = vscode.window.createOutputChannel(EXT_NAME)
// 	return this._channel
// 	}

// 	static raw(...values: any[]) {
// 	this.outputChannel.appendLine(values.map(i => i.toString()).join(' '))
// 	}

// 	static info(message: string, intend = 0) {
// 	this.outputChannel.appendLine(`${'\t'.repeat(intend)}${message}`)
// 	}

// 	static warn(message: string, prompt = false, intend = 0) {
// 	if (prompt) vscode.window.showWarningMessage(message)
// 	Log.info(`⚠ WARN: ${message}`, intend)
// 	}

// 	static async error(err: Error | string | any = {}, prompt = true, intend = 0) {
// 	if (typeof err !== 'string') {
// 		const messages = [
// 		err.message,
// 		err.response?.data,
// 		err.stack,
// 		err.toJSON?.(),
// 		]
// 		.filter(Boolean).join('\n')
// 		Log.info(`🐛 ERROR: ${err.name}: ${messages}`, intend)
// 	}

// 	if (prompt) {
// 		const openOutputButton = i18n.t('prompt.show_error_log')
// 		const message = typeof err === 'string' ? err : `${EXT_NAME} Error: ${err.toString()}`

// 		const result = await vscode.window.showErrorMessage(message, openOutputButton)
// 		if (result === openOutputButton)
// 		this.show()
// 	}
// 	}

// 	static show() {
// 		this._channel.show()
// 	}

// 	static divider() {
// 		this.outputChannel.appendLine('\n――――――\n')
// 	}
// }