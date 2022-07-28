// import { Position } from 'vscode';
// import Token from './tokenisation';




// export interface IBracketManager {
// 	getPreviousIndex(type: number): number;
// 	addOpenBracket(token: Token, color: number): void;
// 	GetAmountOfOpenBrackets(type: number): number;
// 	addCloseBracket(token: Token): void;
// 	getClosingBracket(position: Position): BracketClose | undefined;
// 	copyCumulativeState(): IBracketManager;
// 	getHash(): string;
// 	offset(startIndex: number, amount: number): void;
// 	getAllBrackets(): Bracket[];
// }


// export class Bracket {
// 	public readonly token: Token;
// 	public readonly color: string;
// 	constructor(token: Token, color: string) {
// 		this.token = token;
// 		this.color = color;
// 	}
// }
// export class BracketClose extends Bracket {
// 	public readonly openBracket: Bracket;
// 	constructor(token: Token, openBracket: Bracket) {
// 		super(token, openBracket.color);
// 		this.openBracket = openBracket;
// 	}
// }

// interface ISimpleInternalBracket {
// 	open: string;
// 	close: string;
// }

// export function getRegexForBrackets(input: ISimpleInternalBracket[]): RegExp {
// 	const longestFirst = input.sort((a, b) => (b.open.length+b.close.length) - (a.open.length+a.close.length));
// 	const pieces: string[] = [];
// 	longestFirst.forEach((b) => {
// 		pieces.push(b.open);
// 		pieces.push(b.close);
// 	});
// 	return createBracketOrRegExp(pieces);
// }

// function createBracketOrRegExp(pieces: string[]): RegExp {
// 	const regexStr = `(${pieces.map(prepareBracketForRegExp).join(")|(")})`;
// 	return createRegExp(regexStr, true, { global: true });
// }

// function prepareBracketForRegExp(str: string): string {
// 	// This bracket pair uses letters like e.g. "begin" - "end"
// 	const insertWordBoundaries = (/^[\w]+$/.test(str));
// 	str = escapeRegExpCharacters(str);
// 	return (insertWordBoundaries ? `\\b${str}\\b` : str);
// }

// function escapeRegExpCharacters(value: string): string {
// 	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, "\\$&");
// }

// function createRegExp(searchString: string, isRegex: boolean, options: RegExpOptions = {}): RegExp {
// 	if (!searchString) throw new Error("Cannot create regex from empty string");
// 	if (!isRegex) searchString = escapeRegExpCharacters(searchString);
// 	if (options.wholeWord) {
// 		if (!/\B/.test(searchString.charAt(0))) {
// 			searchString = "\\b" + searchString;
// 		}
// 		if (!/\B/.test(searchString.charAt(searchString.length-1))) {
// 			searchString = searchString + "\\b";
// 		}
// 	}
// 	let modifiers = "";
// 	if (options.global) modifiers += "g";
// 	if (!options.matchCase) modifiers += "i";
// 	if (options.multiline) modifiers += "m";

// 	return new RegExp(searchString, modifiers);
// }

// export interface RegExpOptions {
// 	matchCase?: boolean;
// 	wholeWord?: boolean;
// 	multiline?: boolean;
// 	global?: boolean;
// }











// export interface IPair {
// 	open: string;
// 	close: string;
// 	parse?: boolean;
// 	style?: object;
//   }
  
//   export interface IPairs {
// 	[key: string]: IPair;
//   }
  
//   export interface IBrackets {
// 	[key: string]: Bracket;
//   }
  
//   export interface IOptions {
// 	brackets: IBrackets;
// 	regexp: RegExp;
// 	parse: boolean;
//   }
  
//   export interface IPrismMatch {
// 	str: string;
// 	type: string;
//   }
  
//   export interface IMatch {
// 	str: string;
// 	index: number;
//   }
  
//   export interface ILineMatch extends IMatch {
// 	line: number;
//   }
  
//   export interface IPairMatch {
// 	start: ILineMatch;
// 	end?: ILineMatch;
//   }




