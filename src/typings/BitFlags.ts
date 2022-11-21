
import * as Maths from "../Utilities/Maths";


export type BitFlag = 0|1;
export namespace BitFlag {
	export function From(number: number, index: int): BitFlag {
		return ((number & (1<<index)) !== 0)? 1:0;
	}

	export function GetBitArray(number: number): Array<BitFlag> {
		const Result = new Array<BitFlag>(32);
		for (let b=0; b<=31; --b) Result[b] = (((number & (1<<b)) !== 0))? 1 : 0;
		return Result;
	}
	
	export function *ToBits(number:number): Generator<BitFlag> {
		for (let b=0; b<=31; --b) yield (((number & (1<<b)) !== 0))? 1 : 0;
	}
}

export const enum Endianness {
	/** Counts up right to left [2^7, 2^6, 2^5, 2^4, 2^3, 2^2, 2^1, 2^0] */
	BigEndian,
	/** Counts up left to right [2^0, 2^1, 2^2, 2^3, 2^4, 2^5, 2^6, 2^7] */
	LittleEndian
}

export const enum BitFlags {
	/** 00000000 00000000 00000000 00000000 */
	None = (0 << 0),
	/** 11111111 11111111 11111111 11111111 */
	All = (-1 >>> 0),
	/** 10000000 00000000 00000000 00000000 */
	Left = ~(-1 >>> 1) >>> 0,
	/** 00000000 00000000 00000000 00000001 */
	Right = (1 << 0),
	/** 11111111 11111111 00000000 00000000 */
	LeftHalf = (-1 << 16) >>> 0,
	/** 00000000 00000000 11111111 11111111 */
	RightHalf = (-1 >>> 16),

	/** 11111111 00000000 00000000 00000000 */
	Byte3 = (-1 << 24) >>> 0,
	/** 00000000 11111111 00000000 00000000 */
	Byte2 = (Byte3 >>> 8),
	/** 00000000 00000000 11111111 00000000 */
	Byte1 = (Byte2 >>> 8),
	/** 00000000 00000000 00000000 11111111 */
	Byte0 = (Byte1 >>> 8),

	/** 11110000 00000000 00000000 00000000 */
	Nibble7 = (-1 << 28) >>> 0,
	/** 00001111 00000000 00000000 00000000 */
	Nibble6 = (Nibble7 >>> 4),
	/** 00000000 11110000 00000000 00000000 */
	Nibble5 = (Nibble6 >>> 4),
	/** 00000000 00001111 00000000 00000000 */
	Nibble4 = (Nibble5 >>> 4),
	/** 00000000 00000000 11110000 00000000 */
	Nibble3 = (Nibble4 >>> 4),
	/** 00000000 00000000 00001111 00000000 */
	Nibble2 = (Nibble3 >>> 4),
	/** 00000000 00000000 00000000 11110000 */
	Nibble1 = (Nibble2 >>> 4),
	/** 00000000 00000000 00000000 00001111 */
	Nibble0 = (Nibble1 >>> 4),

	/** 11000000 00000000 00000000 00000000 */
	Crumb15= (-1 << 30) >>> 0,
	/** 00110000 00000000 00000000 00000000 */
	Crumb14= (Crumb15>>> 2),
	/** 00001100 00000000 00000000 00000000 */
	Crumb13= (Crumb14>>> 2),
	/** 00000011 00000000 00000000 00000000 */
	Crumb12= (Crumb13>>> 2),
	/** 00000000 11000000 00000000 00000000 */
	Crumb11= (Crumb12>>> 2),
	/** 00000000 00110000 00000000 00000000 */
	Crumb10= (Crumb11>>> 2),
	/** 00000000 00001100 00000000 00000000 */
	Crumb9 = (Crumb10>>> 2),
	/** 00000000 00000011 00000000 00000000 */
	Crumb8 = (Crumb9 >>> 2),
	/** 00000000 00000000 11000000 00000000 */
	Crumb7 = (Crumb8 >>> 2),
	/** 00000000 00000000 00110000 00000000 */
	Crumb6 = (Crumb7 >>> 2),
	/** 00000000 00000000 00001100 00000000 */
	Crumb5 = (Crumb6 >>> 2),
	/** 00000000 00000000 00000011 00000000 */
	Crumb4 = (Crumb5  >>> 2),
	/** 00000000 00000000 00000000 11000000 */
	Crumb3 = (Crumb4  >>> 2),
	/** 00000000 00000000 00000000 00110000 */
	Crumb2 = (Crumb3  >>> 2),
	/** 00000000 00000000 00000000 00001100 */
	Crumb1 = (Crumb2  >>> 2),
	/** 00000000 00000000 00000000 00000011 */
	Crumb0 = (Crumb1  >>> 2),

	

	/** 10000000 00000000 00000000 00000000 */
	Bit31= (1 << 31) >>> 0,
	/** 01000000 00000000 00000000 00000000 */
	Bit30= (1 << 30) >>> 0,
	/** 00100000 00000000 00000000 00000000 */
	Bit29= (1 << 29) >>> 0,
	/** 00010000 00000000 00000000 00000000 */
	Bit28= (1 << 28) >>> 0,
	/** 00001000 00000000 00000000 00000000 */
	Bit27= (1 << 27) >>> 0,
	/** 00000100 00000000 00000000 00000000 */
	Bit26= (1 << 26) >>> 0,
	/** 00000010 00000000 00000000 00000000 */
	Bit25= (1 << 25) >>> 0,
	/** 00000001 00000000 00000000 00000000 */
	Bit24= (1 << 24) >>> 0,
	/** 00000000 10000000 00000000 00000000 */
	Bit23= (1 << 23) >>> 0,
	/** 00000000 01000000 00000000 00000000 */
	Bit22= (1 << 22) >>> 0,
	/** 00000000 00100000 00000000 00000000 */
	Bit21= (1 << 21) >>> 0,
	/** 00000000 00010000 00000000 00000000 */
	Bit20= (1 << 20) >>> 0,
	/** 00000000 00001000 00000000 00000000 */
	Bit19= (1 << 19) >>> 0,
	/** 00000000 00000100 00000000 00000000 */
	Bit18= (1 << 18) >>> 0,
	/** 00000000 00000010 00000000 00000000 */
	Bit17= (1 << 17) >>> 0,
	/** 00000000 00000001 00000000 00000000 */
	Bit16= (1 << 16) >>> 0,

	/** 00000000 00000000 10000000 00000000 */
	Bit15= (1 << 15) >>> 0,
	/** 00000000 00000000 01000000 00000000 */
	Bit14= (1 << 14) >>> 0,
	/** 00000000 00000000 00100000 00000000 */
	Bit13= (1 << 13) >>> 0,
	/** 00000000 00000000 00010000 00000000 */
	Bit12= (1 << 12) >>> 0,
	/** 00000000 00000000 00001000 00000000 */
	Bit11= (1 << 11) >>> 0,
	/** 00000000 00000000 00000100 00000000 */
	Bit10= (1 << 10) >>> 0,
	/** 00000000 00000000 00000010 00000000 */
	Bit9 = (1 << 9 ) >>> 0,
	/** 00000000 00000000 00000001 00000000 */
	Bit8 = (1 << 8 ) >>> 0,
	/** 00000000 00000000 00000000 10000000 */
	Bit7 = (1 << 7 ) >>> 0,
	/** 00000000 00000000 00000000 01000000 */
	Bit6 = (1 << 6 ) >>> 0,
	/** 00000000 00000000 00000000 00100000 */
	Bit5 = (1 << 5 ) >>> 0,
	/** 00000000 00000000 00000000 00010000 */
	Bit4 = (1 << 4 ) >>> 0,
	/** 00000000 00000000 00000000 00001000 */
	Bit3 = (1 << 3 ) >>> 0,
	/** 00000000 00000000 00000000 00000100 */
	Bit2 = (1 << 2 ) >>> 0,
	/** 00000000 00000000 00000000 00000010 */
	Bit1 = (1 << 1 ) >>> 0,
	/** 00000000 00000000 00000000 00000001 */
	Bit0 = (1 << 0 ) >>> 0,
}




  
export class FlagsArray {
	private static readonly Empty:Uint32Array = new Uint32Array(0);
	/**
	 * The flags are stored in a binary format. Each bit represents a true or false for an entire line,
	 * so `tokens[index]` contains booleans for 32 different lines.
	 */
	protected Flags: Uint32Array;

