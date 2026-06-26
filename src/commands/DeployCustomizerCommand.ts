import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

import { getWorkspaceFolder } from "../utils/vsCodeHelpers";
import { isEmpty } from "../utils/stringUtils";
import { CustomizerUploader } from "./UploadCustomizerCommand";
import { NpmCommandRunner } from "../services/NpmCommandRunner";
import { Config } from "../utils/Config";
import { Logger } from "../utils/Logger";
/**
 * Will try to automatically find the zip file
 */
export class DeployCustomizerCommand extends CustomizerUploader {

    runner: NpmCommandRunner;
    private readonly logger = Logger.getLogger("DeployCustomizerCommand");
    constructor(private readonly context: vscode.ExtensionContext) {
        super()
        this.runner = new NpmCommandRunner(context)
    }

    async chooseFile(): Promise<undefined | string> {
        const workspaceFolder = getWorkspaceFolder()
        this.logger.debug("workspaceFolder", workspaceFolder);

        if (workspaceFolder === undefined) {
            vscode.window.showErrorMessage("No workspace found. Try to open the folder of your customizer before deploying.")
            return undefined
        }

        const packagePath = path.join(workspaceFolder, "package.json")
        this.logger.debug("packagePath", packagePath);

        let packageContent: string
        try {
            packageContent = fs.readFileSync(packagePath, { encoding: "utf8" })
        } catch (error) {
            this.logger.error(error);
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
            this.logger.error(error);
            vscode.window.showErrorMessage("Invalid `package.json`. Try to open the folder of your customizer before deploying.")
            return undefined
        }

        const zipPath = path.join(workspaceFolder, "dist", `${name}-${version}.zip`)
        this.logger.debug("zipPath", zipPath);
        const script = Config.getDefaultBuildCommand()
        const result = await this.runner.run(workspaceFolder, ["run", Config.getDefaultBuildCommand()])
        if (!result) {
            vscode.window.showErrorMessage(`Error while running ${script}`)
            return undefined
        }

        try {
            await fs.promises.access(zipPath, fs.constants.R_OK)
        } catch (error) {
            this.logger.error(error)
            vscode.window.showErrorMessage(`Could not find ${zipPath}`)
            return undefined
        }
        return zipPath

    }
}