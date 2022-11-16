

interface CommentTag {
	tag: string;
	escapedTag: string;
	lowerTag: string;
	decoration: import('vscode').TextEditorDecorationType;
	ranges: Array<import('vscode').Range>;
}


interface Contributions {
	monolineComments: boolean;
	multilineComments: boolean;
	useJSDocStyle: boolean;
	highlightPlainText: boolean;
	allowNestedHighlighting: boolean;
	tags: Array<TagDefinition>;
}


interface TagDefinition {
	tag: string;
	aliases: Array<string>;
	color: string;
	overline: boolean;
	strikethrough: boolean;
	underline: boolean;
	bold: boolean;
	italic: boolean;
	backgroundColor: string;
}


/** A union of given const enum values. **/
type Flags<T extends number> = number;
/** A union of given const enum values. **/
type OrMask<T extends number> = number;



type Func<TArgs extends any[], TResult> = (...args: TArgs) => TResult; 
// Syntax sugar
type Action<TArgs extends any[]> = Func<TArgs, undefined>; 
type Callable<T> = () => T;


type nulldefined = null|undefined;

type Nullable<T> = T | null;


//  /** The 'package.json' file of an app. */
// interface AppPackageJSON {
// 	/** Information about the author. */
// 	author?: {
// 		 /** The email address. */
// 		email?: string;
// 		 /** The name. */
// 		name?: string;
// 		 /** The (homepage) URL. */
// 		url?: string;
// 	};
// 	 /** A list of one or more dependencies. */
// 	dependencies?: { [module: string]: string };
// 	 /** A list of one or more dev dependencies. */
// 	devDependencies?: { [module: string]: string };
// 	 /** The description. */
// 	description?: string;
// 	 /** The display name. */
// 	displayName?: string;
// 	 /** The software license (ID). */
// 	license?: string;
// 	 /** The (internal) name. */
// 	name?: string;
// 	 /** Options for the script. */
// 	options?: { [key: string]: any };
// 	 /** The version number. */
// 	version?: string;
// 	 /** Use Vuetify instead of Bootstrap or not. */
// 	vue?: boolean;
// }


// (/\*\*)\n.+\*(.*)\n.*( \*/)
// $1$2$3




type bool = boolean;
type int = number;
type float = number;








































type Bit = 0|1|true|false;














// // -------------------------------------------------------------------------
// //       _______ _____       ___        _     _ _   
// //      |__   __/ ____|     / _ \      | |   (_) |  
// //         | | | (___ _____| (_) |_____| |__  _| |_ 
// //         | |  \___ \______> _ <______| '_ \| | __|
// //         | |  ____) |    | (_) |     | |_) | | |_ 
// //         |_| |_____/      \___/      |_.__/|_|\__|
// //                                             
// //    Using the TypeScript type system for 8-bit arithmetic
// //
// //                    sinclair 2020 | MIT                                         
// //                                        
// // -------------------------------------------------------------------------

// // -------------------------------------------------------------------------
// // Bit
// // -------------------------------------------------------------------------


// type Bit = 0|1;
// // let bit: Bit;
// type BitZero = 0;
// type BitOne = 1;


// // -------------------------------------------------------------------------
// // Gates
// // -------------------------------------------------------------------------


// type BitFlip<T extends Bit> = T extends 0 ? 1 : 0;

// type BitNot<T extends Bit> = T extends 0 ? 1 : 0;
// type BitAnd<A extends Bit, B extends Bit> = [A, B] extends [1, 1] ? 1 : 0;
// type BitNand<A extends Bit, B extends Bit> = [A, B] extends [1, 1] ? 0 : 1;

// type BitOr<A extends Bit, B extends Bit> = [A, B] extends [0, 0] ? 0 : 1;
// type BitNor<A extends Bit, B extends Bit> = [A, B] extends [0, 0] ? 1 : 0;

// type BitXor<A extends Bit, B extends Bit> = [A, B] extends [0, 1] | [1, 0] ? 1 : 0;
// type BitXnor<A extends Bit, B extends Bit> = [A, B] extends [0, 0] | [1, 1] ? 1 : 0;


// // -------------------------------------------------------------------------
// // Iterator
// // -------------------------------------------------------------------------

