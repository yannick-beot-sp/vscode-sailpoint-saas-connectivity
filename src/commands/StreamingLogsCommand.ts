import * as vscode from "vscode";
import { SourceTreeItem } from "../models/TreeModel";
import { SaaSConnectivityClientFactory } from "../services/SaaSConnectivityClientFactory";
import { ISCExtensionClient } from "../iscextension/iscextension-client";
import { LogMessage, LogRequest } from "../models/API";
import { delay } from "../utils/utils";


export interface ILogStream extends vscode.Disposable {
    isConnected: boolean;
    outputChannel: vscode.OutputChannel;
}

const logStreams: Map<string, ILogStream> = new Map<string, ILogStream>();

function getLogStreamId(item: SourceTreeItem): string {
    return `${item.tenantId}${item.logStreamPath}`;
}


export class StreamingLogsCommand {
    private readonly factory: SaaSConnectivityClientFactory
    constructor(private readonly context: vscode.ExtensionContext) {
        this.factory = new SaaSConnectivityClientFactory(new ISCExtensionClient())
    }

    public async start(item: SourceTreeItem) {
        const logStreamId: string = getLogStreamId(item);
        const logStream: ILogStream | undefined = logStreams.get(logStreamId);
        if (logStream && logStream.isConnected) {
            logStream.outputChannel.show();
            vscode.window.showWarningMessage(`Streaming is already active for ${item.logStreamLabel}`);
            return
        }

        const client = await this.factory.getSaaSConnectivityClient(item.tenantId, item.tenantName)

        // const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(`${item.logStreamLabel} - Log Stream`);
        const outputChannel: vscode.OutputChannel = logStream ? logStream.outputChannel : vscode.window.createOutputChannel(`${item.logStreamLabel} - Log Stream`);
        this.context.subscriptions.push(outputChannel);
        outputChannel.show();
        outputChannel.appendLine('Fetching logs...');


        // Adding stream to the list
        const newLogStream: ILogStream = {
            dispose: (): void => {
                outputChannel.appendLine('Disconnected');
                // outputChannel.dispose()
                newLogStream.isConnected = false;

            },
            isConnected: true,
            outputChannel: outputChannel
        };
        logStreams.set(logStreamId, newLogStream)

        const now = new Date(); // Get the current date and time
        let startTime = (new Date(now.getTime() - 5 * 60 * 1000)); // start 5min ago
        let isConnected = true
        // looping to tail logs
        do {
            const input: LogRequest = {
                filter: {
                    startTime: startTime.toISOString(),
                    targetName: item.label
                }
            }

            for await (const logMessage of client.getAllLogs(input)) {
                // TODO: allow raw output based on configuration setting
                outputChannel.appendLine(formatLog(logMessage))
                startTime = updateLastSeenTime(startTime, logMessage.timestamp)
            }
            startTime = new Date(startTime.getTime() + 1) // adding 1ms
            await delay(2000)
            isConnected = logStreams.get(logStreamId)?.isConnected ?? false
            // Existing is not connected anymore. cf. stop function
        } while (isConnected)
    }

    public async stop(item: SourceTreeItem) {
        const logStreamId: string = getLogStreamId(item);
        const logStream: ILogStream | undefined = logStreams.get(logStreamId);
        if (logStream && logStream.isConnected) {
            logStream.dispose();
        } else {
            await vscode.window.showWarningMessage(`Streaming is already disconnected for ${item.logStreamLabel}`);
        }

    }
}

function updateLastSeenTime(oldDate: Date, newDateStr: string) {
    const newDate = new Date(newDateStr)
    const oldTimestamp = oldDate.getTime()
    const newTimestamp = newDate.getTime()
    return oldTimestamp < newTimestamp ? newDate : oldDate
}

function formatLog(logentry: LogMessage) {
    let message: string | undefined = undefined
    if (logentry.message !== null && logentry.message !== undefined && typeof logentry.message === 'object') {
        // if ("level" in logentry.message) {
        //     //@ts-ignore
        //     delete logentry.message.level
        // }
        //@ts-ignore
        message = logentry.message.message
    } else {
        message = logentry.message
    }


    return `${formatDateString(logentry.timestamp)} ${logentry.level.padEnd(5, " ")} [${logentry.event}] ${message}`
}

function formatDateString(isoString: string): string {
    // Parse the ISO string to a Date object
    const date = new Date(isoString);
    
    // Get the locale parts using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat(vscode.env.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    // Get the formatted date without milliseconds
    const formattedDate = formatter.format(date);
    
    // Get milliseconds and ensure it's three digits
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    
    // Combine the formatted date with the three-digit milliseconds
    return `${formattedDate}.${milliseconds}`;
  }