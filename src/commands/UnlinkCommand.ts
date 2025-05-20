import * as vscode from "vscode";
import * as constants from '../constants';
import { CustomizerInstanceLinkTreeItem } from "../models/TreeModel";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { confirm } from "../utils/vsCodeHelpers";


export class UnlinkCommand {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient

    constructor() {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    public async execute(item: CustomizerInstanceLinkTreeItem) {

        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to unlink the customizer ${item.label}?`)))
            || (!isReadOnly && !(await confirm(`Are you sure you want to unlink the customizer ${item.label}`)))) {
            return
        }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        const instance = await client.unlink(item.instanceId)
        vscode.window.showInformationMessage(`Customizer ${item.label} successfully unlinked from ${instance.name}`)
        vscode.commands.executeCommand(constants.REFRESH);

    }
}