








export function Min(...values:number[]):number {
	let min = Number.MAX_SAFE_INTEGER;
	for (const val of values) if (val < min) min = val;
	return min;
}

export function Max(...values:number[]):number {
	let min = Number.MIN_SAFE_INTEGER;
	for (const val of values) if (val > min) min = val;
	return min;
}

export function Sign(value:number):1|-1 {
	return (value < 0)? -1 : 1;
}