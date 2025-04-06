import * as vscode from "vscode";
import { ConnectorTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import * as constants from '../constants';
import { isAxiosError } from "axios";


export async function confirm(prompt: string): Promise<boolean> {
    const answer = await vscode.window.showWarningMessage(
        prompt,
        { modal: true },
        ...["Yes", "No"]
    );
    const value = (answer === "Yes")

    console.log(`< confirm: ${value}`);
    return value;
}

export class DeleteConnectorCommand {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient
    constructor(private readonly context: vscode.ExtensionContext) {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    public async execute(item: ConnectorTreeItem) {

        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to delete the connector ${item.label}?`)))
            || (!isReadOnly && !(await confirm(`Are you sure you want to delete the connector ${item.label}`)))) {
            return
        }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        try {
            await client.deleteConnector(item.id)
            vscode.window.showInformationMessage(`Connector ${item.label} successfully deleted.`)
            vscode.commands.executeCommand(constants.REFRESH);

        } catch (error) {
            if (isAxiosError(error)) {
                const { message } = error;
                vscode.window.showErrorMessage(`Could not delete connector: ${message}`)
            } else {
                vscode.window.showErrorMessage(`Could not delete connector: ${error}`)
            }
        }
    }

}