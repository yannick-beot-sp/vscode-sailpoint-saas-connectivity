import * as vscode from "vscode";
import { ConnectorsTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { isEmpty } from "../utils/stringUtils";
import * as constants from './../constants';

export async function askName(tenantDisplayName: string): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
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

export class CreateConnectorCommand {
    private readonly factory: SaaSConnectivityClientFactory
    constructor(private readonly context: vscode.ExtensionContext) {
        this.factory = new SaaSConnectivityClientFactory(new ISCExtensionClient())
    }

    public async execute(item: ConnectorsTreeItem) {
        const alias = await askName(item.tenantDisplayName)
        if (alias === undefined) { return }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        try {
            const connector = await client.createConnector(alias)
            vscode.window.showInformationMessage(`Connector ${connector.alias} created with id ${connector.id}`)
            vscode.commands.executeCommand(constants.REFRESH, item);

        } catch (error) {
            vscode.window.showErrorMessage(`Could not create connector: ${error}`)
        }
    }

}