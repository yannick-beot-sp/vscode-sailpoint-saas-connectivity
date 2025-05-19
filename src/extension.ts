import * as vscode from 'vscode';
import * as constants from './constants';
import { SaaSConnectivityView } from './SaaSConnectivityView';
import { registerISCExtentionCommands } from './iscextension/iscextension-register-commands';
import { StreamingLogsCommand } from './commands/StreamingLogsCommand';
import { CreateConnectorCommand } from './commands/CreateConnectorCommand';
import { DeleteConnectorCommand } from './commands/DeleteConnectorCommand';
import { RenameConnectorCommand } from './commands/RenameConnectorCommand';
import { UploadConnectorCommand } from './commands/UploadConnectorCommand';
import { DeployConnectorCommand } from './commands/DeployConnectorCommand';
import { CopyConnectorIdCommand } from './commands/CopyConnectorIdCommand';

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

	const uploadConnectorCommand = new UploadConnectorCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.UPLOAD_CONNECTOR,
			uploadConnectorCommand.execute,
			uploadConnectorCommand))

	const deployConnectorCommand = new DeployConnectorCommand(context)
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.DEPLOY_CONNECTOR,
			deployConnectorCommand.execute,
			deployConnectorCommand))

	const copyConnectorIdCommand = new CopyConnectorIdCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.COPY_ID_CONNECTOR,
			copyConnectorIdCommand.execute,
			copyConnectorIdCommand))
}

// This method is called when your extension is deactivated
export function deactivate() { }
