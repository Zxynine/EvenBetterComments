














/**
 * Checks if the given argument is undefined.
 * @function
 */
 export function isUndefined(obj: any): obj is undefined {
    return (typeof obj) === 'undefined';
}