// import { randomUUID } from "crypto";
import { Disposable as IDisposable } from 'vscode';
import * as vscode from "vscode";
import * as fs from "fs";



export abstract class Disposable implements IDisposable {
	private store = new Set<IDisposable>();

	protected _register<T extends IDisposable>(disposable: T): T {
		this.store.add(disposable);
		return disposable;
	}

	public dispose(): void {
		this.store.forEach(disposable => disposable.dispose());
		this.store.clear();
	}
}




export interface KeyValPair<K,V> {Key:K, Val:V}




export class HashSet<T> {
	private dict : Map<T,bool>;
	public constructor(...Initial: Array<T>) {
		this.dict = new Map<T,bool>();
		for(const item of Initial) this.dict.set(item, true);
	}
	
	public get length() { return this.dict.size; }

	public add(val : T) { this.dict.set(val, true); }
	public remove(val : T) { return this.dict.delete(val); }
	public has(val : T) { return Boolean(this.dict.get(val)); }

	public addRange(...range: Array<T>) {
		for(const item of range) this.dict.set(item, true);
	}

	public removeRange(...range: Array<T>) {
		for(const item of range) this.dict.delete(item);
	}

	public getValues() { return this.dict.keys(); }

	public clear() { return this.dict.clear(); }
}












type ActionQueueItem = (cb: () => void) => unknown
export class ActionQueue {

	private _running = false;

	private _queue: Array<ActionQueueItem> = [];
	/**
	 * Add a action inside the queue.
	 * The action should take a callback as first parameter and call it
	 * when his work is done in order to start the next action
	 *
	 * @param {Function} f
	 * @returns
	 * @memberOf Queue
	 */
	public push(f: ActionQueueItem): ActionQueue {
		this._queue.push(f);
		if (!this._running) this._next();
		return this; // for chaining fun!
	}

	private _next() {
		this._running = false;
		const action = this._queue.shift();
		if (action) {
			this._running = true;
			try { action(this._next.bind(this)); } 
			catch { this._next.call(this); }
		}
	}
}





export class TasksRunner<T> {
	private _currentTask: IterableIterator<T>|null = null;
	
	/**
	 * Add a task to run.
	 * Pushing a new task will cancel the execution of the previous
	 *
	 * @param {Generator} IterableIterator<any>
	 * @returns
	 * @memberOf TasksRunner
	 */
	run(f: () => IterableIterator<T>): TasksRunner<T> {
		this._currentTask?.return?.();
		this._currentTask = f();
		this._run();
		return this; // for chaining fun!
	}
	/**
	 * Cancel the currently running task
	 */
	stop(): void {
		this._currentTask?.return?.();
	}
	
	_run(): void {
		const it: IterableIterator<T> = this._currentTask!;
		function run(args?: any):any {
			try {
				const result: IteratorResult<T> = it.next(args); // deal with errors in generators
				return (result.done)? result.value : Promise.resolve(result.value).then(run);
			} catch (error) {} // do something
		}
		run();
	}
}















//https://github.com/AbmSourav/dataStructure/tree/main/linkedList
//https://github.com/loiane/javascript-datastructures-algorithms/blob/main/src/ts/data-structures/linked-list.ts
//https://github.com/basarat/typescript-collections/blob/release/src/lib/LinkedList.ts

// export type AnyKey = keyof any;
// // data type
// export type DataType<T> = { key: AnyKey, value: T }



// // singly linked list interface
// export interface ILinkedList {
// 	readonly Count: number;
// 	// prepend(data: DataType<any>): boolean;
// 	// append(data: DataType<any>): boolean;
// 	// add(data: DataType<any>, position: number): boolean;
// 	// getFromHead(): object|false;
// 	// getFromTail(): object|false;
// 	// log(): void;
// 	// remove(key: AnyKey): object|boolean;
// 	// update(key: AnyKey, newValue: any): object|boolean;
// 	// search(key: AnyKey): object|boolean
// 	// iterator(): Generator
// 	// clear(): void;
// }




