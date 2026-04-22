import { workspace } from "vscode";
import { COMMAND_PREFIX, CONF_DEFAULT_BUILD_SCRIPT, CONF_DEFAULT_BUILD_SCRIPT_VALUE, CONF_MAX_RESPONSE_BODY_KB, CONF_MAX_RESPONSE_BODY_KB_VALUE } from "../constants";

export class Config {


    public static getNpmBin() {
        return workspace.getConfiguration('npm')['bin'] || 'npm';
    }

    public static getDefaultBuildCommand() {
        return workspace.getConfiguration(COMMAND_PREFIX)
            .get(CONF_DEFAULT_BUILD_SCRIPT, CONF_DEFAULT_BUILD_SCRIPT_VALUE)
    }

    public static getMaxResponseBodyKB() {
        return workspace.getConfiguration(COMMAND_PREFIX)
            .get<number>(CONF_MAX_RESPONSE_BODY_KB, CONF_MAX_RESPONSE_BODY_KB_VALUE) * 1024;
    }

}