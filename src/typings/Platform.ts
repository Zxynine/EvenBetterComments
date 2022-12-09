import * as process from 'process';
import { env, UIKind } from 'vscode';

export const isWeb = env.uiKind === UIKind.Web;

export const isLinux = process.platform === 'linux';
export const isMac = process.platform === 'darwin';
export const isWindows = process.platform === 'win32';

export const enum Platform {
	Unknown = 'unknown',
	Linux = 'linux',
	Mac = 'macOS',
	Windows = 'win32',
	Web = 'web',
}



export function getPlatform(): Platform {
	if (isWindows) {
		return Platform.Windows;
	}
	if (isMac) {
		return Platform.Mac;
	}
	if (isLinux) {
		return Platform.Linux;
	}
	return isWeb ? Platform.Web : Platform.Unknown;
}








// export const isWeb = true;

// const _platform = (navigator as any)?.userAgentData?.platform;
// const _userAgent = navigator.userAgent;

// export const isLinux = _platform === 'Linux' || _userAgent.indexOf('Linux') >= 0;
// export const isMac = _platform === 'macOS' || _userAgent.indexOf('Macintosh') >= 0;
// export const isWindows = _platform === 'Windows' || _userAgent.indexOf('Windows') >= 0;

// export function getPlatform(): string {
// 	if (isWindows) {
// 		return 'web-windows';
// 	}
// 	if (isMac) {
// 		return 'web-macOS';
// 	}
// 	if (isLinux) {
// 		return 'web-linux';
// 	}
// 	return 'web';
// }