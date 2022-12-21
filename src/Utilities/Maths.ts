

export type Sign = 1|-1;

export class Counter {
	private _next = 0;
	public get Next(): number { return this._next++; }
}






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

export function Sign(value:number):Sign { return (value < 0)? -1:1; }

export function Mod2(value:number) { return (((value>>1) << 1) ^ value); }

export function IsEven(value:number) { return (((value>>1) << 1) ^ value) === 0; }
export function IsOdd(value:number) { return (((value>>1) << 1) ^ value) === 1; }



export class MovingAverage {
	private _n = 1;
	private _val = 0;

	Update(value: number): number {
		this._val += (value - this._val) / this._n;
		this._n++;
		return this._val;
	}

	get Value(): number {
		return this._val;
	}
}




export function Round(number: number, decimalPlaces: number): number {
	const decimal = Math.pow(10, decimalPlaces);
	return Math.round(number * decimal) / decimal;
}



export function Clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
export function Clamp01(value: number) {
	return (value > 1)? 1 : (value < 0)? 0 : value;
}

export function Rot(index: number, modulo: number): number {
	return (modulo + (index % modulo)) % modulo;
}



export function InRange(value: number, low:number, high:number): bool {
	return (low <= value) && (value <= high);
}

export function InRange01(value: number): bool {
	return (0 <= value) && (value <= 1);
}





export function ToBinaryString(nMask : number) {
	// nMask must be between -2147483648 and 2147483647
	if (nMask > 2**32-1)  throw "number too large. number shouldn't be > 2**31-1"; //added
	if (nMask < -1*(2**31)) throw "number too far negative, number shouldn't be < 2**31" //added
	for (
		var nFlag = 0, sMask=''; 
		(nFlag < 32);
		nFlag++, sMask += String(nMask >>> 31), nMask <<= 1
	);
	sMask=sMask.replace(/\B(?=(.{8})+(?!.))/g, " ") // added
	return sMask;
}








// abbreviateNumber source https://gist.github.com/tobyjsullivan/96d37ca0216adee20fa95fe1c3eb56ac

export function abbreviateNumber(value: number): string {
	const suffixes = ['', 'K', 'M', 'B', 'T']
	let newValue = value
	let suffixNum = 0
	while (newValue >= 1000) {
		newValue /= 1000
		suffixNum++
	}

	return newValue.toPrecision(3) + suffixes[suffixNum];
}