// export type LinkedNode<T> = {
// 	data: T
// 	next: undefined|LinkedNode<T>
// }
// export type DoublyLinkedNode<T> = {
// 	data: T
// 	next: undefined|DoublyLinkedNode<T>
// 	prev: undefined|DoublyLinkedNode<T>
// }



// export class LinkedList<T> implements ILinkedList {
// 	protected count: int = 0;
// 	protected head: LinkedNode<T>|undefined;
// 	protected tail: LinkedNode<T>|undefined;

// 	public EqualityComparer: IEqualityComparer<T> = (LHS,RHS) => LHS === RHS;
	
// 	/** Time Complexity: O(1) */
// 	public get Count() { return this.count; }
// 	/** Time Complexity: O(1) */
// 	public get IsEmpty() { return this.count === 0; }
	

// 	/** Time Complexity: O(1) */
// 	public PeekHead(): T|undefined;
// 	public PeekHead(defaultValue?: T): T|undefined { return this.head?.data ?? defaultValue; }

// 	/** Time Complexity: O(1) */
// 	public PeekTail(): T|undefined;
// 	public PeekTail(defaultValue?:T): T|undefined { return this.tail?.data ?? defaultValue; }


// 	/** Time Complexity: O(1) */
// 	public AddHead(value: T) {
// 		const Node = <LinkedNode<T>>{ data: value, next: undefined };
// 		Node.next = this.head;
// 		this.head = Node;
// 		if (this.IsEmpty) this.tail = Node;
// 		this.count++;
// 	}

// 	/** Time Complexity: O(1) */
// 	public AddTail(value: T) {
// 		const Node = <LinkedNode<T>>{ data: value, next: undefined };
// 		if (this.tail !== undefined) this.tail.next = Node;
// 		this.tail = Node;
// 		if (this.IsEmpty) this.head = Node;
// 		this.count++;
// 	}

// 	/** Time Complexity: O(n) */
// 	public Add(value:T, index:int) {
// 		const IndexNode = this.GetNodeAtIndex(index);
// 		if (IndexNode === undefined) return;
// 		const NewNode = <LinkedNode<T>>{ data: IndexNode.data, next: IndexNode.next };
// 		IndexNode.data = value;
// 		IndexNode.next = NewNode;
// 		this.count++;
// 	}



// 	/** Time Complexity: O(n) */
// 	public GetAtIndex(index:int, defaultValue?:T): T|undefined {
// 		if (index < 0 || this.count >= index) return defaultValue;
// 		let current:LinkedNode<T>|undefined = this.head;
// 		for (let currentIndex = 0; currentIndex<index && current!==undefined; ++currentIndex, current = current.next);
// 		return current?.data ?? defaultValue;
// 	}

// 	/** Time Complexity: O(n) */
// 	public IndexOf(value: T): number|-1 {
// 		let index = 0;
// 		for (let current = this.head; current!==undefined; current = current.next, ++index) 
// 			if (this.EqualityComparer(current.data, value)) return index;
// 		return -1;
// 	}


// 	/** Time Complexity: O(n) */
// 	public Contains(value:T) : bool {
// 		for (let current = this.head; current!==undefined; current = current.next) 
// 			if (this.EqualityComparer(current.data, value)) return true;
// 		return false;
// 	}

// 	/** Time Complexity: O(1) */
// 	public Clear() {
// 		this.head = undefined;
// 		this.tail = undefined;
// 		this.count = 0;
// 	}



// 	/** Time Complexity: O(n) */
// 	public *Iterator(): Generator<T> {
// 		for (let current = this.head; current!==undefined; current = current.next) yield current.data;
// 	}


// 	/** Time Complexity: O(n) */
// 	public AsArray(): T[] {
// 		return [...this.Iterator()]
// 	}


// 	/** Time Complexity: O(n) */
// 	public ForEach(action: Action<[T]>):void {
// 		for (const Node of this.Iterator()) action(Node);
// 	}
// 	//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// 	protected *NodeIterator(): Generator<LinkedNode<T>> {
// 		for (let current = this.head; current!==undefined; current = current.next) yield current;
// 	}
	