// // export default class MultipleBracketGroups implements IBracketManager {
// //     private allLinesOpenBracketStack: Bracket[][] = [];
// //     private allBracketsOnLine: Bracket[] = [];
// //     private bracketsHash = "";
// //     private previousOpenBracketColorIndexes: number[] = [];
// //     private readonly settings: Settings;
// //     private readonly languageConfig: LanguageConfig;

// //     constructor(
// //         settings: Settings,
// //         languageConfig: LanguageConfig,
// //         previousState?: {
// //             currentOpenBracketColorIndexes: Bracket[][],
// //             previousOpenBracketColorIndexes: number[],
// //         }) {
// //         this.settings = settings;
// //         this.languageConfig = languageConfig;
// //         if (previousState !== undefined) {
// //             this.allLinesOpenBracketStack = previousState.currentOpenBracketColorIndexes;
// //             this.previousOpenBracketColorIndexes = previousState.previousOpenBracketColorIndexes;
// //         }
// //         else {
// //             for (const value of languageConfig.bracketToId.values()) {
// //                 this.allLinesOpenBracketStack[value.key] = [];
// //                 this.previousOpenBracketColorIndexes[value.key] = 0;
// //             }
// //         }
// //     }

// //     public getPreviousIndex(type: number): number {
// //         return this.previousOpenBracketColorIndexes[type];
// //     }

// //     public addOpenBracket(token: Token, colorIndex: number) {
// //         const openBracket = new Bracket(token, this.settings.colors[colorIndex]);
// //         this.allBracketsOnLine.push(openBracket);
// //         this.bracketsHash += openBracket.token.character;

// //         this.allLinesOpenBracketStack[token.type].push(openBracket);
// //         this.previousOpenBracketColorIndexes[token.type] = colorIndex;
// //     }

// //     public GetAmountOfOpenBrackets(type: number): number {
// //         return this.allLinesOpenBracketStack[type].length;
// //     }

// //     public addCloseBracket(token: Token): number | undefined {
// //         const openStack = this.allLinesOpenBracketStack[token.type];

// //         if (openStack.length > 0) {
// //             if (openStack[openStack.length - 1].token.type === token.type) {
// //                 const openBracket = openStack.pop();
// //                 const closeBracket = new BracketClose(token, openBracket!);
// //                 this.allBracketsOnLine.push(closeBracket);
// //                 this.bracketsHash += closeBracket.token.character;
// //                 return;
// //             }
// //         }

// //         const orphan = new Bracket(token, this.settings.unmatchedScopeColor);
// //         this.allBracketsOnLine.push(orphan);
// //         this.bracketsHash += orphan.token.character;
// //     }

// //     public getClosingBracket(position: Position): BracketClose | undefined {
// //         for (const bracket of this.allBracketsOnLine) {
// //             if (!(bracket instanceof BracketClose)) {
// //                 continue;
// //             }

// //             const closeBracket = bracket as BracketClose;
// //             const openBracket = closeBracket.openBracket;
// //             const range =
// //                 new Range(openBracket.token.range.start.translate(0, 1), closeBracket.token.range.end.translate(0, -1));

// //             if (range.contains(position)) {
// //                 return closeBracket;
// //             }
// //         }
// //     }

// //     public getAllBrackets(): Bracket[] {
// //         return this.allBracketsOnLine;
// //     }

// //     public getHash() {
// //         return this.bracketsHash;
// //     }

// //     public offset(startIndex: number, amount: number) {
// //         for (const bracket of this.allBracketsOnLine) {
// //             if (bracket.token.range.start.character >= startIndex) {
// //                 bracket.token.offset(amount);
// //             }
// //         }
// //     }

// //     public copyCumulativeState(): IBracketManager {
// //         const clone: Bracket[][] = [];

// //         for (const value of this.allLinesOpenBracketStack) {
// //             clone.push(value.slice());
// //         }

// //         return new MultipleBracketGroups(
// //             this.settings,
// //             this.languageConfig,
// //             {
// //                 currentOpenBracketColorIndexes: clone,
// //                 previousOpenBracketColorIndexes: this.previousOpenBracketColorIndexes.slice(),
// //             });
// //     }
// // }