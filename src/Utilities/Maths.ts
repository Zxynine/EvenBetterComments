



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

