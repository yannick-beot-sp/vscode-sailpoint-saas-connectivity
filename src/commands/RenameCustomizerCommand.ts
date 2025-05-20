import * as vscode from "vscode";
import { CustomizerTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { isEmpty } from "../utils/stringUtils";
import * as constants from '../constants';

export async function askName(oldname: string, tenantDisplayName: string): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        value: oldname,
        ignoreFocusOut: true,
        placeHolder: 'name',
        prompt: "Enter a name for the customizer",
        title: `Rename Customizer In ${tenantDisplayName}`,
        validateInput: text => {
            if (isEmpty(text) || isEmpty(text.trim())) {
                return "Name must not be empty";
            }
        }
    });
    return result;
}

export class RenameCustomizerCommand {

    private readonly factory: SaaSConnectivityClientFactory

    constructor() {
        this.factory = new SaaSConnectivityClientFactory(new ISCExtensionClient())
    }

    public async execute(item: CustomizerTreeItem) {
        const name = await askName(item.label, item.tenantDisplayName)
        if (name === undefined) { return }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)
        try {
            const customizer = await client.updateCustomizer(item.id, name)
            vscode.window.showInformationMessage(`Customizer ${customizer.name} renamed`)
            vscode.commands.executeCommand(constants.REFRESH);

        } catch (error) {
            vscode.window.showErrorMessage(`Could not rename customizer: ${error}`)
        }
    }

}