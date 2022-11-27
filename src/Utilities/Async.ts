

import * as vscode from 'vscode';










export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * Emulate delay with async setTimeout().
 */
export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Emulate delay with async setTimeout().
 */
export async function Sleep(ms: number): Promise<number> {
	return new Promise(resolve => setTimeout(() => resolve(ms), ms));
}




export async function Pulse(delay: float, count: int, callback: Action) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		callback();
	}, delay);
}

export async function PulseWithCount(delay: float, count: int, callback: Action<[int]>) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		callback(counter);
	}, delay);
}

export async function PulseWithCountCancelable(delay: float, count: int, callback: Func<[int], bool>) {
	let counter = 0;
	const intervalId = setInterval(() => {
		if (counter++ > count) clearInterval(intervalId);
		if (!callback(counter)) clearInterval(intervalId);
	}, delay);
}


export async function delay(ms: number) {
	return (ms <= 0)? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms));
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





