import * as vscode from "vscode";

export interface ScopedLogger {
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(error: unknown, ...args: any[]): void;
}

export class Logger {
    private static channel: vscode.LogOutputChannel | undefined;
    private static currentLevel: vscode.LogLevel = vscode.LogLevel.Info;

    private constructor() { }

    public static init(context: vscode.ExtensionContext): void {
        Logger.channel = vscode.window.createOutputChannel("SaaS Connectivity", { log: true });
        context.subscriptions.push(Logger.channel);

        Logger.currentLevel = Logger.channel.logLevel;
        context.subscriptions.push(
            Logger.channel.onDidChangeLogLevel(level => {
                Logger.currentLevel = level;
            })
        );
    }

    private static shouldLog(level: vscode.LogLevel): boolean {
        if (!Logger.channel || Logger.currentLevel === vscode.LogLevel.Off) {
            return false;
        }
        return level >= Logger.currentLevel;
    }

    public static trace(message: string, ...args: any[]): void {
        if (Logger.shouldLog(vscode.LogLevel.Trace)) {
            Logger.channel!.trace(message, ...args);
            console.debug(message, ...args);
        }
    }

    public static debug(message: string, ...args: any[]): void {
        if (Logger.shouldLog(vscode.LogLevel.Debug)) {
            Logger.channel!.debug(message, ...args);
            console.debug(message, ...args);
        }
    }
    
    public static info(message: string, ...args: any[]): void {
        if (Logger.shouldLog(vscode.LogLevel.Info)) {
            Logger.channel!.info(message, ...args);
            console.log(message, ...args);
        }
    }

    public static warn(message: string, ...args: any[]): void {
        if (Logger.shouldLog(vscode.LogLevel.Warning)) {
            Logger.channel!.warn(message, ...args);
            console.warn(message, ...args);
        }
    }

    public static error(error: unknown, ...args: any[]): void {
        if (Logger.shouldLog(vscode.LogLevel.Error)) {
            const normalized = error instanceof Error ? error : String(error);
            Logger.channel!.error(normalized, ...args);
            console.error(normalized, ...args);
        }
    }

    public static show(): void {
        Logger.channel?.show();
    }

    public static getLogger(scope: string): ScopedLogger {
        return {
            trace: (message: string, ...args: any[]) => Logger.trace(`[${scope}] ${message}`, ...args),
            debug: (message: string, ...args: any[]) => Logger.debug(`[${scope}] ${message}`, ...args),
            info: (message: string, ...args: any[]) => Logger.info(`[${scope}] ${message}`, ...args),
            warn: (message: string, ...args: any[]) => Logger.warn(`[${scope}] ${message}`, ...args),
            error: (error: unknown, ...args: any[]) => {
                if (typeof error === "string") {
                    Logger.error(`[${scope}] ${error}`, ...args);
                } else {
                    Logger.error(error, `[${scope}]`, ...args);
                }
            },
        };
    }
}
