import { extensions } from "vscode";
import * as constants from './iscextension-commands';
import { FolderTreeNode, TenantInfo } from "./model";

export interface Observer<EventType, MessageType> {
    update(t: EventType, message: MessageType): void | Promise<void>;
}

enum TenantServiceEventType {
    removeTenant = "REMOVE_TENANT",
    updateTree = "UPDATE_TREE", // When there is any change in the tree
}


interface iscAPI {
    getRoots: () => Array<TenantInfo | FolderTreeNode>
    getChildren: (id: string | undefined) => Array<TenantInfo | FolderTreeNode>
    registerTreeUpdate: (o: Observer<TenantServiceEventType, any>) => void
    moveNode: (nodeIdToMove: string, targetFolderId?: string) => void
    getAccessToken: (tenantId: string) => Promise<string>
}




export class ISCExtensionClient {



    private readonly importedApi;

    constructor() {
        let iscExt = extensions.getExtension(constants.EXTENSION_ID);
        if (iscExt === undefined) {
            throw new Error(`Could not get extension ${constants.EXTENSION_ID}`);
        }
        this.importedApi = iscExt.exports as iscAPI;
    }

    public getRoots(): Array<TenantInfo | FolderTreeNode> {
        return this.importedApi.getRoots()
    }

    getChildren(id: string | undefined) {
        return this.importedApi.getChildren(id)
    }

    public register(cb: () => void) {
        this.importedApi.registerTreeUpdate({
            update: cb
        })
    }

    public moveNode(nodeIdToMove: string, targetFolderId?: string): void {
        this.importedApi.moveNode(nodeIdToMove, targetFolderId)
    }

    async getAccessToken(tenantId: string): Promise<string> {
        return await this.importedApi.getAccessToken(tenantId)
    }

}