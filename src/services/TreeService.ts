import { Memento } from "vscode"
import { compareByLabel } from "../utils/compare"

const KEY_PREFIX = "TREE_"

export type StoredNodeType = "FOLDER" | "TENANT"

export type VisibilityState = Record<string, boolean>;


export interface IStoredNode {
    readonly id: string,
    label: string,
    readonly type: StoredNodeType
    parentId?: string
    readonly baseUrl?: string
    readOnly?: boolean
    tableViews?: Record<string, VisibilityState>
}

export class StoredNode implements IStoredNode {
    public readonly id: string
    public label: string
    public readonly type: StoredNodeType
    public parentId?: string
    public readonly baseUrl?: string
    public readOnly?: boolean

    constructor({ id, label, type, parentId, baseUrl, readOnly }: IStoredNode) {
        this.id = id
        this.label = label
        this.type = type
        this.parentId = parentId
        this.baseUrl = baseUrl
        this.readOnly = readOnly
    }

    get isRoot(): boolean {
        return this.parentId === undefined;
    }
}

export class TreeService {
    constructor(private storage: Memento) { }

    public getRoots(): IStoredNode[] {
        const a = this.storage.keys()
            .filter(x => x.startsWith(KEY_PREFIX))

        return a.map(x => new StoredNode(this.storage.get<IStoredNode>(x)!))
            .filter(x => x.isRoot)
            .sort(compareByLabel)
    }

    public getChildren(id: string): IStoredNode[] {
        return this.storage.keys()
            .filter(x => x.startsWith(KEY_PREFIX))
            .map(x => new StoredNode(this.storage.get<IStoredNode>(x)!))
            .filter(x => x.parentId === id)
            .sort(compareByLabel)
    }

    public get(id: string): IStoredNode | undefined {
        return this.storage.get(this._getKey(id))
    }

    public async addOrUpdate(node: IStoredNode) {
        await this.storage.update(
            this._getKey(node.id),
            node
        )
    }

    public async remove(id: string): Promise<void> {
        const children = this.getChildren(id)
        if (children) {
            for await (const element of children) {
                this.remove(element.id)
            }
        }
        // remove
        await this.storage.update(
            this._getKey(id),
            undefined
        )
    }

    private _getKey(id: string): string {
        return KEY_PREFIX + id
    }
}