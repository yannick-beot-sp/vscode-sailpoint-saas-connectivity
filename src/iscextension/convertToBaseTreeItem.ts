import { BaseTreeItem, TenantFolderTreeItem, TenantTreeItem } from "../models/TreeModel"
import { ISCExtensionClient } from "./iscextension-client"
import { FolderTreeNode, isTenantInfo, TenantInfo } from "./model"

export function convertToBaseTreeItem(x: TenantInfo | FolderTreeNode, iscExtensionClient:ISCExtensionClient): BaseTreeItem {
    if (isTenantInfo(x)) {
        return new TenantTreeItem(
            x.name,
            x.id,
            x.tenantName,
            x.name,
            x.readOnly,
            iscExtensionClient)
    } else {
        return new TenantFolderTreeItem(
            x.id,
            x.name,
            iscExtensionClient
        )
    }
}