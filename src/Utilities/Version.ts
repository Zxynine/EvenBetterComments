// import * as fs from 'fs';










// const v = process.env.npm_package_version;
// const CHANGELOG = "CHANGELOG.md";

// fs.readFile(CHANGELOG, (error, data) => {
// 	const stringData = data.toString("utf8");
// 	const updated = stringData.replace(
// 		/## \[Unreleased\](?!\s*## )/, // None empty Unreleased block
// 		`## [Unreleased]\n\n## [${v}]`
// 	);

// 	if (updated !== stringData) {
// 		console.log(`CHANGELOG: [Unreleased] updated with [${v}]`);
// 	}
// 	fs.writeFile(CHANGELOG, updated, (err) => {
// 		if (err) {
// 			console.error(err);
// 			process.exit(1);
// 		}
// 	});
// });













// export class Version {
// 	constructor(public readonly major: number, public readonly minor: number, public readonly patch: number) {}
  
// 	static fromString(str: string): Version | undefined {
// 	  let matches = str.match(/(\d+)\.(\d+)\.(\d+)/i);
// 	  if (matches && matches.length == 4) {
// 		return new Version(parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]));
// 	  }
// 	  return undefined;
// 	}
  
// 	public toString(): string {
// 	  return `${this.major}.${this.minor}.${this.patch}`;
// 	}
  
// 	public greaterThan(other: Version): boolean {
// 	  if (this.major > other.major) {
// 		return true;
// 	  } else if (this.major == other.major) {
// 		if (this.minor > other.minor) {
// 		  return true;
// 		} else if (this.minor == other.minor) {
// 		  return this.patch > other.patch;
// 		}
// 	  }
// 	  return false;
// 	}
  
// 	public equal(other: Version): boolean {
// 	  return this.major == other.major && this.minor == other.minor && this.patch == other.patch;
// 	}
  
// 	public lessThan(other: Version): boolean {
// 	  return !this.equal(other) && !this.greaterThan(other);
// 	}
  
// 	public greaterOrEqual(other: Version): boolean {
// 	  return this.equal(other) || this.greaterThan(other);
// 	}
  
// 	public lessOrEqual(other: Version): boolean {
// 	  return this.equal(other) || this.lessThan(other);
// 	}
//   }