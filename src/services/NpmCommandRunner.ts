import * as cp from 'child_process';
import * as vscode from "vscode";
import { Config } from "../utils/Config";

interface Process {
    process: cp.ChildProcess;
    cmd: string;
}
/**
 * Used to run npm command, especially to create a package
 */
export class NpmCommandRunner {
    private outputChannel: vscode.OutputChannel;
    private runningProcesses: Map<number, Process> = new Map();

    constructor(private readonly context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('SaaS Connectivity/npm');
        context.subscriptions.push(this.outputChannel);
    }


    public async run(cwd: string, args: string[]): Promise<boolean> {
        this.outputChannel.clear();
        const cmd = Config.getNpmBin() + ' ' + args.join(' ');
        const p = cp.exec(cmd, { cwd: cwd, env: process.env });
        if (!p.pid) {
            return false
        }
        this.runningProcesses.set(p.pid, { process: p, cmd: cmd });

        return new Promise((resolve, reject) => {
            if (!p.pid) {
                resolve(false);
                return;
            }

            this.runningProcesses.set(p.pid, { process: p, cmd: cmd });

            p.stderr?.on('data', (data: string) => {
                this.outputChannel.append(data);
            });

            p.stdout?.on('data', (data: string) => {
                this.outputChannel.append(data);
            });

            p.on('exit', (code: number | null, signal: string | null) => {
                this.runningProcesses.delete(p.pid!);

                if (signal === 'SIGTERM') {
                    this.outputChannel.appendLine('Successfully killed process');
                    this.outputChannel.appendLine('-----------------------');
                    this.outputChannel.appendLine('');
                    resolve(false); // Indicate incomplete build
                } else {
                    this.outputChannel.appendLine('-----------------------');
                    this.outputChannel.appendLine('');
                    resolve(code === 0); // Indicate successful execution
                }

            });
            this.outputChannel.show();
        });

    }
}