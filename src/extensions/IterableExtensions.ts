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











/////////////////////////////////////
// Checks if the value is a promise;
export function isPromise(value: any) {
    return value && typeof value.then === 'function';
}







    // //////////////////////////////////////////
    // // Checks if the function is a generator,
    // // and if so - wraps it up into a promise;
    // export function wrap<T extends Function>(func: T) {
    //     if (typeof func === 'function') {
    //         if (func.constructor.name === 'GeneratorFunction') {
    //             return asyncAdapter(func);
    //         }
    //         return func;
    //     }
    //     return null;
    // }


    // /////////////////////////////////////////////////////
    // // Resolves a mixed value into the actual value,
    // // consistent with the way mixed values are defined:
    // // https://github.com/vitaly-t/spex/wiki/Mixed-Values
    // function resolve(this:any, value:any, params?:any, onSuccess?:any, onError?:any) {

    //     const self = this;
    //     let delayed = false;

    //     function loop() {
    //         while (typeof value === 'function') {
    //             if (value.constructor.name === 'GeneratorFunction') {
    //                 value = asyncAdapter(value);
    //             }
    //             try {
    //                 value = params ? value.apply(self, params) : value.call(self);
    //             } catch (e) {
    //                 onError(e, false); // false means 'threw an error'
    //                 return;
    //             }
    //         }
    //         if (isPromise(value)) {
    //             value
    //                 .then((data:any) => {
    //                     delayed = true;
    //                     value = data;
    //                     loop();
    //                     return null; // this dummy return is just to prevent Bluebird warnings;
    //                 })
    //                 .catch((error:any) => {
    //                     onError(error, true); // true means 'rejected'
    //                 });
    //         } else {
    //             onSuccess(value, delayed);
    //         }
    //     }

    //     loop();
    // }

    // // Generator-to-Promise adapter;
    // // Based on: https://www.promisejs.org/generators/#both
    // export function asyncAdapter(generator: any) {
    //     return function (this:any) {
    //         const g = generator.apply(this, arguments);

    //         function handle(result:any) {
    //             if (result.done) {
    //                 return resolve(result.value);
    //             }
    //             return resolve(result.value)
    //                 .then((res:any) => handle(g.next(res)), (err:any) => handle(g.throw(err)));
    //         }

    //         return handle(g.next());
    //     };
    // }
