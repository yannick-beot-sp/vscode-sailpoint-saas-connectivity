import { BaseTreeItem, TenantFolderTreeItem, TenantTreeItem } from "./iscextension-treeitems"
import { FolderTreeNode, isTenantInfo, TenantInfo } from "./model"

export function convertToBaseTreeItem(x: TenantInfo | FolderTreeNode): BaseTreeItem {
    if (isTenantInfo(x)) {
        return new TenantTreeItem(
            x.name,
            x.id,
            x.tenantName,
            x.name,
            x.readOnly)
    } else {
        return new TenantFolderTreeItem(
            x.id,
            x.name,
            
        )
    }
}