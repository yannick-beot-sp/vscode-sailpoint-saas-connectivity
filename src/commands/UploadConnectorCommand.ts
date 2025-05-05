import * as vscode from "vscode";

import { ConnectorTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { chooseFileExtended, confirm } from "../utils/vsCodeHelpers";
import { UploadConnectorResponse } from "../models/API";



export abstract class ConnectorUploader {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient

    constructor() {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    abstract chooseFile(): Promise<undefined | string>;

    public async execute(item: ConnectorTreeItem) {
        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to upload to the connector ${item.label}?`)))
            || (!isReadOnly && !(await confirm(`Are you sure you want to upload to the connector ${item.label}`)))) {
            return
        }

        const filePath = await this.chooseFile()
        if (filePath === undefined) { return }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Uploading ${item.label}...`,
            cancellable: false
        }, async () => {
            const response = await client.uploadConnector(item.id, filePath);
            return response
        }).then((connectorVersion: UploadConnectorResponse) => {
            vscode.window.showInformationMessage(`Created version ${connectorVersion.version} for Connector ${item.label} with ${filePath}`)

        }, (reason) => {
            vscode.window.showErrorMessage(`Could not create connector: ${reason}`)
        })
    }

}

export async function chooseFile(): Promise<undefined | vscode.Uri> {
    const options = {
        canSelectMany: false,
        openLabel: 'Open',
        filters: {
            "Zip files": ["zip"],
            'All files': ['*']
        }
    }

    return await chooseFileExtended(options) as undefined | vscode.Uri
}

export class UploadConnectorCommand extends ConnectorUploader {
    constructor() {
        super()
    }

    async chooseFile(): Promise<undefined | string> {
        return (await chooseFile())?.fsPath
    }
}