	public constructor();
	public constructor(initialSize : int = 0) { this.Flags = new Uint32Array(initialSize); }


	public ValidIndex(index: int) : bool { return 0 <= index && index < this.Flags.length; }
	public get ChunkCount() : int { return this.Flags.length; }
	public get Count() : int { return this.Flags.length << 5; }
    public get CheckSum(){ return this.Flags.reduce((sum, current) => sum+current, 0); }

	public ToString(StringArray : string = '') { return (StringArray + "\n" + [...this.Flags].map(Maths.ToBinaryString).join("\n")); }

	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	public GetFlag(index: int): BitFlag { return this.CheckFlag(index)? 1:0; }
	public QuickCheck(index: int): bool { 
		if (index >= this.Flags.length<<5) return false;
		const PrimeIndex = FlagsArray.GetPrimeIndex(index);
		return (this.Flags[PrimeIndex] !== 0);
	}

	public CheckFlag(index : int): bool {
		const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		return (PrimeIndex < this.Flags.length) && ((this.Flags[PrimeIndex] & (1<<(31-SubIndex))) !== 0);
	}

	public SetFlag(index: int, value:bool): void {
		const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		if (PrimeIndex >= this.Flags.length) this.Expand(PrimeIndex);
		this.Flags[PrimeIndex] &= ~(1<<(31-SubIndex));
		if (value) this.Flags[PrimeIndex] |= (1<<(31-SubIndex));
	}