// 	protected *IndexedNodeIterator(): Generator<[LinkedNode<T>, int]> {
// 		for (let current = this.head, index=0; current!==undefined; current = current.next, ++index) yield [current, index];
// 	}

// 	protected GetNodeAtIndex(index:int): LinkedNode<T>|undefined {
// 		if (index < 0 || this.count >= index) return undefined;
// 		let current:LinkedNode<T>|undefined = this.head;
// 		for (let currentIndex = 0; currentIndex<index && current!==undefined; ++currentIndex, current = current.next);
// 		return current;
// 	}

// 	// protected NewNode(value:T): LinkedNode<T> { return <LinkedNode<T>>{data:value, next:undefined} }

// }

















/**
 * An array that avoids being sparse by always
 * filling up unused indices with a default value.
 */
export class ContiguousGrowingArray<T> {
	private _store: T[] = new Array<T>();

	constructor(private readonly _default: T) { }

	public get length():int { return this._store.length; }
	public validIndex(index: int): bool { return (0 <= index && index < this._store.length); }

	public get(index: number): T { 
		return ((index < this._store.length)? this._store[index] : this._default);
	}

	public set(index: number, value: T): void {
		if (index >= this._store.length) 
			for (let i=this._store.length; i<index; ++i) 
				this._store[i] = this._default;
		this._store[index] = value;
	}

	public delete(deleteIndex: number, deleteCount: number): void {
		if (deleteCount === 0 || deleteIndex >= this._store.length) return;
		else this._store.splice(deleteIndex, deleteCount);
	}

	public insert(insertIndex: number, insertCount: number): void {
		if (insertCount === 0 || insertIndex >= this._store.length) return;
		const arr: T[] = new Array<T>(insertCount);
		for (let i = 0; i < insertCount; i++) arr[i] = this._default;
		this._store = this._store.insertArray(insertIndex, arr);
	}

	public clear(): void {
		this._store.length = 0;
	}
}















export class Array2D<T> {
	private readonly array: T[] = [];

	constructor(public readonly width: number, public readonly height: number) {
		this.array = new Array<T>(width * height);
	}

	get(x: number, y: number): T {
		return this.array[x + y * this.width];
	}

	set(x: number, y: number, value: T): void {
		this.array[x + y * this.width] = value;
	}
}











/**
 * A value that is resolved synchronously when it is first needed.
 */
export interface Lazy<T> {
	hasValue(): boolean;
	getValue(): T;
	map<R>(f: (x: T) => R): Lazy<R>;
}

export class Lazy<T> {

	private _didRun: boolean = false;
	private _value?: T;
	private _error: Error | undefined;

	constructor( private readonly executor: () => T) { }

	/**
	 * True if the lazy value has been resolved.
	 */
	hasValue() { return this._didRun; }

	/**
	 * Get the wrapped value.
	 *
	 * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
	 * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
	 */
	getValue(): T {
		if (!this._didRun) {
			try { this._value = this.executor(); } 
			catch (err:any) { this._error = err; } 
			finally { this._didRun = true; }
		}
		if (this._error) throw this._error;
		return this._value!;
	}

	/**
	 * Get the wrapped value without forcing evaluation.
	 */
	get rawValue(): T | undefined { return this._value; }

	/**
	 * Create a new lazy value that is the result of applying `f` to the wrapped value.
	 *
	 * This does not force the evaluation of the current lazy value.
	 */
	map<R>(f: (x: T) => R): Lazy<R> { return new Lazy<R>(() => f(this.getValue())); }
}








