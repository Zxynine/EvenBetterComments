


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

export function Sign(value:number):1|-1 { return (value < 0)? -1:1; }

export function Mod2(value:number) { return (((value>>1) << 1) ^ value); }

export function IsEven(value:number) { return (((value>>1) << 1) ^ value) === 0; }



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




export function Round(number: number, decimalPoints: number): number {
	const decimal = Math.pow(10, decimalPoints);
	return Math.round(number * decimal) / decimal;
}



export function Clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function Rot(index: number, modulo: number): number {
	return (modulo + (index % modulo)) % modulo;
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