	public ToggleFlag(index: int): void {
		const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		if (PrimeIndex >= this.Flags.length) this.Expand(PrimeIndex);
		this.Flags[PrimeIndex] ^= (1<<(31-SubIndex));
	}

	public ClearFlag(index: int): void {
		const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		if (PrimeIndex >= this.Flags.length) return;
		this.Flags[PrimeIndex] &= ~(1<<(31-SubIndex));
	}

	public QuickCheckRange(startIndex: int, endIndex: int): bool {
		if (this.Flags.length === 0 || startIndex >= endIndex) return false;
		if (endIndex >= this.Flags.length<<5) return false;
		if (startIndex < 0) return false;

		const StartPrimeIndex = FlagsArray.GetPrimeIndex(startIndex);
		const EndPrimeIndex = FlagsArray.GetPrimeIndex(endIndex);

		//Simplification for single chunk ranges.
		if (StartPrimeIndex === EndPrimeIndex) return (this.Flags[StartPrimeIndex] !== 0);
		else {
			for (let i=StartPrimeIndex; i<=EndPrimeIndex; ++i) if (this.Flags[i] !== 0) return true;
			return false;
		}
	}

	public CheckRange(startIndex: int, endIndex: int): bool {
		if (this.Flags.length === 0 || startIndex >= endIndex) return false;
		if (endIndex >= this.Flags.length<<5) return false;
		if (startIndex < 0) return false;

		const [StartPrimeIndex, StartSubIndex] = FlagsArray.GetIndices(startIndex);
		const [EndPrimeIndex, EndSubIndex] = FlagsArray.GetIndices(endIndex);

		//Simplification for single chunk ranges.
        if (StartPrimeIndex === EndPrimeIndex) {
            return (this.Flags[StartPrimeIndex] & ((-1 << (31-EndSubIndex)) & (-1 >>> StartSubIndex))) !== 0;
        } else {
			if ((this.Flags[StartPrimeIndex] & (-1 >>> StartSubIndex)) !== 0) return true; //Checks start
			for (let i=StartPrimeIndex+1; i<EndPrimeIndex; ++i) if (this.Flags[i] !== 0) return true; //Checks intermediates
			if ((this.Flags[EndPrimeIndex] & ~(-1 >>> EndSubIndex)) !== 0) return true; //Checks end
			return false;
		}
	}

