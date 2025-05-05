import { workspace } from "vscode";
import { COMMAND_PREFIX, CONF_DEFAULT_BUILD_SCRIPT, CONF_DEFAULT_BUILD_SCRIPT_VALUE } from "../constants";

export class Config {


    public static getNpmBin() {
        return workspace.getConfiguration('npm')['bin'] || 'npm';
    }
    
    public static getDefaultBuildCommand() {
        return workspace.getConfiguration(COMMAND_PREFIX)[CONF_DEFAULT_BUILD_SCRIPT] || CONF_DEFAULT_BUILD_SCRIPT_VALUE;
    }

}