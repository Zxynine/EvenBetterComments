export {}


// declare global {
// 	// interface Iterable<T> {
// 	// 	every(predicate: (item: T) => boolean): bool;
// 	// }


// 	// interface IterableIterator<T> {
// 	// 	every(predicate: (item: T) => boolean): bool;
// 	// }
	
// }


//https://github.com/gitkraken/vscode-gitlens/blob/main/src/system/iterable.ts





export function every<T>(source: Iterable<T> | IterableIterator<T>, predicate: (item: T) => boolean): boolean {
	for (const item of source) {
		if (!predicate(item)) return false;
	}
	return true;
}