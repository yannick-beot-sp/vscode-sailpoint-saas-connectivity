import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

import { getWorkspaceFolder } from "../utils/vsCodeHelpers";
import { isEmpty } from "../utils/stringUtils";
import { CustomizerUploader } from "./UploadCustomizerCommand";
import { NpmCommandRunner } from "../services/NpmCommandRunner";
import { Config } from "../utils/Config";
/**
 * Will try to automatically find the zip file
 */
export class DeployCustomizerCommand extends CustomizerUploader {

    runner: NpmCommandRunner;
    constructor(private readonly context: vscode.ExtensionContext) {
        super()
        this.runner = new NpmCommandRunner(context)
    }

    async chooseFile(): Promise<undefined | string> {
        const workspaceFolder = getWorkspaceFolder()
        console.log({ workspaceFolder });

        if (workspaceFolder === undefined) {
            vscode.window.showErrorMessage("No workspace found. Try to open the folder of your customizer before deploying.")
            return undefined
        }

        const packagePath = path.join(workspaceFolder, "package.json")
        console.log({ packagePath });

        let packageContent: string
        try {
            packageContent = fs.readFileSync(packagePath, { encoding: "utf8" })
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Could not read `package.json`. Try to open the folder of your customizer before deploying.")
            return undefined
        }

        let version: string
        let name: string
        try {
            const packageJSON = JSON.parse(packageContent)
            version = packageJSON.version
            name = packageJSON.name
            if (isEmpty(version) || isEmpty(name)) {
                throw new Error("Version or name empty.");
            }
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage("Invalid `package.json`. Try to open the folder of your customizer before deploying.")
            return undefined
        }

        const zipPath = path.join(workspaceFolder, "dist", `${name}-${version}.zip`)
        console.log({ zipPath });
        const script = Config.getDefaultBuildCommand()
        const result = await this.runner.run(workspaceFolder, ["run", Config.getDefaultBuildCommand()])
        if (!result) {
            vscode.window.showErrorMessage(`Error while running ${script}`)
            return undefined
        }

        fs.access(zipPath, fs.constants.R_OK, (err) => {
            if (err) {
                console.error(err);
                vscode.window.showErrorMessage(`Could not find ${zipPath}`)
                return undefined
            }
        })
        return zipPath

    }
}