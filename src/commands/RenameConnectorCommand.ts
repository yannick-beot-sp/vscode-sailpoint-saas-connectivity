import * as vscode from "vscode";
import { ConnectorTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { isEmpty } from "../utils/stringUtils";
import * as constants from '../constants';

export async function askName(oldname: string, tenantDisplayName: string): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        value: oldname,
        ignoreFocusOut: true,
        placeHolder: 'alias',
        prompt: "Enter a name for the connector",
        title: `Create Connector In ${tenantDisplayName}`,
        validateInput: text => {
            if (isEmpty(text) || isEmpty(text.trim())) {
                return "Name must not be empty";
            }
        }
    });
    return result;
}

export class RenameConnectorCommand {

    private readonly factory: SaaSConnectivityClientFactory

    constructor() {
        this.factory = new SaaSConnectivityClientFactory(new ISCExtensionClient())
    }

    public async execute(item: ConnectorTreeItem) {
        const alias = await askName(item.label, item.tenantDisplayName)
        if (alias === undefined) { return }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        try {
            const connector = await client.updateConnector(item.id, alias)
            vscode.window.showInformationMessage(`Connector ${connector.alias} renamed`)
            vscode.commands.executeCommand(constants.REFRESH);

        } catch (error) {
            vscode.window.showErrorMessage(`Could not rename connector: ${error}`)
        }
    }

}