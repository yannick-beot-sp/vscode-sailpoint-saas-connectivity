import * as vscode from "vscode";
import { ConnectorTreeItem, CustomizerTreeItem, isCustomizer, SourceTreeItem } from "../models/TreeModel";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { SaaSConnectivityClient } from "../services/SaaSConnectivityClient";
import { Customizer, Instance } from "../models/API";
import * as constants from '../constants';
import { confirm } from "../utils/vsCodeHelpers";

async function chooseSource(client: SaaSConnectivityClient): Promise<Instance | undefined> {

    const sources = await client.getInstances()

    const selectedValue = await vscode.window.showQuickPick(
        sources.map(s => ({
            ...s,
            label: s.name,
        })),
        {
            placeHolder: 'Select the source to link',
            canPickMany: false,
        }
    );

    return selectedValue
}


async function chooseCustomizer(client: SaaSConnectivityClient): Promise<Customizer | undefined> {

    const customizers = await client.getCustomizers()

    const selectedValue = await vscode.window.showQuickPick(
        customizers.map(c => ({
            ...c,
            label: c.name,
        })),
        {
            placeHolder: 'Select the customizer to link',
            canPickMany: false,
        }
    );

    return selectedValue
}


export class LinkCommand {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient

    constructor() {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    public async execute(item: CustomizerTreeItem | SourceTreeItem) {
        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly
            && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to link ${item.label}?`)))) {
            return
        }

        let customizerId: string, instanceId: string
        let customizerName: string
        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        if (isCustomizer(item)) {
            customizerId = item.id
            customizerName = item.label
            const instance = await chooseSource(client)
            if (instance === undefined) { return }
            instanceId = instance.id

        } else {
            instanceId = (item as SourceTreeItem).id
            const customizer = await chooseCustomizer(client)
            if (customizer === undefined) { return }
            customizerId = customizer.id
            customizerName = customizer.name
        }

        const instance = await client.link(customizerId, instanceId)
        vscode.window.showInformationMessage(`Customizer ${customizerName} successfully linked to ${instance.name}`)
        vscode.commands.executeCommand(constants.REFRESH);
    }
}