/* 
https://github.com/Gruntfuggly/todo-tree
EventBetterComments:
	 O- Scan mode: workspace and open files  //this is a label only node!
	Types:
		Todo - 26
		Info - 3
		Warning - 62
		Issue - 4
	Explorer:
		folderA (6)
			fileA1.ts (3)
				TODO: Fix this!
				Error: Dont do that!
				Info: This is a comment.
			fileA2.cs (2)
				Issue: Finish tree
				* Check on code!
			fileA3.py (1)
				Idea: Implement more!
		folderB (3)
			fileB1.ts (1)
				! What is this?
			fileB2.cs (1)
				: Work on code.
			fileB3.py (1)
				? Check the result.

		file1.ts (1)
			* Top level comments.
		file2.cs (2)
			! Why is this here?
			? Should we have this?
		file3.py (1)
			// // Commented out comments.
*/


export const ExcludeGlobsDefault = [
	"**/node_modules/*/**"
]


export const enum TreeDataType {
	Root,
	Branch,//Groups
	Leaf, //Nodes
	Slot //Utility
}


// interface IBaseNode {
// 	readonly type:TreeDataType;
// 	readonly Id:int;
// 	readonly children?:Array<IBaseNode>;
// 	parent?: IBaseNode;

// 	label:string;
// 	fsPath:string;
// 	visible:bool;
// }






// export interface ITreeNode {
// 	readonly type: TreeDataType;
// 	readonly Id : string;
// 	visible:bool;
// }

// export interface IGroupableTreeNode extends ITreeNode {
// 	groupId: string|null;
// }

// export interface ITreeNodeGroup extends ITreeNode {
// 	readonly children: AnyTreeItem[];
// 	collapsed: bool;
// }




// export abstract class TreeBranch implements ITreeNodeGroup {
// 	public readonly type = TreeDataType.Branch;
// 	public readonly Id: string;
// 	public readonly children: AnyTreeItem[] = [];
// 	public label = '';
// 	public collapsed = false;
// 	public colorId: string;
// 	public visible: boolean = true;

// 	public constructor(id?: string) {
// 		this.Id = id ?? randomUUID();
// 		this.colorId = getNextColorId();
// 	}

// 	public CheckAllChildrenCollapsed() {
// 		if (this.children.length === 0) return true;
// 		for (const child of this.children) {
// 			if (isGroup(child) && !child.collapsed) return false;
// 		}
// 		return true;
// 	}

// 	public RemoveChild(child: AnyTreeItem) {
// 		this.children.safeRemove(child);
// 	}
// }

// export abstract class TreeLeaf implements IGroupableTreeNode {
// 	public readonly type = TreeDataType.Leaf;
// 	public readonly Id: string;
// 	public groupId: string|null = null;
// 	public visible: boolean = true;

// 	public constructor(id:string){
// 		this.Id = id;
// 	}
// }












// export abstract class DocumentReferenceLeaf extends TreeLeaf {
// 	public readonly URI : vscode.Uri;
// 	public readonly Position: vscode.Position;

// 	public constructor(uri: vscode.Uri, position: vscode.Position) {
// 		super(uri.query);
// 		this.URI = uri;
// 		this.Position = position;
// 	}
// }







// // export class CommentTagLeaf extends TreeLeaf {


// // }

















































export abstract class ActionComment extends vscode.TreeItem {
    contextValue = '';
    abstract type: 'Action' | 'Value';
    abstract length: number;
    abstract commentType: string;
    abstract position: number;
    abstract uri: vscode.Uri;
    createdBy?: string;

    constructor(label: string, collapsibleState?: vscode.TreeItemCollapsibleState, contextValue: string = '') {
        super(label, collapsibleState);
        this.contextValue = contextValue;
    }
}

export interface ActionCommentCollection {
    [file: string]: Array<ActionComment>;
}










export async function readComments(expression:any, config: { include:vscode.GlobPattern, exclude:vscode.GlobPattern}): Promise<ActionCommentCollection> {
    try {
        const files = await vscode.workspace.findFiles(config.include, config.exclude);
        const result: ActionCommentCollection = await createObject(expression, files);
        return Promise.resolve(result);
    } catch (err) { return Promise.reject(err); }
}


