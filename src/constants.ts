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