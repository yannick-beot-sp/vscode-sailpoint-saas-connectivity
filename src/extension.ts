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
import { CopyIdCommand } from './commands/CopyIdCommand';
import { CreateCustomizerCommand } from './commands/CreateCustomizerCommand';
import { DeleteCustomizerCommand } from './commands/DeleteCustomizerCommand';
import { DeployCustomizerCommand } from './commands/DeployCustomizerCommand';
import { RenameCustomizerCommand } from './commands/RenameCustomizerCommand';
import { UploadCustomizerCommand } from './commands/UploadCustomizerCommand';

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

	const copyIdCommand = new CopyIdCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.COPY_ID_CONNECTOR,
			copyIdCommand.execute,
			copyIdCommand))


	/**
	 * Customizer Management
	 */
	const createCustomizerCommand = new CreateCustomizerCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.CREATE_CUSTOMIZER,
			createCustomizerCommand.execute,
			createCustomizerCommand))

	const renameCustomizerCommand = new RenameCustomizerCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.RENAME_CUSTOMIZER,
			renameCustomizerCommand.execute,
			renameCustomizerCommand))

	const deleteCustomizerCommand = new DeleteCustomizerCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.DELETE_CUSTOMIZER,
			deleteCustomizerCommand.execute,
			deleteCustomizerCommand))

	const uploadCustomizerCommand = new UploadCustomizerCommand()
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.UPLOAD_CUSTOMIZER,
			uploadCustomizerCommand.execute,
			uploadCustomizerCommand))

	const deployCustomizerCommand = new DeployCustomizerCommand(context)
	context.subscriptions.push(
		vscode.commands.registerCommand(
			constants.DEPLOY_CUSTOMIZER,
			deployCustomizerCommand.execute,
			deployCustomizerCommand))
}

// This method is called when your extension is deactivated
export function deactivate() { }