// // type Index = keyof Iterator;
// // type Prev<T extends keyof Iterator> = Iterator[T][0];
// // type Next<T extends keyof Iterator> = Iterator[T][1];
// // type Iterator = {
// //     0: [7, 1],
// //     1: [0, 2],
// //     2: [1, 3],
// //     3: [2, 4],
// //     4: [3, 5],
// //     5: [4, 6],
// //     6: [5, 7],
// //     7: [6, 0],
// // };






// // Output: [Xor, Carry]
// type BitAdd<A extends Bit, B extends Bit> = [BitXor<A, B>, BitAnd<A, B>];
// // Output: [Diff, Borrow]
// type BitSubtract<A extends Bit, B extends Bit> =
//     [A, B] extends [0, 0] | [1, 1] ? [0, 0] :
//     [A, B] extends [1, 0] ? [1, 0] : 
//     [A, B] extends [0, 1] ? [1, 1] :
//     [Bit, Bit]
// ;






// type BitAdder<
//     C_IN extends Bit,
//     A extends Bit,
//     B extends Bit,
//     AB_XOR extends BitXor<A, B> = BitXor<A, B> // Precompute A XOR B
// > = [
//     BitXor<C_IN, AB_XOR>, // Result
//     BitOr<BitAnd<C_IN, AB_XOR>, BitAnd<A, B>> // Overflow
// ];













// type Nibble<
// 	B0 extends Bit = Bit, 
// 	B1 extends Bit = Bit, 
// 	B2 extends Bit = Bit, 
// 	B3 extends Bit = Bit
// > = [B0, B1, B2, B3];


// type NibbleBit3Adder<C_IN extends Bit, A extends Nibble, B extends Nibble
// > = BitAdder<C_IN, A[3], B[3]>;
// type NibbleBit2Adder<C_IN extends Bit, A extends Nibble, B extends Nibble, 
// 	B3_ADDER extends NibbleBit3Adder<C_IN, A, B>
// > = BitAdder<B3_ADDER[1], A[2], B[2]>;
// type NibbleBit1Adder<C_IN extends Bit, A extends Nibble, B extends Nibble, 
// 	B3_ADDER extends NibbleBit3Adder<C_IN, A, B>, 
// 	B2_ADDER extends NibbleBit2Adder<C_IN, A, B, B3_ADDER>
// > = BitAdder<B2_ADDER[1], A[1], B[1]>;
// type NibbleBit0Adder<C_IN extends Bit, A extends Nibble, B extends Nibble,
//     B3_ADDER extends NibbleBit3Adder<C_IN, A, B>,
//     B2_ADDER extends NibbleBit2Adder<C_IN, A, B, B3_ADDER>,
//     B1_ADDER extends NibbleBit1Adder<C_IN, A, B, B3_ADDER, B2_ADDER>
// > = BitAdder<B1_ADDER[1], A[0], B[0]>; //B1_ADDER is Overflow
// type NibbleAdder<C_IN extends Bit, A extends Nibble, B extends Nibble,
//     B3_ADDER extends NibbleBit3Adder<C_IN, A, B> = NibbleBit3Adder<C_IN, A, B>,
//     B2_ADDER extends NibbleBit2Adder<C_IN, A, B, B3_ADDER> = NibbleBit2Adder<C_IN, A, B, B3_ADDER>,
//     B1_ADDER extends NibbleBit1Adder<C_IN, A, B, B3_ADDER, B2_ADDER> = NibbleBit1Adder<C_IN, A, B, B3_ADDER, B2_ADDER>,
//     B0_ADDER extends NibbleBit0Adder<C_IN, A, B, B3_ADDER, B2_ADDER, B1_ADDER> = NibbleBit0Adder<C_IN, A, B, B3_ADDER, B2_ADDER, B1_ADDER>
// > = [
//     Nibble<B0_ADDER[0], B1_ADDER[0], B2_ADDER[0], B3_ADDER[0]>,
//     B0_ADDER[1] // Overflow
// ];








// type Byte<
//     B0 extends Bit = Bit,
//     B1 extends Bit = Bit,
//     B2 extends Bit = Bit,
//     B3 extends Bit = Bit,
//     B4 extends Bit = Bit,
//     B5 extends Bit = Bit,
//     B6 extends Bit = Bit,
//     B7 extends Bit = Bit
// > = [B0, B1, B2, B3, B4, B5, B6, B7];

