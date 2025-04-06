import * as vscode from 'vscode';
import * as constants from './constants';
import { SaaSConnectivityView } from './SaaSConnectivityView';
import { registerISCExtentionCommands } from './iscextension/iscextension-register-commands';
import { StreamingLogsCommand } from './commands/StreamingLogsCommand';
import { CreateConnectorCommand } from './commands/CreateConnectorCommand';
import { DeleteConnectorCommand } from './commands/DeleteConnectorCommand';
import { RenameConnectorCommand } from './commands/RenameConnectorCommand';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-sailpoint-saas-connectivity" is now active!');
	new SaaSConnectivityView(context)
	registerISCExtentionCommands(context)
	/**
	 * Log Streaming
	 */
	const streamingLogsCommand = new StreamingLogsCommand(context)
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.START_STREAMING_LOGS,
			streamingLogsCommand.start,
			streamingLogsCommand))
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.STOP_STREAMING_LOGS,
			streamingLogsCommand.stop,
			streamingLogsCommand))

	/**
	 * Connector Management
	 */
	const createConnectorCommand = new CreateConnectorCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.CREATE_CONNECTOR,
			createConnectorCommand.execute,
			createConnectorCommand))

	const renameConnectorCommand = new RenameConnectorCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.RENAME_CONNECTOR,
			renameConnectorCommand.execute,
			renameConnectorCommand))

	const deleteConnectorCommand = new DeleteConnectorCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.DELETE_CONNECTOR,
			deleteConnectorCommand.execute,
			deleteConnectorCommand))
}

// This method is called when your extension is deactivated
export function deactivate() { }
