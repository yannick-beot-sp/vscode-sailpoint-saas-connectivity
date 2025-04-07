import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

import { ConnectorTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { chooseFileExtended, confirm, getWorkspaceFolder } from "../utils/vsCodeHelpers";
import { UploadConnectorResponse } from "../models/API";
import { isEmpty } from "../utils/stringUtils";



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

/**
 * Will try to automatically find the zip file
 */
export class DeployConnectorCommand extends ConnectorUploader {
    constructor() {
        super()
    }

    async chooseFile(): Promise<undefined | string> {
        const workspaceFolder = getWorkspaceFolder()
        console.log({ workspaceFolder });

        if (workspaceFolder === undefined) {
            vscode.window.showErrorMessage("No workspace found. Try to open the folder of your connector before deploying.")
            return undefined
        }

        const packagePath = path.join(workspaceFolder, "package.json")
        console.log({ packagePath });

        let packageContent: string
        try {
            packageContent = fs.readFileSync(packagePath, { encoding: "utf8" })
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Could not read `package.json`. Try to open the folder of your connector before deploying.")
            return undefined
        }

        let version: string
        let name: string
        try {
            const packageJSON = JSON.parse(packageContent)
            version = packageJSON.version
            name = packageJSON.name
            if (isEmpty(version) || isEmpty(name)) {
                throw new Error("Version or name empty.");
            }
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Invalid `package.json`. Try to open the folder of your connector before deploying.")
            return undefined
        }

        const zipPath = path.join(workspaceFolder, "dist", `${name}-${version}.zip`)
        console.log({ zipPath });

        fs.access(zipPath, fs.constants.R_OK, (err) => {
            if (err) {
                console.error(err);
                vscode.window.showErrorMessage(`Could not find ${zipPath}. Run \`npm run pack-zip\` to build and package the connector bundle`)
                return undefined
            }
        })
        return zipPath

    }
}