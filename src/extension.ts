import * as vscode from 'vscode';
import * as constants from './constants';
import { SaaSConnectivityView } from './SaaSConnectivityView';
import { registerISCExtentionCommands } from './iscextension/iscextension-register-commands';
import { StreamingLogsCommand } from './commands/StreamingLogsCommand';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-sailpoint-saas-connectivity" is now active!');
	new SaaSConnectivityView(context)
	registerISCExtentionCommands(context)

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
}

// This method is called when your extension is deactivated
export function deactivate() { }