// type NibbleFromUpperByte<B extends Byte> = Nibble<B[0], B[1], B[2], B[3]>;
// type NibbleFromLowerByte<B extends Byte> = Nibble<B[4], B[5], B[6], B[7]>;

// type ByteNibbleAdder1<C_IN extends Bit, A extends Byte, B extends Byte
// > = NibbleAdder<C_IN, NibbleFromLowerByte<A>, NibbleFromLowerByte<B>>;
// type ByteNibbleAdder0<C_IN extends Bit, A extends Byte, B extends Byte, 
// 	N1_ADDER extends ByteNibbleAdder1<C_IN, A, B>
// > = NibbleAdder<N1_ADDER[1], NibbleFromUpperByte<A>, NibbleFromUpperByte<B>>;

// // [ Byte, Carry ]
// type ByteAdder<C_IN extends Bit, A extends Byte, B extends Byte,
//     N1_ADDER extends ByteNibbleAdder1<C_IN, A, B> = ByteNibbleAdder1<C_IN, A, B>,
//     N0_ADDER extends ByteNibbleAdder0<C_IN, A, B, N1_ADDER> = ByteNibbleAdder0<C_IN, A, B, N1_ADDER>
// > = [
//     [N0_ADDER[0][0], N0_ADDER[0][1], N0_ADDER[0][2], N0_ADDER[0][3], N1_ADDER[0][0], N1_ADDER[0][1], N1_ADDER[0][2], N1_ADDER[0][3]],
//     N0_ADDER[1]
// ];






// type Int8 = [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit];

// type Zero = ZeroOut<Int8>;
// type One = ReplaceBits<Zero, [1]>;
// type Two = ReplaceBits<Zero, [0, 1]>;
// type Three = ReplaceBits<Zero, [1, 1]>;
// type Four = ReplaceBits<Zero, [0, 0, 1]>;
// type Five = ReplaceBits<Zero, [1, 0, 1]>;
// type Six = ReplaceBits<Zero, [0, 1, 1]>;
// type Seven = ReplaceBits<Zero, [1, 1, 1]>;
// type Eight = ReplaceBits<Zero, [0, 0, 0, 1]>;
// type Nine = ReplaceBits<Zero, [1, 0, 0, 1]>;
// type Ten = ReplaceBits<Zero, [0, 1, 0, 1]>;

// // [Sum, Carry]
// type BitAddThree<A extends Bit  = Bit, B extends Bit = Bit, C extends Bit = Bit> =
//     [A, B, C] extends [0, 0, 0] ? [0, 0] :
//     [A, B, C] extends [1, 0, 0] | [0, 1, 0] | [0, 0, 1] ? [1, 0] :
//     [A, B, C] extends [1, 1, 0] | [1, 0, 1] | [0, 1, 1] ? [0, 1] :
//     [A, B, C] extends [1, 1, 1] ? [1, 1] :
//     [Bit, Bit, Bit]
// ;

// // [Borrow, Top, Bottom]: as in, -Borrow + (Top - Bottom)
// // [Diff, Borrow]
// type BitSubtractThree<A extends Bit = 0, B extends Bit = 0, C extends Bit = 0> =
// 	[A, B, C] extends [0, 0, 0] ? [0, 0] :
// 	[A, B, C] extends [1, 0, 0] ? [1, 1] : // ???
// 	[A, B, C] extends [0, 1, 0] ? [1, 0] :
// 	[A, B, C] extends [0, 0, 1] ? [1, 1] : // ???
// 	[A, B, C] extends [1, 1, 0] ? [0, 0] :
// 	[A, B, C] extends [1, 0, 1] ? [0, 1] : // ???
// 	[A, B, C] extends [0, 1, 1] ? [0, 0] :
// 	[A, B, C] extends [1, 1, 1] ? [1, 1] : // ???
// 	[Bit, Bit]
// ;

