import { extensions } from "vscode";
import * as constants from './iscextension-commands';
import { FolderTreeNode, TenantInfo } from "./model";
export class ISCExtensionClient {

    private readonly importedApi;

    constructor() {
        let iscExt = extensions.getExtension(constants.EXTENSION_ID);
        if (iscExt===undefined) {
            throw new Error(`Could not get extension ${constants.EXTENSION_ID}`);
        }
        this.importedApi = iscExt.exports;
    }

    public getRoots(): Array<TenantInfo | FolderTreeNode> {
        return this.importedApi.getRoots()
    }


}