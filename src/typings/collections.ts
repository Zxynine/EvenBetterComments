import { Disposable } from "vscode";




export type IDisposable = Disposable;


export interface IReference<T> extends IDisposable {
	readonly object: T;
}