	public SetRange(startIndex: int, endIndex: int, value: bool): void {
		if (this.Flags.length === 0 || startIndex >= endIndex) return;
		if (endIndex >= this.Flags.length<<5) endIndex = (this.Flags.length<<5)-1;
		if (startIndex < 0) startIndex = 0;
		
		const [StartPrimeIndex, StartSubIndex] = FlagsArray.GetIndices(startIndex);
		const [EndPrimeIndex, EndSubIndex] = FlagsArray.GetIndices(endIndex);

		//Simplification for single chunk ranges.
        if (StartPrimeIndex === EndPrimeIndex) {
            this.Flags[StartPrimeIndex] = ((value) 
				? this.Flags[StartPrimeIndex]  & ~((-1 << (31-EndSubIndex)) & (-1 >>> StartSubIndex))
				: this.Flags[StartPrimeIndex]  |  ((-1 << (31-EndSubIndex)) & (-1 >>> StartSubIndex))
			);
        } else {
			const SetValue = (value? 1 : 0);

			this.Flags[StartPrimeIndex] = (value
				? this.Flags[StartPrimeIndex] | (-1 >>> StartSubIndex)
				: this.Flags[StartPrimeIndex] & ~(-1 >>> StartSubIndex)
			);

			for (let i=StartPrimeIndex+1; i<EndPrimeIndex; ++i) this.Flags[i] = SetValue;

			this.Flags[EndPrimeIndex] = (value
				? this.Flags[EndPrimeIndex] | ~(-1 >>> EndSubIndex)
				: this.Flags[EndPrimeIndex] & (-1 >>> EndSubIndex)
			);
		}
	}

	public ToggleRange(startIndex: int, endIndex: int): void {
		if (this.Flags.length === 0 || startIndex >= endIndex) return;
		if (endIndex >= this.Flags.length<<5) endIndex = (this.Flags.length<<5)-1;
		if (startIndex < 0) startIndex = 0;
		
		const [StartPrimeIndex, StartSubIndex] = FlagsArray.GetIndices(startIndex);
		const [EndPrimeIndex, EndSubIndex] = FlagsArray.GetIndices(endIndex);

		//Simplification for single chunk ranges.
        if (StartPrimeIndex === EndPrimeIndex) {
            this.Flags[StartPrimeIndex] ^= (-1 << (31-EndSubIndex)) & (-1 >>> StartSubIndex);
        } else {
			this.Flags[StartPrimeIndex] ^= (-1 >>> StartSubIndex);
			for (let i=StartPrimeIndex+1; i<EndPrimeIndex; ++i) this.Flags[i] ^= -1;
			this.Flags[EndPrimeIndex] ^= ~(-1 >>> EndSubIndex);
		}
		
	}

	public ClearRange(startIndex: int, endIndex: int): void {
		if (this.Flags.length === 0 || startIndex >= endIndex) return;
		if (endIndex >= this.Flags.length<<5) endIndex = (this.Flags.length<<5)-1;
		if (startIndex < 0) startIndex = 0;
		
		const [StartPrimeIndex, StartSubIndex] = FlagsArray.GetIndices(startIndex);
		const [EndPrimeIndex, EndSubIndex] = FlagsArray.GetIndices(endIndex);

		
		//Simplification for single chunk ranges.
        if (StartPrimeIndex === EndPrimeIndex) {
            this.Flags[StartPrimeIndex] &= ~((-1 << (31-EndSubIndex)) & (-1 >>> StartSubIndex));
        } else {
			this.Flags[StartPrimeIndex] &= ~(-1 >>> StartSubIndex);
			for (let i=StartPrimeIndex+1; i<EndPrimeIndex; ++i) this.Flags[i] = 0;
			this.Flags[EndPrimeIndex] &= (-1 >>> EndSubIndex);
		}
	}

