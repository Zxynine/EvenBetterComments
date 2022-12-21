import * as vscode from 'vscode';






//In a software context there is a distinction between an update and an upgrade: updates usually include important security patches or bug fixes; 
//an upgrade implies substantial new features and often has to be bought separately (in case of commercial software).
//This is why I chose to call it a Downdate rather than a Downgrade. They are not upgrades, only updates.
export const enum VersionComparison {
	NoChange,
	MajorUpdate,
	MinorUpdate,
	PatchUpdate,
	MajorDowndate,
	MinorDowndate,
	PatchDowndate,
	InvalidVersion
}



// https://stackoverflow.com/a/66303259/3073272
export type Version = [Major:int, Minor:int, Patch:int];
export namespace Version {
	export function GetCurrent(context: vscode.ExtensionContext):string {
		return context.extension.packageJSON.version;
	}

	export function GetSaved(context: vscode.ExtensionContext):string|undefined {
		return context.globalState.get<string>(context.extension.id+"-Version");
	}

	export function SaveCurrent(context: vscode.ExtensionContext):void {
		const Current = context.extension.packageJSON.version;
		context.globalState.update(context.extension.id+"-Version", Current);
	}

	export function Parse(version: string): Version {
		//returns int array [1,1,1] i.e. [major,minor,patch]
		const [Major = 0, Minor = 0, Patch = 0] = version.split(".").map(Number.parseInt);
		return [Major, Minor, Patch];
	}

		

	// https://stackoverflow.com/a/66303259/3073272
	export function isMajorUpdate(previousVersion: string, currentVersion: string) {
		// rain-check for malformed string
		if (previousVersion.indexOf(".") === -1) return true;
		const previousVerArr = previousVersion.split(".").map(Number.parseInt);
		const currentVerArr = currentVersion.split(".").map(Number.parseInt);
		return currentVerArr[0] > previousVerArr[0];
	}

	export function Compare(compareFrom: string, compareTo: string) {
		// rain-check for malformed string
		if (compareFrom.indexOf(".") === -1) return VersionComparison.InvalidVersion;
		if (compareTo.indexOf(".") === -1) return VersionComparison.InvalidVersion;

		const FromVerArr = Version.Parse(compareFrom);
		const ToVerArr = Version.Parse(compareTo);
		try {
			if (FromVerArr[0] > ToVerArr[0]) return VersionComparison.MajorUpdate;
			if (FromVerArr[0] < ToVerArr[0]) return VersionComparison.MajorDowndate;
			
			if (FromVerArr[1] > ToVerArr[1]) return VersionComparison.MinorUpdate;
			if (FromVerArr[1] < ToVerArr[1]) return VersionComparison.MinorDowndate;
			
			if (FromVerArr[2] > ToVerArr[2]) return VersionComparison.PatchUpdate;
			if (FromVerArr[2] < ToVerArr[2]) return VersionComparison.PatchDowndate;

			return VersionComparison.NoChange;
		} catch { return VersionComparison.InvalidVersion; }
	}
}


//https://github.com/gitkraken/vscode-gitlens/blob/main/src/system/version.ts

// export interface Version {
// 	major: number;
// 	minor: number;
// 	patch: number;
// 	pre?: string;
// }


// export function from(major: string | number, minor: string | number, patch?: string | number, pre?: string): Version {
// 	return {
// 		Major: typeof major === 'string' ? parseInt(major, 10) : major,
// 		Minor: typeof minor === 'string' ? parseInt(minor, 10) : minor,
// 		Patch: patch == null ? 0 : typeof patch === 'string' ? parseInt(patch, 10) : patch,
// 		pre: pre,
// 	};
// }

// export function fromString(version: string): Version {
// 	const [ver, pre] = version.split('-');
// 	const [major, minor, patch] = ver.split('.');
// 	return from(major, minor, patch, pre);
// }









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










// /**
//  * Gets the version of Git Graph.
//  * @param extensionContext The extension context of Git Graph.
//  * @returns The Git Graph version.
//  */
// export function getExtensionVersion(extensionContext: vscode.ExtensionContext) {
// 	return new Promise<string>((resolve, reject) => {
// 		fs.readFile(path.join(extensionContext.extensionPath, 'package.json'), (err, data) => {
// 			if (err) {
// 				reject();
// 			} else {
// 				try {
// 					resolve(JSON.parse(data.toString()).version);
// 				} catch (_) {
// 					reject();
// 				}
// 			}
// 		});
// 	});
// }