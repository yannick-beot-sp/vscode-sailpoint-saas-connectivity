import * as vscode from "vscode";
import { Config } from "../utils/Config";

/**
 * Used to run npm command, especially to create a package.
 *
 * Runs through vscode.tasks/ShellExecution (the same mechanism backing
 * VS Code's built-in "NPM Scripts" view) rather than child_process.exec,
 * so the npm binary and each argument are passed individually with strong
 * shell quoting instead of being concatenated into one shell command line.
 * This avoids shell injection even though `npm.bin` and the build script
 * name are user-configurable settings.
 */
export class NpmCommandRunner {

    constructor(private readonly context: vscode.ExtensionContext) { }

    public async run(cwd: string, args: string[]): Promise<boolean> {
        const bin = Config.getNpmBin();
        const quotedArgs: vscode.ShellQuotedString[] = args.map(arg => ({
            value: arg,
            quoting: vscode.ShellQuoting.Strong,
        }));

        const execution = new vscode.ShellExecution(bin, quotedArgs, { cwd });
        const task = new vscode.Task(
            { type: "sailpoint-saas-connectivity-npm" },
            vscode.TaskScope.Workspace,
            "SaaS Connectivity",
            "SaaS Connectivity",
            execution
        );
        task.presentationOptions = {
            reveal: vscode.TaskRevealKind.Always,
            panel: vscode.TaskPanelKind.Dedicated,
            clear: true,
        };

        return new Promise<boolean>((resolve) => {
            const disposable = vscode.tasks.onDidEndTaskProcess(e => {
                if (e.execution.task === task) {
                    disposable.dispose();
                    resolve(e.exitCode === 0);
                }
            });
            this.context.subscriptions.push(disposable);
            vscode.tasks.executeTask(task);
        });
    }
}