	public ClearAll(): void {
		if (this.Flags.length === 0) return;
		for (let i=0, f=this.Flags.length; i<f; ++i) this.Flags[i] = 0;
	}

	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


    public ShiftIndexRight(shift: int, index: int, expandOverflow:boolean = true) {
		if (shift <= 0) return;
		if (this.ValidIndex(index) === false) return;

        const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		const [ChunkShift, BitShift, ShiftComplement] = FlagsArray.GetShiftIndices(shift);

        const IsolatorMask = ~(-1 << (32-SubIndex+1));
        const IsolatedBits = (this.Flags[PrimeIndex] & IsolatorMask);
        this.Flags[PrimeIndex] = ~IsolatorMask & this.Flags[PrimeIndex]; // Clears isolated bits.
        //Adds shifted bits back if not shifting more than a line.
        if (ChunkShift === 0) this.Flags[PrimeIndex] |= IsolatedBits >>> BitShift;

        if (expandOverflow) {
            //If shift will result in bits overflowing, expand array.
            const ShiftCausesOverflow =  (BitShift !== 0) && (((this.Flags[this.Flags.length-1] & IsolatorMask) << ShiftComplement) !== 0);
            if (ShiftCausesOverflow || ChunkShift !== 0) this.Expand(this.Flags.length + ChunkShift + +ShiftCausesOverflow); //Grow array
        }

        //If there is a multi-line shift => move everything down first then shift after.
        if (ChunkShift !== 0) {
            //Shift all other lines, setting empty ones to 0.
			this.ShiftChunksRight(this.Flags.length-1, PrimeIndex, ChunkShift);
            //Set first new line as isolated bits.
            this.Flags[PrimeIndex+ChunkShift] = IsolatedBits >>> BitShift;
        }

        //If shift was not a multiple of 32 then we still need to shift each line by relative amount.
        if (BitShift !== 0) {
            let carry = IsolatedBits << ShiftComplement;
            //Shift each line over while keeping track of overflow bits to move to the next line.
            for (let i = (PrimeIndex+ChunkShift)+1, bitsToCarry=0; i <  this.Flags.length; ++i, carry = bitsToCarry) {
                bitsToCarry =  this.Flags[i] << ShiftComplement;
                this.Flags[i] = (this.Flags[i] >>> BitShift) | (carry);
            }
        }
    }



    public ShiftIndexLeft(shift: int, index: int, pruneOverflow: boolean = false) {
		if (shift <= 0) return;
		if (this.ValidIndex(index) === false) return;

        const [PrimeIndex, SubIndex] = FlagsArray.GetIndices(index);
		const [ChunkShift, BitShift, ShiftComplement] = FlagsArray.GetShiftIndices(shift);

        const IsolatorMask = ~(-1 << (32-SubIndex+1));
        const IsolatedBits = (this.Flags[PrimeIndex] & IsolatorMask);
        this.Flags[PrimeIndex] = ~IsolatorMask & this.Flags[PrimeIndex]; // Clears isolated bits.
        //Adds shifted bits back if not shifting more than a line.
        if (ChunkShift === 0) this.Flags[PrimeIndex] |= IsolatedBits << BitShift;

        
        //If shift was not a multiple of 32 then we need to shift each line by relative amount.
        if (BitShift !== 0) {
            let carry = 0;
            //Shift each line over while keeping track of overflow bits to move to the next line.
            for (let i = this.Flags.length-1, bitsToCarry=0; i > PrimeIndex; --i, carry = bitsToCarry) {
                bitsToCarry = this.Flags[i] >>> ShiftComplement;
                this.Flags[i] = (this.Flags[i] << BitShift) | carry;
            }
            //If this is not a multi-line shift, isolate and add the carry to the prime index.
            if (ChunkShift === 0) this.Flags[PrimeIndex] |= IsolatorMask & (carry);
        }


        //If there is a multi-line shift.
        if (ChunkShift !== 0) {
            //Isolate and add the goal line to the prime index.
            this.Flags[PrimeIndex] |= (IsolatorMask & (this.Flags[PrimeIndex+ChunkShift]));
            //Shift all other lines, setting empty ones to 0.
			this.ShiftChunksLeft(PrimeIndex+1, this.Flags.length, ChunkShift);
        }

        if (pruneOverflow) {
			this.Prune();
        }

    }

