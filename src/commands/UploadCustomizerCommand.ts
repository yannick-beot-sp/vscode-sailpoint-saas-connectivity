import * as vscode from "vscode";

import { CustomizerTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { chooseFileExtended, confirm } from "../utils/vsCodeHelpers";
import { UploadCustomizerResponse } from "../models/API";



export abstract class CustomizerUploader {
    private readonly factory: SaaSConnectivityClientFactory
    private readonly iscExtensionClient: ISCExtensionClient

    constructor() {
        this.iscExtensionClient = new ISCExtensionClient()
        this.factory = new SaaSConnectivityClientFactory(this.iscExtensionClient)
    }

    abstract chooseFile(): Promise<undefined | string>;

    public async execute(item: CustomizerTreeItem) {
        const isReadOnly = this.iscExtensionClient.isTenantReadonly(item.tenantId)

        if ((isReadOnly && !(await confirm(`The tenant ${item.tenantDisplayName} is read-only. Do you still want to upload to the customizer ${item.label}?`)))
            || (!isReadOnly && !(await confirm(`Are you sure you want to upload to the customizer ${item.label}`)))) {
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
            const response = await client.uploadCustomizer(item.id, filePath);
            return response
        }).then((customizerVersion: UploadCustomizerResponse) => {
            vscode.window.showInformationMessage(`Created version ${customizerVersion.version} for Customizer ${item.label} with ${filePath}`)

        }, (reason) => {
            vscode.window.showErrorMessage(`Could not create customizer: ${reason}`)
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

export class UploadCustomizerCommand extends CustomizerUploader {
    constructor() {
        super()
    }

    async chooseFile(): Promise<undefined | string> {
        return (await chooseFile())?.fsPath
    }
}

