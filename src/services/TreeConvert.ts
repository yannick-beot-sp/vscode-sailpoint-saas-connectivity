import { BaseTreeItem, FolderTreeItem, TenantTreeItem } from "../models/TreeModel";
import { IStoredNode } from "./TreeService";

export class TreeConvert {

    public static toTreeItem(node: IStoredNode): BaseTreeItem {
        switch (node.type) {
            case "FOLDER":
                return new FolderTreeItem({
                    id: node.id,
                    label: node.label,
                    parentId: node.parentId
                })

            case "TENANT":
                return new TenantTreeItem({
                    id: node.id,
                    label: node.label,
                    parentId: node.parentId,
                    baseUrl: node.baseUrl!
                })
        }
        // throw new Error(`Invalid type: ${node.type}`);

    }

    public static toStoredNode(node: FolderTreeItem | TenantTreeItem): IStoredNode {
        return {
            id: node.id,
            label: node.label,
            parentId: node.parentId,
            type: node instanceof FolderTreeItem ? "FOLDER" : "TENANT",
            baseUrl: (<TenantTreeItem>node).baseUrl
        }

    }
}