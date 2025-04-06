const COMMAND_PREFIX = 'vscode-sailpoint-saas-connectivity';

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
