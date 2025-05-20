import * as vscode from "vscode";
import { CustomizerTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import * as constants from '../constants';
import { isAxiosError } from "axios";
import { confirm } from "../utils/vsCodeHelpers";



export class DeleteCustomizerCommand {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient

    constructor() {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    public async execute(item: CustomizerTreeItem) {

        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to delete the customizer ${item.label}?`)))
            || (!isReadOnly && !(await confirm(`Are you sure you want to delete the customizer ${item.label}`)))) {
            return
        }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        try {
            await client.deleteCustomizer(item.id)
            vscode.window.showInformationMessage(`Customizer ${item.label} successfully deleted.`)
            vscode.commands.executeCommand(constants.REFRESH);

        } catch (error) {
            if (isAxiosError(error)) {
                const { message } = error;
                vscode.window.showErrorMessage(`Could not delete customizer: ${message}`)
            } else {
                vscode.window.showErrorMessage(`Could not delete customizer: ${error}`)
            }
        }
    }

}