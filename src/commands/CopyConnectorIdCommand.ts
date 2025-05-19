import * as vscode from "vscode";
import { ConnectorTreeItem } from "../models/TreeModel";

export class CopyConnectorIdCommand {

    public async execute(item: ConnectorTreeItem) {
        vscode.env.clipboard.writeText(item.id);
    }
}