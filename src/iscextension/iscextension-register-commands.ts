import * as vscode from 'vscode';
import * as iscCommands from './iscextension-commands';
import * as constants from '../constants';
import { TenantFolderTreeItem, TenantTreeItem } from './iscextension-treeitems';


export function registerISCExtentionCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.ADD_FOLDER_ROOT, async () => {
            vscode.commands.executeCommand(iscCommands.ADD_FOLDER_ROOT);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.ADD_FOLDER, (item: TenantFolderTreeItem) => {
            vscode.commands.executeCommand(iscCommands.ADD_FOLDER, item);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.REMOVE_FOLDER, (item: TenantFolderTreeItem) => {
            vscode.commands.executeCommand(iscCommands.REMOVE_FOLDER, item);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.RENAME_FOLDER, (item: TenantFolderTreeItem) => {
            vscode.commands.executeCommand(iscCommands.RENAME_FOLDER, item);
        }));


    context.subscriptions.push(
        vscode.commands.registerCommand(constants.ADD_TENANT, async () => {
            vscode.commands.executeCommand(iscCommands.ADD_TENANT);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.TENANT_SET_READONLY, (item: TenantTreeItem) => {
            vscode.commands.executeCommand(iscCommands.TENANT_SET_READONLY, item);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand(constants.TENANT_SET_WRITABLE, (item: TenantTreeItem) => {
            vscode.commands.executeCommand(iscCommands.TENANT_SET_WRITABLE, item);
        }));


}