async function createObject(expression: RegExp, files: Array<vscode.Uri>): Promise<ActionCommentCollection> {
    const result: ActionCommentCollection = {};
    for (const file of files) {
        const key = vscode.workspace.asRelativePath(file, true);
        const comments = await readCommentsInFile(expression, file);
        if (!!comments) result[key] = comments;
    }

    return result;
}


export async function readCommentsInFile(expression: RegExp, file: vscode.Uri) {
    let fileContent: string;
    try {
        fileContent = await fs.promises.readFile(file.fsPath, 'utf8');
    } catch (e) {
        console.warn(`readCommentsInFile() readFile failed (${file.fsPath})`, e);
        return null;
    }
    const hasBOM = /^\uFEFF/.test(fileContent);

    let res: RegExpExecArray|null;
    const currentFileActions: Array<ActionComment> = [];
    while (res = expression.exec(fileContent)) {
        const groups: any = {
            type: res[1],
            name: res[2],
            text: res[res.length - 1]
        };
        if (res.length < 4) {
            groups.name = null;
        }
        const label = groups.text.replace(/[ ]?\*\/$/, '');
        const commentType = (groups.type || 'TODO').toUpperCase();
        // const comment: ActionComment = new ActionComment(label);
		const comment: ActionComment = {label} as ActionComment;
        const tooltip = [];
        if (groups.name) {
            tooltip.push(`Created by ${groups.name}`);
            comment.createdBy = groups.name;
        }
        tooltip.push(file.fsPath);

        let position = expression.lastIndex - res[0].length;
        if (hasBOM) {
            position--;
        }

        currentFileActions.push({
            ...comment,
            commentType,
            position,
            uri: file,
            type: 'Action',
            contextValue: commentType,
            tooltip: tooltip.join('\n'),
            length: res[0].length,
            id: `${encodeURIComponent(file.path)}_${expression.lastIndex - res[0].length}`
        });
    }
    if (currentFileActions.length > 0) {
        return currentFileActions.sort((a, b) => a.position > b.position ? 1 : ((b.position > a.position) ? -1 : 0));
    }

    return null;
}




























































// let index = 0;

// const colorIds = [
// 	"charts.foreground",
// 	"charts.lines",
// 	"charts.red",
// 	"charts.blue",
// 	"charts.yellow",
// 	"charts.orange",
// 	"charts.green",
// 	"charts.purple",
// ];

// export function getNextColorId(): string {
// 	index = (index + 1) % colorIds.length;
// 	return colorIds[index];
// }

















// export const enum TreeItemType {
// 	Tab,
// 	Group,
// 	Slot,
// };

// export type Group = {
// 	readonly type: TreeItemType.Group;
// 	readonly id: string;
// 	colorId: string;
// 	label: string;
// 	children: Tab[];
// 	collapsed: boolean;
// };

// export type Tab = {
// 	readonly type: TreeItemType.Tab;
// 	readonly id: string;
// 	groupId: string | null;
// };

// export type Slot = {
// 	readonly type: TreeItemType.Slot;
// 	index: number;
// 	groupId: string | null;
// };


// export function isTab(item: AnyTreeItem): item is Tab { return item.type === TreeItemType.Tab; }
// export function isGroup(item: AnyTreeItem): item is Group { return item.type === TreeItemType.Group; }
// export function isSlot(item: AnyTreeItem): item is Slot { return item.type === TreeItemType.Slot; }

// export type AnyTreeItem = Tab | Group | Slot;



// export function safeRemove<U, T extends U>(array: U[], item: T): void {
// 	const index = array.indexOf(item);
// 	if (index !== -1) array.splice(index, 1);
// }





// export class TreeData {
// 	protected readonly root: Array<Tab | Group> = [];

// 	/** To quickly access groups */
// 	protected readonly groupMap: Map<string, Group> = new Map<string, Group>();
// 	/** To quickly access tabs */
// 	protected readonly tabMap: Map<string, Tab> = new Map<string, Tab>();


