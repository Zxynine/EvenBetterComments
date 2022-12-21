
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





export function convertMsToSec(timeInMs: number) {
	return Math.floor((timeInMs % (1000 * 60)) / 1000);
}

