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
    registerTreeUpdate: (o: Observer<TenantServiceEventType, any>) => void
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

    public register(cb: () => void) {
        this.importedApi.registerTreeUpdate({
            update: cb
        })
    }
}