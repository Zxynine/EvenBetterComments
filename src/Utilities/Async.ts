

import * as vscode from 'vscode';








/**
 * Emulate delay with async setTimeout().
 */
export const Sleep = async (ms: number): Promise<void> => (ms <= 0) ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms));


export async function Pulse(delay: float, count: int, callback: Action) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		callback();
	}, delay);
}

export async function PulseWithCount(delay: float, count: int, callback: Action<int>) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		callback(counter);
	}, delay);
}

export async function PulseWithCountCancelable(delay: float, count: int, callback: Func<int, bool>) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		if (!callback(counter)) clearInterval(intervalId);
	}, delay);
}


export function disposableInterval(fn: (...args: any[]) => void, ms: number): vscode.Disposable {
	let timer: ReturnType<typeof setInterval> | undefined;
	const disposable = {
		dispose: () => {
			if (timer != null) {
				clearInterval(timer);
				timer = undefined;
			}
		},
	};
	timer = setInterval(fn, ms);

	return disposable;
}


	// // IMPORTANT: To avoid calling update too often, set a timer for 100ms to wait before updating decorations
	// var timeout: NodeJS.Timer;
	// // Called to handle events above
	// function triggerUpdateDecorations() {
	// 	if (timeout) clearTimeout(timeout);
	// 	timeout = setTimeout(updateDecorations, 100);
	// }

// export function Get


// 	// IMPORTANT: To avoid calling update too often, set a timer for 100ms to wait before updating decorations
// 	var timeout: NodeJS.Timer;
// 	// Called to handle events above
// 	function triggerUpdateDecorations() {
// 		if (timeout) clearTimeout(timeout);
// 		timeout = setTimeout(updateDecorations, 100);
// 	}






export function convertMsToSec(timeInMs: number) {
	return Math.floor((timeInMs % (1000 * 60)) / 1000);
}





export const AwaitController = function() {
    const DefaultTimeout = 300;
    const documentChanged : any[] = [];
    const selectionChanged : any[] = [];

    const processDocumentChangeEvent = function() {
        const notifiers = Array.from(documentChanged);
        documentChanged.length = 0;
        for (let i = 0; i < notifiers.length; i++) {
            notifiers[i]();
        }
    };
    const processSelectionChangeEvent = function() {
        const notifiers = Array.from(selectionChanged);
        selectionChanged.length = 0;
        for (let i = 0; i < notifiers.length; i++) {
            notifiers[i]();
        }
    };
    const sleep = (msec:number) => new Promise(resolve => setTimeout(resolve, msec));
    const waitForClipboardChange = async function(timeout:number) {
        const last = await vscode.env.clipboard.readText();
        let quit = false;
        setTimeout(() => { quit = true; }, timeout);
        while (!quit) {
			const current = await sleep(5).then(vscode.env.clipboard.readText);
            if (current !== last) return;
        }
        throw 'timeout';
    };

    const waitFor = function(awaitOption:string, timeout = DefaultTimeout) {
        const awaitList = awaitOption.split(' ');
        const promises = [];
        let resolveFunc : any = null;
        let expectedEventCount = 0;
        const doneOne = function() {
            expectedEventCount -= 1;
            if (expectedEventCount == 0) resolveFunc();
        };
        for (let i = 0; i < awaitList.length; i++) {
            const e = awaitList[i];
            if (e === 'document') {
                expectedEventCount += 1;
                documentChanged.push(doneOne);
            } else if (e === 'selection') {
                expectedEventCount += 1;
                selectionChanged.push(doneOne);
            } else if (e === 'clipboard') promises.push(waitForClipboardChange(timeout));
            else if (e !== '') console.error('Error (kb-macro): Unknown args.await parameter "' + e + '"');
            
        }
        if (expectedEventCount !== 0) {
            promises.push(new Promise((resolve, reject) => {
                resolveFunc = resolve;
                setTimeout(() => {
                    if (0 < expectedEventCount) {
                        expectedEventCount = 0;
                        reject();
                    }
                }, timeout);
            }));
        }
		return (promises.length === 0)? Promise.resolve(null) : Promise.all(promises);
    };

    return {
        processDocumentChangeEvent,
        processSelectionChangeEvent,
        waitFor
    };
};






export function asPromise<T>(thenable: Thenable<T>): Promise<T> {
	return new Promise<T>(thenable.then);	
}







/**
 * When an change event is fired, prevent mutual event triggering (infinite loop)
 */
 export class ExclusiveHandle {
	private running: Promise<any> | undefined = undefined;

	run<T = void>(listener: () => Promise<T> | T): Promise<T> {
		this.running ??= Promise.resolve(listener()).finally(() => this.running = undefined);		
		return this.running;
	}
}











/**
 * This class will call the provided callback after the specified number of calls and then resets its counter to be reused. (2 means after every 2 calls it will be invoked)
 */
export class Periodically {
	private readonly LAMBDA: Event;
	public readonly Frequency: int;
	private calls: int = 0;

	public constructor(callcount:int, action:Event) {
		this.Frequency = callcount;
		this.LAMBDA = action;
	}

	public Invoke() {
		if (++this.calls >= this.Frequency) this.LAMBDA();
	}

	public ForceInvoke() {
		this.LAMBDA();
		this.calls = 0;
	}

	public Reset() { this.calls = 0; }
}









export const passthrough = (value: any, resolve: (value?: any) => void) => resolve(value);

export interface PromiseAdapter<T, U> {
	(value: T, resolve: (value?: U | PromiseLike<U>) => void, reject: (reason: any) => void): any;
}



export function done<T>(promise: Promise<T>): Promise<void> {
	return promise.then<void>(() => undefined);
}







export function debounce(fn: () => any, delay: number): () => void {
	let timer: any;
	return () => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(), delay);
	};
}


export function throttle<T>(fn: () => Promise<T>): () => Promise<T> {
	let current: Promise<T> | undefined;
	let next: Promise<T> | undefined;

	const trigger = (): Promise<T> => {
		if (next) return next;

		if (current) {
			next = done(current).then(() => {
				next = undefined;
				return trigger();
			});

			return next;
		}

		current = fn();

		const clear = () => (current = undefined);
		done(current).then(clear, clear);

		return current;
	};

	return trigger;
}