// type Int8Add<A extends Int8, B extends Int8,
//     // Grab the Sum and Carry for the result's first bit
//     At0 extends BitAdd<A[0], B[0]> = BitAdd<A[0], B[0]>,
//     // The result at each index is the Sum from that index + the previous Carry.
//     At1 extends BitAddThree<A[1], B[1], At0[1]> = BitAddThree< A[1], B[1], At0[1] >,
//     At2 extends BitAddThree<A[2], B[2], At1[1]> = BitAddThree< A[2], B[2], At1[1] >,
//     At3 extends BitAddThree<A[3], B[3], At2[1]> = BitAddThree< A[3], B[3], At2[1] >,
//     At4 extends BitAddThree<A[4], B[4], At3[1]> = BitAddThree< A[4], B[4], At3[1] >,
//     At5 extends BitAddThree<A[5], B[5], At4[1]> = BitAddThree< A[5], B[5], At4[1] >,
//     At6 extends BitAddThree<A[6], B[6], At5[1]> = BitAddThree< A[6], B[6], At5[1] >,
//     At7 extends BitAddThree<A[7], B[7], At6[1]> = BitAddThree< A[7], B[7], At6[1] >
// > = [At0[0], At1[0], At2[0], At3[0], At4[0], At5[0], At6[0], At7[0]];

// type AddInt8<A extends Int8, B extends Int8,
//     BitsAdded extends BitAdds<A, B> = BitAdds<A, B>,
//     And0 extends BitsAdded[0] = BitsAdded[0],
//     // The result at each index is the Sum from that index + the previous Carry.
//     And1 extends BitAddThree<A[1], B[1], And0[1]> = BitAddThree<A[1], B[1], And0[1]>,
//     And2 extends BitAddThree<A[2], B[2], And1[1]> = BitAddThree<A[2], B[2], And1[1]>,
//     And3 extends BitAddThree<A[3], B[3], And2[1]> = BitAddThree<A[3], B[3], And2[1]>,
//     And4 extends BitAddThree<A[4], B[4], And3[1]> = BitAddThree<A[4], B[4], And3[1]>,
//     And5 extends BitAddThree<A[5], B[5], And4[1]> = BitAddThree<A[5], B[5], And4[1]>,
//     And6 extends BitAddThree<A[6], B[6], And5[1]> = BitAddThree<A[6], B[6], And5[1]>,
//     And7 extends BitAddThree<A[7], B[7], And6[1]> = BitAddThree<A[7], B[7], And6[1]>,
// > = ReplaceBits<Zero, [And0[0], And1[0], And2[0], And3[0], And4[0], And5[0], And6[0], And7[0]]>;

// type SubtractInt8<A extends Int8, B extends Int8,
//     BitsSubtracted extends BitSubtracts<A, B> = BitSubtracts<A, B>,
//     Sub0 extends BitsSubtracted[0] = BitsSubtracted[0],
//     Sub1 extends BitSubtractThree<Sub0[1], A[1], B[1]> = BitSubtractThree<Sub0[1], A[1], B[1]>,
//     Sub2 extends BitSubtractThree<Sub1[1], A[2], B[2]> = BitSubtractThree<Sub1[1], A[2], B[2]>,
//     Sub3 extends BitSubtractThree<Sub2[1], A[3], B[3]> = BitSubtractThree<Sub2[1], A[3], B[3]>,
//     Sub4 extends BitSubtractThree<Sub3[1], A[4], B[4]> = BitSubtractThree<Sub3[1], A[4], B[4]>,
//     Sub5 extends BitSubtractThree<Sub4[1], A[5], B[5]> = BitSubtractThree<Sub4[1], A[5], B[5]>,
//     Sub6 extends BitSubtractThree<Sub5[1], A[6], B[6]> = BitSubtractThree<Sub5[1], A[6], B[6]>,
//     Sub7 extends BitSubtractThree<Sub6[1], A[7], B[7]> = BitSubtractThree<Sub6[1], A[7], B[7]>,
// > = ReplaceBits<Zero, [Sub0[0], Sub1[0], Sub2[0], Sub3[0], Sub4[0], Sub5[0], Sub6[0], Sub7[0]]>;

// //Helpers..............................................................................
// type ZeroOut<Ints extends Bit[]> = {
//     [Index in keyof Ints]: 0;
// };

// type ReplaceBits<Bits extends Bit[], Replacements extends Bit[]> = {
//     [Index in keyof Bits]: Index extends keyof Replacements
//         ? Replacements[Index]
//         : Bits[Index];
// };

// // Output: [[Sum, Carry], [Sum, Carry], [Sum, Carry], ...]
// type BitAdds<A extends Int8, B extends Int8> = {
//     [P in 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7]: BitAdd<A[P], B[P]>;
// };

// type BitSubtracts<A extends Int8, B extends Int8> = Int8 & {
//     [P in 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7]: BitSubtract<A[P], B[P]>;
// };