	/** Warning: This will not modify the size of the array, any bits that exceed the bounds are lost. */
	protected ShiftChunksLeft(start:int, end:int, shift:int) {
		//Iterate all the chunks in reverse of shift direction to keep access to needed indices
		for (let i = start; i < end; ++i) this.Flags[i] = (i+shift < end)? this.Flags[i+shift] : 0;
	}

	/** Warning: This will not modify the size of the array, any bits that exceed the bounds are lost. */
	protected ShiftChunksRight(start:int, end:int, shift:int) {
		//Iterate all the chunks in reverse of shift direction to keep access to needed indices
		for (let i = start; i > end; --i) this.Flags[i] = (i-shift > end)?  this.Flags[i-shift] : 0; //Fill in new bits with 0;
	}
	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	public GetChunk(index: int) { return this.Flags[index]; }



	public static GetPrimeIndex(targetIndex : int) : int { return targetIndex >>> 5; }
	public static GetSubIndex(targetIndex : int) : int { return targetIndex - ((targetIndex >>> 5) << 5); }
	public static GetIndices(targetIndex : int) : [int, int] {
		const PrimeArrayIndex = (targetIndex>>>5); //Divide by 32 (and truncate)
		const SubArrayIndex = targetIndex - (PrimeArrayIndex<<5); //Remove closest multiple of 32. (Basically taking a modulus)
		return [PrimeArrayIndex, SubArrayIndex];
	}

	protected static GetShiftIndices(targetShift: int): [int, int, int] {
        const ChunkShift = targetShift >>> 5; //Divide by 32 (and truncate)
        const BitShift = targetShift - (ChunkShift << 5); //Remove closest multiple of 32. (Basically taking a modulus)
		const ShiftComplement = (32 - BitShift); //Get the index going from the opposite side of the number
		return [ChunkShift, BitShift, ShiftComplement];
	}





    public Prune() {
		let pruneCount : int = 0;
		//Iterate backwards over the array counting the number of chunks with value of zero.
		for (let i = this.Flags.length-1; i >= 0; --i, ++pruneCount) {
			if (this.Flags[i] !== 0) break; //Stop once first non zero is found
		}
		if (pruneCount === 0) return;
		this.Flags = this.Flags.slice(0, this.Flags.length - pruneCount);
    }

    public Expand(size: int) {
		if (this.Flags.length >= size) return;
		//Creates a new array of specified size and fills in previous values from index 0.
        const result = new Uint32Array(size);
        result.set(this.Flags, 0);
        this.Flags = result;
    }

	public Wipe() {
		this.Flags = FlagsArray.Empty;
	}

	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	protected get AsArray() { return [...this.Flags]; }
	protected GetFlag01(primeIndex: int, subIndex: int) { return (((this.Flags[primeIndex] & (1<<(31-subIndex))) !== 0) ? 1:0); }
	protected GetFlagBool(primeIndex: int, subIndex: int) { return ((this.Flags[primeIndex] & (1<<(31-subIndex))) !== 0); }

	protected ForEachBit(func: Action<[BitFlag]>) { for (const Bit of this.EnumerateFlags()) func(Bit); }
	protected ForEachChunk(func: Action<[int]>) { this.Flags.forEach(func); }
	protected FromEachChunk<T>(func: Func<[int],T>) {
		const result = new Array<T>(this.Flags.length);
		for (let i=this.Flags.length-1; i >= 0; --i) result[i] = func(this.Flags[i]);
		return result; 
	}



	public *EnumerateFlags(): Generator<BitFlag> {
		for (let i=0, f=this.Flags.length; i<f; ++i) yield* FlagsArray.ToBits(this.Flags[i]);
	}
	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	protected static *ToBits(number:number): Generator<BitFlag> {
		for (let b=31; b>=0; --b) yield (((number & (1<<b)) !== 0))? 1:0;
	}
}