// 	public setState(state: Array<Tab | Group>) {
// 		this.root.push(...state);
// 		this.groupMap.clear();
// 		this.tabMap.clear();
// 		for (const item of this.root) {
// 			if (item.type === TreeItemType.Tab) {
// 				this.tabMap.set(item.id, item);
// 			} else {
// 				this.groupMap.set(item.id, item);
// 				for (const child of item.children) {
// 					this.tabMap.set(child.id, child);
// 				}
// 			}
// 		}
// 	}

	
// 	public getState(): Array<Tab | Group> {
// 		this.removeEmptyGroups();
// 		return this.root;
// 	}

// 	private removeEmptyGroups() {
// 		for (let i = this.root.length-1; i >= 0; i--) {
// 			const item = this.root[i];
// 			if (isGroup(item) && item.children.length === 0) {
// 				this.root.splice(i, 1);
// 				this.groupMap.delete(item.id);
// 			}
// 		}
// 	}

	
// 	public getChildren(element?: Tab | Group): Array<Tab | Group> | null {
// 		if (!element) return this.getState();
// 		if (element.type === TreeItemType.Tab) return null;
// 		return element.children;
// 	}

// 	public getParent(element: Tab | Group) {
// 		if (element.type === TreeItemType.Group) return undefined;
// 		if (element.groupId === null) return undefined;
// 		return this.groupMap.get(element.groupId);
// 	}


	
// 	private _insertTabToGroup(tab: Tab, group: Group, index?: number) {
// 		tab.groupId = group.id;
// 		group.children.splice(index ?? group.children.length, 0, tab);
// 	}

// 	private _insertTabToRoot(tab: Tab, index?: number) {
// 		tab.groupId = null;
// 		this.root.splice(index ?? this.root.length, 0, tab);
// 	}

// 	private _removeTab(tab: Tab) {
// 		const from = (tab.groupId === null)? this.root : this.groupMap.get(tab.groupId)!.children;
// 		safeRemove(from, tab);
// 		tab.groupId = null;
// 	}


	
// 	public group(target: Tab | Group, tabs: Tab[]) {
// 		if (tabs.length === 0) return;

// 		if (isGroup(target)) {
// 			tabs.forEach(tab => this._group(target, tab));
// 			return;
// 		}

// 		if (target.groupId) {
// 			const group = this.groupMap.get(target.groupId)!;
// 			const index = group.children.indexOf(target);
// 			tabs.forEach(tab => this._group(group, tab, index));
// 			return;
// 		}

// 		const group: Group = {
// 			type: TreeItemType.Group,
// 			colorId: getNextColorId(),
// 			id: randomUUID(),
// 			label: '',
// 			children: [],
// 			collapsed: false,
// 		};
// 		this.groupMap.set(group.id, group);
// 		this.root.splice(this.root.indexOf(target), 1, group);
// 		this._insertTabToGroup(target, group);
		
// 		tabs.forEach(tab => this._group(group, tab));
// 		return;
// 	}

	
// 	private _group(group: Group, tab: Tab, index?: number) {
// 		this._removeTab(tab);
// 		this._insertTabToGroup(tab, group, index);
// 	}


	
// 	public ungroup(tabs: Tab[], pushBack: boolean = false) {
// 		tabs.forEach(tab => {
// 			if (tab.groupId === null) return;
// 			const group = this.groupMap.get(tab.groupId)!;
// 			const index = this.root.indexOf(group);
// 			safeRemove(group.children, tab);
// 			tab.groupId = null;
// 			this._insertTabToRoot(tab, pushBack ? undefined : index + 1);
// 		});
// 	}

// 	public appendTab(tabId: string) {
// 		if (!this.tabMap.has(tabId)) {
// 			const Tab = <Tab>{
// 				type: TreeItemType.Tab,
// 				groupId: null,
// 				id: tabId,
// 			};
// 			this.tabMap.set(tabId, Tab);
// 			this.root.push(Tab);
// 		}
// 	}

// 	public deleteTab(tabId: string) {
// 		const tab = this.tabMap.get(tabId);
// 		if (tab) this._removeTab(tab);
// 		this.tabMap.delete(tabId);
// 	}

