



import * as vscode from 'vscode';












export default class Debug {
	Log(msg: string, ...items: string[]) {
		vscode.window.showInformationMessage(msg, ...items);
	}

	LogWarning(msg: string, ...items: string[]) {
		vscode.window.showWarningMessage(msg, ...items);
	}

	LogError(msg: string, ...items: string[]) {
		vscode.window.showErrorMessage(msg, ...items);
	}
	  









}










/** Type of VS Code Message. */
enum MessageType {
	/** Show message as information. */
	Info = "Info",
	/** Show message as warning. */
	Warning = "Warning",
	/** Show message as error. */
	Error = "Error",
}


type Action = () => void;

type Option = {
    readonly name: string;
    action?: Action;
};






function showMessage(type: MessageType, message: string, options: vscode.MessageOptions, ...items: string[]): Thenable<string|undefined> {
	switch (type) {
		case MessageType.Warning: return vscode.window.showWarningMessage(message, options, ...items);
		case MessageType.Error: return vscode.window.showErrorMessage(message, options, ...items);
		case MessageType.Info: return vscode.window.showInformationMessage(message, options, ...items);
		default: return vscode.window.showInformationMessage(message, options, ...items);
	}
}









/** Builder for showing VS Code Message. */
 export class MessageBuilder {
    private type: MessageType = MessageType.Error;
    private options: Option[] = [];
    private modal = false;

    private constructor(private message: string) { }

    /** Initializes a message builder with a message. */
    public static with(message: string): MessageBuilder {
        return new MessageBuilder(message);
    }

    /** Adds a button to the message with an optional action. */
    public addOption(name: string, action?: Action): MessageBuilder {
        this.options.push({ name, action });
        return this;
    }

    /** Sets type of message. */
    public setType(type: MessageType): MessageBuilder {
        this.type = type;
        return this;
    }

    /** Sets modality of message. */
    public setModal(modal: boolean): MessageBuilder {
        this.modal = modal;
        return this;
    }

    /** Shows message with VS Code's built-in message feature. */
    public async show(): Promise<string | undefined> {
        const optionNames = this.options.map(option => option.name);

        // Logger.log(`Message shown: ${this.message}`);
        const result = await showMessage(this.type, this.message, { modal: this.modal }, ...optionNames);

        // Logger.log(`Message answered: Answer: ${result}, Message: ${this.message}`);
        this.options.find(option => option.name === result)?.action?.();

        return result;
    }
}



















