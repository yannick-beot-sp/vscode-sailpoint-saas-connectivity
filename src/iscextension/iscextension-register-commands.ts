import * as vscode from 'vscode';
import * as constants from './iscextension-commands';

export function registerISCExtentionCommands(context: vscode.ExtensionContext) {
context.subscriptions.push(
            vscode.commands.registerCommand(constants.ADD_FOLDER_ROOT, async () => {
                await this.ADDFolder()
            }));
        context.subscriptions.push(
            vscode.commands.registerCommand(constants.ADD_FOLDER, this.ADDFolder, this));

        context.subscriptions.push(
            vscode.commands.registerCommand(constants.ADD_TENANT, async () => {
                await this.ADDTenant()
            }));
        context.subscriptions.push(
            vscode.commands.registerCommand(constants.ADD_TENANT, this.ADDTenant, this));

        context.subscriptions.push(
            vscode.commands.registerCommand(constants.RENAME, this.rename, this));
        context.subscriptions.push(
            vscode.commands.registerCommand(constants.REFRESH, this.refresh, this));
        context.subscriptions.push(
            vscode.commands.registerCommand(constants.REMOVE, this.remove, this));
}