// 	public getTab(tabId: string): Tab|undefined { return this.tabMap.get(tabId); }
// 	public getGroup(groupId: string): Group|undefined { return this.groupMap.get(groupId); }

// 	public renameGroup(group: Group, input: string): void { group.label = input; }
// 	public cancelGroup(group: Group): void { this.ungroup(group.children.slice(0).reverse()); }


	
// 	public moveTo(target: Tab | Group, draggeds: Array<Tab | Group>) {
// 		if (isTab(target) && target.groupId) {
// 			const draggedTabs: Array<Tab> = draggeds.filter(isTab);
// 			draggedTabs.forEach(tab => this._removeTab(tab));
// 			const group = this.groupMap.get(target.groupId);
// 			group?.children.splice(group.children.indexOf(target), 0, ...draggedTabs);
// 			draggedTabs.forEach(tab => tab.groupId = target.groupId);
// 			return;
// 		}

// 		draggeds.forEach(dragged => {
// 			if (isGroup(dragged)) safeRemove(this.root, dragged);
// 			else this._removeTab(dragged)
// 		});
// 		this.root.splice(this.root.indexOf(target), 0, ...draggeds);
// 	}
	
// 	public pushBack(groupId: string | null, draggeds: (Tab | Group)[]) {
// 		if (groupId) {
// 			const draggedTabs: Array<Tab> = draggeds.filter(isTab);
// 			draggedTabs.forEach(tab => this._removeTab(tab));
// 			this.groupMap.get(groupId)?.children.push(...draggedTabs);
// 			draggedTabs.forEach(tab => tab.groupId = groupId);
// 			return;
// 		}

// 		draggeds.forEach(dragged => {
// 			if (isGroup(dragged)) safeRemove(this.root, dragged);
// 			else this._removeTab(dragged)
// 		});
// 		this.root.push(...draggeds);
// 	}


	
// 	public setCollapsedState(group: Group, collapsed: boolean) {
// 		this.groupMap.get(group.id)!.collapsed = collapsed;
// 	}


// 	public isAllCollapsed(): boolean {
// 		for (const item of this.root) {
// 			if (isGroup(item) && !item.collapsed) return false;
// 		}
// 		return true;
// 	}

// }








// // export abstract class AbstractTreeViewProvider<T extends vscode.TreeItem> implements vscode.TreeDataProvider<T> {
// // 	protected readonly OnDidChangeTreeDataEmitter = new vscode.EventEmitter<T | undefined>();

// // 	public readonly onDidChangeTreeData: vscode.Event<T | undefined> = this.OnDidChangeTreeDataEmitter.event;
// // 	public readonly refresh = this.OnDidChangeTreeDataEmitter.fire;


// // 	public getTreeItem(element: T): vscode.TreeItem { return element; }

// // 	//When the user opens the Tree View, the getChildren method will be called without an element
// // 	//From there, your TreeDataProvider should return your top-level tree items.
// // 	//The rest of the time, it will be called on tree items that update or need to be loaded.
// // 	public getChildren(element?: T): T[] {
// // 		if (element === undefined) return this.getRoots();
// // 		else return this.getSubChildren(element);
// // 	}

// // 	public abstract getRoots(): T[];
// // 	public abstract getSubChildren(element: T): T[];

	
// // 	/** Resolve `tooltip` only on hover */
// // 	public resolveTreeItem(_: T, el: T) {
// // 		// if (el instanceof FolderTreeItem) {
// // 		// 	if (Object.keys(el.nestedItems).length === 0) return undefined;
// // 		// 	el.tooltip = createFolderHoverText(el.nestedItems);
// // 		// } else {
// // 		// 	if (isSimpleObject(el.runnable) && el.runnable.disableTooltip) return el;
// // 		// 	el.tooltip = createCommandHoverText(el.runnable);
// // 		// }
// // 		return el;
// // 	}

// // }














// //https://github.com/microsoft/vscode-pull-request-github/blob/main/src/view/prsTreeDataProvider.ts



