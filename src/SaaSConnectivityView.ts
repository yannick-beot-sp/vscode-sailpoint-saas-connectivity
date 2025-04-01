import * as vscode from 'vscode';
import * as constants from './constants';
import { ISCExtensionClient } from './iscextension/iscextension-client';
import { convertToBaseTreeItem } from './iscextension/convertToBaseTreeItem';
import { BaseTreeItem, TenantFolderTreeItem, TenantTreeItem } from './iscextension/iscextension-treeitems';

export class SaaSConnectivityView implements vscode.TreeDataProvider<BaseTreeItem>, vscode.TreeDragAndDropController<BaseTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<(BaseTreeItem | undefined)[] | undefined> = new vscode.EventEmitter<BaseTreeItem[] | undefined>();
    // We want to use an array as the event type, but the API for this is currently being finalized. Until it's finalized, use any.
    public onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
    dropMimeTypes: readonly string[] = [constants.DROP_MIME_TYPE];
    dragMimeTypes: readonly string[] = ["text/uri-list"];
    // Keep track of any nodes we create so that we can re-use the same objects.
    private nodes: Map<string, BaseTreeItem> = new Map();

    private readonly iscExtensionClient: ISCExtensionClient
    private readonly extensionUri: vscode.Uri

    ////////////////////////////////
    //#region Constructor
    ////////////////////////////////

    constructor(context: vscode.ExtensionContext) {


        context.subscriptions.push(
            vscode.window.createTreeView(
                constants.VIEW_CONTAINER_ID,
                { treeDataProvider: this, showCollapseAll: true, canSelectMany: false, dragAndDropController: this })
        );

        this.iscExtensionClient = new ISCExtensionClient()
        this.extensionUri = context.extensionUri
    }

    ////////////////////////////////
    //#endregion Constructor
    ////////////////////////////////

    ////////////////////////////////
    //#region Tree data provider 
    ////////////////////////////////

    public async getChildren(element?: BaseTreeItem): Promise<BaseTreeItem[]> {
        if (element) {
            return await element.getChildren()
        } else {
            const roots = this.iscExtensionClient.getRoots()
            const results = roots.map(x => convertToBaseTreeItem(x))
            console.log("< getChildren", results);
            return results;
        }
        
    }

    public getTreeItem(element: BaseTreeItem): vscode.TreeItem {
        return element;
    }




    dispose(): void {
        // nothing to dispose
    }
    ////////////////////////////////
    //#endregion Tree data provider 
    ////////////////////////////////

    /////////////////////////////////////
    //#region Drag and drop controller
    /////////////////////////////////////

    public async handleDrop(target: BaseTreeItem | undefined, sources: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        const transferItem = sources.get(constants.DROP_MIME_TYPE);
        if (!transferItem) {
            return;
        }

        const treeItems: BaseTreeItem[] = transferItem.value;
        for (const item of treeItems) {
            
        }

    }

    public async handleDrag(source: BaseTreeItem[], treeDataTransfer: vscode.DataTransfer, _token: vscode.CancellationToken): Promise<void> {
        source = source.filter(x => x instanceof TenantTreeItem || x instanceof TenantFolderTreeItem)
        if (source && source.length > 0) {
            treeDataTransfer.set(constants.DROP_MIME_TYPE, new vscode.DataTransferItem(source));
        }
    }

    /////////////////////////////////////
    //#endregion Drag and drop controller
    /////////////////////////////////////

    /////////////////////
    //#region Commands
    /////////////////////



    refresh(node?: BaseTreeItem): void {
        console.log('> ISCDataProvider.refresh');
        if (node) {
            this._onDidChangeTreeData.fire([node]);
        } else {
            this._onDidChangeTreeData.fire(undefined);
        }
    }

    

    /////////////////////
    //#endregion Commands
    /////////////////////

    /////////////////////////////
    //#region Private methods
    /////////////////////////////

    
    /////////////////////////////
    //#endregion Private methods
    /////////////////////////////
}