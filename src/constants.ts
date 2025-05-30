export const COMMAND_PREFIX = 'vscode-sailpoint-saas-connectivity';

export const VIEW_CONTAINER_ID = `${COMMAND_PREFIX}.view`;
export const DROP_MIME_TYPE = `application/vnd.code.tree.${COMMAND_PREFIX}.view`;

// Commands to be delegated to ISC Extension
export const ADD_TENANT = `${COMMAND_PREFIX}.add-tenant`;
export const ADD_FOLDER_ROOT = `${COMMAND_PREFIX}.folder.add-root`;
export const ADD_FOLDER = `${COMMAND_PREFIX}.folder.add`;
export const REMOVE_FOLDER = `${COMMAND_PREFIX}.folder.remove`;
export const RENAME_FOLDER = `${COMMAND_PREFIX}.folder.rename`;
export const TENANT_SET_READONLY = `${COMMAND_PREFIX}.tenant.set-readonly`;
export const TENANT_SET_WRITABLE = `${COMMAND_PREFIX}.tenant.set-writable`;

export const REFRESH = `${COMMAND_PREFIX}.refresh`;

export const START_STREAMING_LOGS = `${COMMAND_PREFIX}.sources.logs.start`;
export const STOP_STREAMING_LOGS = `${COMMAND_PREFIX}.sources.logs.stop`;

export const CREATE_CONNECTOR = `${COMMAND_PREFIX}.connector.create`;
export const RENAME_CONNECTOR = `${COMMAND_PREFIX}.connector.rename`;
export const DELETE_CONNECTOR = `${COMMAND_PREFIX}.connector.delete`;
export const UPLOAD_CONNECTOR = `${COMMAND_PREFIX}.connector.upload`;
export const DEPLOY_CONNECTOR = `${COMMAND_PREFIX}.connector.deploy`;
export const INIT_CONNECTOR = `${COMMAND_PREFIX}.connector.init`;

export const COPY_ID_CONNECTOR = `${COMMAND_PREFIX}.copy-id`;

export const CREATE_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.create`;
export const RENAME_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.rename`;
export const DELETE_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.delete`;
export const UPLOAD_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.upload`;
export const DEPLOY_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.deploy`;
export const INIT_CUSTOMIZER = `${COMMAND_PREFIX}.customizer.init`;

export const LINK_CUSTOMIZER_INSTANCE = `${COMMAND_PREFIX}.link`;
export const UNLINK_CUSTOMIZER_INSTANCE = `${COMMAND_PREFIX}.unlink`;
/////////////////////////
// Configuration
/////////////////////////

export const CONF_DEFAULT_BUILD_SCRIPT = "default.build.script"
export const CONF_DEFAULT_BUILD_SCRIPT_VALUE = 'pack-zip'