// // BaseNode is an abstract tree node which all other *nodes* must extend.
// // It also takes care of disposables if they are added to the `disposables` field.
// export abstract class AbstractBaseNode implements IDisposable {
//     public readonly disposables: Disposable[] = [];
//     dispose(): void {
// 		if (this.disposables.length === 0) return;
//         this.disposables.forEach((d) => d.dispose());
// 		this.disposables.length = 0;
//         this.getChildren().then((children) => children.forEach((child) => child.dispose()));
//     }

// 	public parent?: AbstractBaseNode;
// 	public readonly Id: string;

//     constructor(id:string, parent?: AbstractBaseNode) {
// 		this.Id = id;
// 		this.parent = parent;
// 	}

//     abstract getTreeItem(): Promise<vscode.TreeItem> | vscode.TreeItem;
//     abstract getChildren(element?: AbstractBaseNode): Promise<AbstractBaseNode[]>;
// }



// export type TreeNodeParent = TreeNode | BaseTreeNode;
// export interface BaseTreeNode {
// 	reveal(element: TreeNode, options?: { select?: boolean; focus?: boolean; expand?: boolean | number }): Thenable<void>;
// 	refresh(treeNode?: TreeNode): void;
// 	view: vscode.TreeView<TreeNode>;
// }


// export enum TreeItemCheckboxState {
// 	Unchecked = 0,
// 	Checked = 1
// }



// export abstract class TreeNode implements vscode.Disposable {
// 	abstract readonly childrenDisposables: vscode.Disposable[];
// 	abstract parent: TreeNodeParent;
// 	label?: string;
// 	accessibilityInformation?: vscode.AccessibilityInformation;
// 	id?: string;

// 	public constructor() { }
// 	public abstract getTreeItem(): vscode.TreeItem;
// 	public getParent(): TreeNode | undefined {
// 		if (this.parent instanceof TreeNode) return this.parent;
// 		return undefined;
// 	}

// 	public async reveal(treeNode: TreeNode, options?: { select?: boolean; focus?: boolean; expand?: boolean | number }): Promise<void> {
// 		try { await this.parent.reveal(treeNode || this, options); } 
// 		catch (e) { console.log("TreeNode: " + e); }
// 	}

// 	public refresh(treeNode?: TreeNode): void {
// 		return this.parent.refresh(treeNode);
// 	}

// 	public async getChildren(): Promise<TreeNode[]> {
// 		return [];
// 	}

// 	public updateCheckbox(_newState: TreeItemCheckboxState): void { }
// 	public updateParentCheckbox(): boolean { return false; }

// 	public dispose(): void {
// 		if (this.childrenDisposables.length !== 0) {
// 			this.childrenDisposables.forEach(dispose => dispose.dispose());
// 			this.childrenDisposables.length = 0;
// 		}
// 	}
// }








// export abstract class LabelOnlyNode extends TreeNode {
// 	public readonly label: string = '';
// 	constructor(label: string) {
// 		super();
// 		this.label = label;
// 	}
// 	getTreeItem(): vscode.TreeItem {
// 		return new vscode.TreeItem(this.label);
// 	}
// }







// // export class LinkNode extends AbstractBaseNode {
// //     constructor(
// //         readonly message: string,
// //         readonly description: string,
// //         readonly icon: iconSet,
// //         readonly linkId: KnownLinkID
// //     ) {
// //         super();
// //     }

// //     getTreeItem() {
// //         const text = this.message;
// //         const node = new TreeItem(text, TreeItemCollapsibleState.None);
// //         node.tooltip = text;
// //         node.description = this.description;
// //         node.resourceUri = vscode.Uri.parse(knownLinkIdMap.get(this.linkId) ?? '');
// //         node.iconPath = Resources.icons.get(this.icon);
// //         node.command = {
// //             command: Commands.ViewInWebBrowser,
// //             title: '',
// //             arguments: [this, HelpTreeViewId, this.linkId],
// //         };

// //         return node;
// //     }
// // }