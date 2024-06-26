import * as process from 'process';
import { env, UIKind } from 'vscode';



export const isWeb = env.uiKind === UIKind.Web;
export const isRemote = env.remoteName !== undefined;

export const isLinux = process.platform === 'linux';
export const isMac = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';




export const enum Platform {
	Unknown = 'Unknown',
	Windows = 'Windows',
	Mac = 'MacOS',
	Linux = 'Linux',
}

export function GetPlatform(): Platform { switch (process.platform) {
	case 'win32': return Platform.Windows;
	case 'darwin': return Platform.Mac;
	case 'linux': return Platform.Linux;
	default: return Platform.Unknown;
}}


export function getDocumentType(fsPath: string) { return /\.([\w]+)$/.exec(fsPath)?.pop(); } //Testing string //