import * as vscode from "vscode";
import { ConnectorTreeItem, CustomizerTreeItem, SourceTreeItem } from "../models/TreeModel";

export class CopyIdCommand {

    public async execute(item: ConnectorTreeItem | CustomizerTreeItem | SourceTreeItem) {
        vscode.env.clipboard.writeText(item.id);
    }
}